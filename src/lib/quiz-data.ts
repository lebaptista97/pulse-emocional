export const quizQuestions = [
  {
    id: 1,
    text: 'Sua mente fica acelerada, difícil de desligar?',
    category: 'anxiety' as const
  },
  {
    id: 2,
    text: 'Você sente um cansaço constante, mesmo após descansar?',
    category: 'exhaustion' as const
  },
  {
    id: 3,
    text: 'Você se cobra muito ou se critica com frequência?',
    category: 'self-criticism' as const
  },
  {
    id: 4,
    text: 'Você funciona no automático, sem perceber o que sente?',
    category: 'autopilot' as const
  },
  {
    id: 5,
    text: 'Você evita pensar ou falar sobre o que te incomoda?',
    category: 'avoidance' as const
  },
  {
    id: 6,
    text: 'Você sente tensão no corpo, dores ou aperto no peito?',
    category: 'anxiety' as const
  },
  {
    id: 7,
    text: 'Você usa distrações (celular, comida, séries) para não sentir?',
    category: 'avoidance' as const
  },
  {
    id: 8,
    text: 'Você sente que precisa ser forte o tempo todo?',
    category: 'self-criticism' as const
  },
  {
    id: 9,
    text: 'Você prioriza os outros antes de cuidar de si mesma?',
    category: 'autopilot' as const
  }
];

export const answerOptions = [
  { value: 'never', label: 'Nunca', score: 0 },
  { value: 'sometimes', label: 'Às vezes', score: 1 },
  { value: 'often', label: 'Quase sempre', score: 2 },
  { value: 'always', label: 'Sempre', score: 3 }
] as const;
