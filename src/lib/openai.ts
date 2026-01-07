// Cliente para chamadas às API routes (server-side)

export async function generateEMEPhrase(
  checkInData: any,
  quizData: any,
  previousPhrases: string[] = []
): Promise<{ phrase: string; insight: string }> {
  try {
    const response = await fetch('/api/generate-eme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkInData, quizData, previousPhrases })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(`Erro ao gerar frase EME: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao gerar frase EME:', error);
    return {
      phrase: 'Você está aqui. Isso já é um passo.',
      insight: 'Pequenos passos importam.'
    };
  }
}

export async function generateRadarPatterns(
  checkInData: any,
  quizData: any
): Promise<Array<{ name: string; description: string; intensity: string }>> {
  try {
    const response = await fetch('/api/generate-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkInData, quizData })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(`Erro ao gerar padrões: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.patterns || [];
  } catch (error) {
    console.error('Erro ao gerar padrões:', error);
    return [];
  }
}

export async function generateIntervention(
  emeScore: number,
  patterns: string[],
  recentInterventions: string[] = []
): Promise<any> {
  try {
    const response = await fetch('/api/generate-intervention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emeScore, patterns, recentInterventions })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(`Erro ao gerar intervenção: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao gerar intervenção:', error);
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

export async function analyzeQuizResults(responses: any[]): Promise<{ patterns: string[]; score: number }> {
  try {
    const response = await fetch('/api/analyze-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('Erro na API analyze-quiz:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Falha ao analisar quiz: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erro ao analisar quiz:', {
      message: error.message,
      name: error.name
    });
    // Retorna fallback silenciosamente
    return {
      patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
      score: 6
    };
  }
}
