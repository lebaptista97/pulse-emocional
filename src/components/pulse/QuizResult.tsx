'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { analyzeQuizResults } from '@/lib/openai';
import { answerOptions } from '@/lib/quiz-data';

interface QuizResultProps {
  results: Record<number, string>;
  onContinue: () => void;
}

export default function QuizResult({ results, onContinue }: QuizResultProps) {
  const [analysis, setAnalysis] = useState<{ patterns: string[]; score: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      try {
        // Converter respostas para formato analisável
        const responses = Object.entries(results).map(([questionId, answer]) => {
          const scoreMap: Record<string, number> = {
            never: 0,
            sometimes: 1,
            often: 2,
            always: 3
          };
          return {
            questionId: parseInt(questionId),
            answer,
            score: scoreMap[answer] || 0
          };
        });

        const result = await analyzeQuizResults(responses);
        setAnalysis(result);
      } catch (error: any) {
        // Erro já foi logado em openai.ts, apenas usar fallback
        setAnalysis({
          patterns: ['Exaustão', 'Autocrítica', 'Modo automático'],
          score: 6
        });
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [results]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analisando suas respostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Seu estado emocional hoje
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium mb-8">
            Você está funcionando, mas não está bem.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Padrões identificados:
          </h2>
          <ul className="space-y-3">
            {analysis?.patterns.map((pattern, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700"
              >
                <span className="text-rose-500 mt-1">•</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 mb-8">
          <p className="text-gray-800 text-center font-medium">
            Ignorar isso não faz desaparecer. Vira padrão.
          </p>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-6 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
