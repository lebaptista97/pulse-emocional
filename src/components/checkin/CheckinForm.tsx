'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CheckinFormProps {
  onComplete: (data: CheckinData) => void;
  onBack: () => void;
}

export interface CheckinData {
  mood: number;
  stress: number;
  energy: number;
  sleep: number;
  selfCriticism: number;
}

const questions = [
  {
    id: 'mood',
    question: 'Como está seu humor hoje?',
    emojis: ['😢', '😕', '😐', '🙂', '😊']
  },
  {
    id: 'stress',
    question: 'Qual seu nível de estresse?',
    emojis: ['😌', '🙂', '😐', '😰', '😫']
  },
  {
    id: 'energy',
    question: 'Como está sua energia?',
    emojis: ['😴', '😪', '😐', '🙂', '⚡']
  },
  {
    id: 'sleep',
    question: 'Como foi seu sono?',
    emojis: ['😵', '😪', '😐', '🙂', '😴']
  },
  {
    id: 'selfCriticism',
    question: 'Como está sua autocrítica hoje?',
    emojis: ['😌', '🙂', '😐', '😔', '😞']
  }
];

export default function CheckinForm({ onComplete, onBack }: CheckinFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<CheckinData>>({});

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = {
      ...answers,
      [question.id]: value
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Todas as perguntas respondidas
      onComplete({
        mood: newAnswers.mood!,
        stress: newAnswers.stress!,
        energy: newAnswers.energy!,
        sleep: newAnswers.sleep!,
        selfCriticism: newAnswers.selfCriticism!
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mb-2">
            Pergunta {currentQuestion + 1} de {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 text-center">
            {question.question}
          </h2>

          {/* Emoji Scale */}
          <div className="flex justify-between items-center gap-2 md:gap-4 mb-4">
            {question.emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="flex-1 aspect-square flex items-center justify-center text-4xl md:text-5xl bg-gray-50 hover:bg-rose-50 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-transparent hover:border-rose-200"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
            <span>Muito baixo</span>
            <span>Muito alto</span>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Escolha o emoji que melhor representa como você está se sentindo
        </p>
      </div>
    </div>
  );
}
