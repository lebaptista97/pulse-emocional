import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { checkInData, quizData, previousPhrases = [] } = await request.json();

    const prompt = `Você é uma assistente empática do Pulse, um app de acompanhamento emocional para mulheres.

Dados do check-in de hoje:
- Humor: ${checkInData.mood}/4
- Estresse: ${checkInData.stress}/4
- Energia: ${checkInData.energy}/4
- Sono: ${checkInData.sleep}/4
- Autocrítica: ${checkInData.selfCriticism}/4

Gere uma resposta em JSON com:
1. "phrase": Uma frase acolhedora de máximo 20 palavras sobre o estado emocional atual
2. "insight": Um insight curto e humano (máximo 15 palavras)

REGRAS CRÍTICAS:
- Seja humana, não clínica
- Não repita estas frases anteriores: ${previousPhrases.join(', ')}
- Varie o foco: corpo, mente, ritmo emocional
- Não use jargões terapêuticos
- Seja breve e acolhedora

Responda APENAS com JSON válido.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return NextResponse.json({
      phrase: result.phrase || 'Você está aqui. Isso já é um passo.',
      insight: result.insight || 'Pequenos passos importam.'
    });
  } catch (error: any) {
    console.error('Erro ao gerar frase EME:', error);
    
    return NextResponse.json({
      phrase: 'Você está aqui. Isso já é um passo.',
      insight: 'Pequenos passos importam.'
    });
  }
}
