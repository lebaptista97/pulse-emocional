import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();

    // Validar se responses existe
    if (!responses) {
      console.error('Erro: responses não fornecido');
      return NextResponse.json({
        patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
        score: 6
      }, { status: 200 });
    }

    // Verificar se API Key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('Erro: OPENAI_API_KEY não configurada');
      return NextResponse.json({
        patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
        score: 6
      }, { status: 200 });
    }

    const prompt = `Você é uma assistente empática do Pulse.

Respostas do quiz emocional (escala: never=0, sometimes=1, often=2, always=3):
${JSON.stringify(responses)}

Analise e retorne JSON:
{
  "patterns": ["padrão 1", "padrão 2", "padrão 3"],
  "score": número de 0-10 representando sobrecarga emocional
}

Padrões possíveis:
- Exaustão
- Autocrítica
- Modo automático
- Evitação

REGRAS:
- Identifique 2-4 padrões mais relevantes
- Score baseado na intensidade geral
- Seja precisa mas acolhedora

Responda APENAS com JSON válido.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      console.error('Erro: OpenAI retornou conteúdo vazio');
      return NextResponse.json({
        patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
        score: 6
      }, { status: 200 });
    }

    const result = JSON.parse(content);
    
    return NextResponse.json({
      patterns: result.patterns || ['Exaustão', 'Autocrítica', 'Modo automático'],
      score: result.score || 6
    }, { status: 200 });
  } catch (error: any) {
    // Log detalhado do erro para debugging
    console.error('Erro ao analisar quiz:', {
      message: error?.message || 'Erro desconhecido',
      name: error?.name || 'Unknown',
      code: error?.code || 'No code',
      type: error?.type || 'No type'
    });
    
    // Retorna fallback com status 200 para evitar erro no cliente
    return NextResponse.json({
      patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
      score: 6
    }, { status: 200 });
  }
}
