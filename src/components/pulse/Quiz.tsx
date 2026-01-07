'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { quizQuestions, answerOptions } from '@/lib/quiz-data';
import type { QuizAnswer } from '@/lib/types';

interface QuizProps {
  onComplete: (results: any) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const handleAnswer = (answer: QuizAnswer) => {
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Quiz completo
      setTimeout(() => {
        onComplete(newAnswers);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-4">
              Pergunta {currentQuestion + 1} de {quizQuestions.length}
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
              {question.text}
            </h2>
          </div>

          <div className="space-y-3">
            {answerOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleAnswer(option.value as QuizAnswer)}
                className="w-full py-6 text-base bg-white hover:bg-rose-50 text-gray-700 border-2 border-gray-200 hover:border-rose-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {currentQuestion > 4 && (
            <p className="text-center text-sm text-gray-500 mt-8 animate-fade-in">
              Você não está sozinha.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
