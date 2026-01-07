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

export async function POST(request: NextRequest) {
  try {
    const { userId, checkinData } = await request.json();

    if (!userId || !checkinData) {
      return NextResponse.json(
        { error: 'userId e checkinData são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Salvar check-in no banco
    const today = new Date().toISOString().split('T')[0];
    
    const { data: checkin, error: checkinError } = await supabase
      .from('daily_checkins')
      .upsert({
        user_id: userId,
        date: today,
        mood: checkinData.mood,
        stress: checkinData.stress,
        energy: checkinData.energy,
        sleep: checkinData.sleep,
        self_criticism: checkinData.selfCriticism,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (checkinError) {
      console.error('Erro ao salvar check-in:', checkinError);
      return NextResponse.json(
        { error: 'Erro ao salvar check-in' },
        { status: 500 }
      );
    }

    // 2. Calcular score EME (0-10)
    const emeScore = calculateEMEScore(checkinData);

    // 3. Buscar últimas 7 frases para evitar repetição
    const { data: recentPhrases } = await supabase
      .from('ai_phrase_history')
      .select('phrase')
      .eq('user_id', userId)
      .eq('type', 'eme')
      .order('created_at', { ascending: false })
      .limit(7);

    const previousPhrases = recentPhrases?.map(p => p.phrase) || [];

    // 4. Gerar frase e insight com IA
    const { phrase, insight } = await generateEMEWithAI(checkinData, emeScore, previousPhrases);

    // 5. Salvar EME no banco
    const { data: eme, error: emeError } = await supabase
      .from('emes')
      .upsert({
        user_id: userId,
        checkin_id: checkin.id,
        date: today,
        score: emeScore,
        phrase,
        insight,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (emeError) {
      console.error('Erro ao salvar EME:', emeError);
    }

    // 6. Salvar frase no histórico (anti-repetição)
    await supabase
      .from('ai_phrase_history')
      .insert({
        user_id: userId,
        phrase,
        type: 'eme',
        created_at: new Date().toISOString()
      });

    // 7. Calcular streak
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    const streak = calculateStreak(checkins?.map(c => c.date) || []);

    return NextResponse.json({
      success: true,
      eme: {
        id: eme?.id,
        score: emeScore,
        phrase,
        insight
      },
      streak
    });

  } catch (error) {
    console.error('Erro ao processar check-in:', error);
    return NextResponse.json(
      { error: 'Erro ao processar check-in' },
      { status: 500 }
    );
  }
}

function calculateEMEScore(data: any): number {
  // Fórmula para calcular score de 0-10
  // Mood e Energy são positivos, Stress e SelfCriticism são negativos
  const moodScore = data.mood * 2; // 0-8
  const energyScore = data.energy * 1.5; // 0-6
  const stressScore = (4 - data.stress) * 1.5; // 0-6 (invertido)
  const sleepScore = data.sleep * 1; // 0-4
  const criticismScore = (4 - data.selfCriticism) * 1.5; // 0-6 (invertido)

  const total = moodScore + energyScore + stressScore + sleepScore + criticismScore;
  const maxScore = 30;
  
  // Normalizar para 0-10
  const normalized = Math.round((total / maxScore) * 10);
  return Math.max(0, Math.min(10, normalized));
}

async function generateEMEWithAI(
  checkinData: any,
  score: number,
  previousPhrases: string[]
): Promise<{ phrase: string; insight: string }> {
  try {
    const prompt = `Você é um assistente empático que ajuda pessoas a entenderem seu estado emocional.

Dados do check-in de hoje:
- Humor: ${checkinData.mood}/4
- Estresse: ${checkinData.stress}/4
- Energia: ${checkinData.energy}/4
- Sono: ${checkinData.sleep}/4
- Autocrítica: ${checkinData.selfCriticism}/4

Score EME calculado: ${score}/10

Frases anteriores (NÃO repetir):
${previousPhrases.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Gere:
1. Uma frase principal (máximo 20 palavras) que seja:
   - Humana e acolhedora
   - Específica para os dados acima
   - Diferente das frases anteriores
   - Não clínica, não robótica
   - Focada em corpo, mente ou ritmo (varie o foco)

2. Um insight curto (máximo 15 palavras) que seja:
   - Prático e acionável
   - Encorajador
   - Concreto

Responda APENAS em formato JSON:
{
  "phrase": "sua frase aqui",
  "insight": "seu insight aqui"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente empático especializado em saúde emocional. Sempre responda em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      phrase: result.phrase || 'Você está aqui. Isso já é um passo.',
      insight: result.insight || 'Pequenos passos importam.'
    };

  } catch (error) {
    console.error('Erro ao gerar EME com IA:', error);
    return {
      phrase: 'Você está aqui. Isso já é um passo.',
      insight: 'Pequenos passos importam.'
    };
  }
}

function calculateStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 1;

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  
  // Ordenar datas em ordem decrescente
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  
  // Verificar se tem check-in hoje
  if (sortedDates[0] !== today) return 1;

  // Contar dias consecutivos
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
