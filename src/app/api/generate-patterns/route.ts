import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { checkInData, quizData } = await request.json();

    const prompt = `Você é uma assistente empática do Pulse.

Dados emocionais:
- Humor: ${checkInData.mood}/4
- Estresse: ${checkInData.stress}/4
- Energia: ${checkInData.energy}/4
- Autocrítica: ${checkInData.selfCriticism}/4

Identifique até 3 padrões emocionais relevantes entre:
- Ansiedade
- Exaustão
- Autocrítica
- Evitação
- Baixa energia

Para cada padrão, retorne JSON com:
{
  "patterns": [
    {
      "name": "nome do padrão",
      "description": "descrição breve e acolhedora (máx 25 palavras)",
      "intensity": "low" | "medium" | "high"
    }
  ]
}

REGRAS:
- Tom suave, não alarmista
- Máximo 3 padrões
- Seja específica aos dados
- Não use linguagem clínica

Responda APENAS com JSON válido.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return NextResponse.json({
      patterns: result.patterns || []
    });
  } catch (error: any) {
    console.error('Erro ao gerar padrões:', error);
    
    return NextResponse.json({
      patterns: []
    });
  }
}
