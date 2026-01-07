import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { emeScore, patterns, recentInterventions = [] } = await request.json();

    const prompt = `Você é uma assistente empática do Pulse.

Estado emocional atual (EME): ${emeScore}/10
Padrões identificados: ${patterns.join(', ')}
Intervenções recentes (NÃO repetir): ${recentInterventions.join(', ')}

Escolha e adapte UMA intervenção de 1-3 minutos entre:
- Respiração guiada
- Escrita reflexiva curta
- Consciência corporal
- Micro-desafio
- Pausa guiada

Retorne JSON:
{
  "type": "breathing" | "writing" | "body-awareness" | "micro-challenge" | "guided-pause",
  "title": "título acolhedor",
  "description": "convite personalizado (máx 30 palavras)",
  "duration": número em minutos,
  "instructions": ["passo 1", "passo 2", "passo 3"]
}

REGRAS:
- Adapte ao estado emocional atual
- Seja prática e simples
- Tom humano e acolhedor
- Nunca repita intervenções recentes

Responda APENAS com JSON válido.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao gerar intervenção:', error);
    
    return NextResponse.json({
      type: 'breathing',
      title: 'Respire com calma',
      description: 'Uma pausa de 2 minutos para reconectar com sua respiração.',
      duration: 2,
      instructions: [
        'Inspire profundamente por 4 segundos',
        'Segure por 4 segundos',
        'Expire lentamente por 6 segundos',
        'Repita 5 vezes'
      ]
    });
  }
}
