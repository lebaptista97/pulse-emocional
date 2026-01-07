import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const interventionTypes = [
  'breathing',
  'writing',
  'body_awareness',
  'micro_challenge',
  'guided_pause'
];

export async function POST(request: NextRequest) {
  try {
    const { userId, emeId, emeScore } = await request.json();

    if (!userId || !emeScore) {
      return NextResponse.json(
        { error: 'userId e emeScore são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar últimas 7 intervenções para evitar repetição
    const { data: recentInterventions } = await supabase
      .from('daily_interventions')
      .select('type, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7);

    const recentTypes = recentInterventions?.map(i => i.type) || [];
    const recentTitles = recentInterventions?.map(i => i.title) || [];

    // Gerar intervenção com IA
    const intervention = await generateInterventionWithAI(
      emeScore,
      recentTypes,
      recentTitles
    );

    // Salvar intervenção no banco
    const today = new Date().toISOString().split('T')[0];
    
    const { data: savedIntervention, error } = await supabase
      .from('daily_interventions')
      .upsert({
        user_id: userId,
        eme_id: emeId,
        date: today,
        type: intervention.type,
        title: intervention.title,
        description: intervention.description,
        duration: intervention.duration,
        instructions: intervention.instructions,
        completed: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar intervenção:', error);
    }

    return NextResponse.json({
      success: true,
      intervention
    });

  } catch (error) {
    console.error('Erro ao gerar intervenção:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar intervenção' },
      { status: 500 }
    );
  }
}

async function generateInterventionWithAI(
  emeScore: number,
  recentTypes: string[],
  recentTitles: string[]
): Promise<any> {
  try {
    // Filtrar tipos que não foram usados recentemente
    const availableTypes = interventionTypes.filter(
      type => !recentTypes.slice(0, 3).includes(type)
    );

    const selectedType = availableTypes.length > 0 
      ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
      : interventionTypes[Math.floor(Math.random() * interventionTypes.length)];

    const prompt = `Você é um assistente empático que cria intervenções breves de bem-estar emocional.

Score EME do usuário: ${emeScore}/10

Tipo de intervenção escolhido: ${selectedType}

Títulos recentes (NÃO repetir):
${recentTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Crie uma intervenção de 1-3 minutos que seja:
- Específica para o score EME (${emeScore}/10)
- Do tipo: ${selectedType}
- Com título diferente dos anteriores
- Humana e acolhedora
- Prática e acionável
- Não clínica

Tipos de intervenção:
- breathing: exercícios de respiração
- writing: escrita reflexiva curta
- body_awareness: consciência corporal
- micro_challenge: pequeno desafio positivo
- guided_pause: pausa guiada

Responda APENAS em formato JSON:
{
  "type": "${selectedType}",
  "title": "título da intervenção (máx 50 caracteres)",
  "description": "descrição breve (máx 100 caracteres)",
  "duration": número_de_minutos,
  "instructions": ["passo 1", "passo 2", "passo 3", "passo 4"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente empático especializado em bem-estar emocional. Sempre responda em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      type: result.type || selectedType,
      title: result.title || 'Respire com calma',
      description: result.description || 'Uma pausa de 2 minutos para reconectar.',
      duration: result.duration || 2,
      instructions: result.instructions || [
        'Inspire profundamente por 4 segundos',
        'Segure por 4 segundos',
        'Expire lentamente por 6 segundos',
        'Repita 5 vezes'
      ]
    };

  } catch (error) {
    console.error('Erro ao gerar intervenção com IA:', error);
    
    // Fallback
    return {
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
    };
  }
}
