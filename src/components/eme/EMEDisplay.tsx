'use client';

import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Calendar } from 'lucide-react';

interface EMEDisplayProps {
  score: number;
  phrase: string;
  insight: string;
  streak: number;
  onContinue: () => void;
}

export default function EMEDisplay({ score, phrase, insight, streak, onContinue }: EMEDisplayProps) {
  // Determinar cor baseada no score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-400 to-emerald-500';
    if (score >= 6) return 'from-blue-400 to-cyan-500';
    if (score >= 4) return 'from-yellow-400 to-orange-500';
    return 'from-rose-400 to-pink-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Bom';
    if (score >= 4) return 'Moderado';
    return 'Precisa de atenção';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* EME Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-6">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🫀</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Seu Estado Mental Essencial
            </h1>
            <p className="text-sm text-gray-500">
              Baseado no seu check-in de hoje
            </p>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center mb-8">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center shadow-lg`}>
              <div className="text-center">
                <div className="text-5xl font-bold text-white">{score}</div>
                <div className="text-xs text-white/90">de 10</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              {getScoreText(score)}
            </p>
          </div>

          {/* AI Generated Phrase */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 mb-6 border border-rose-100">
            <p className="text-lg text-gray-800 text-center leading-relaxed">
              {phrase}
            </p>
          </div>

          {/* Insight */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 text-center">
              💡 {insight}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{streak}</p>
              <p className="text-xs text-gray-600">dias consecutivos</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">+{Math.round(score * 10)}%</p>
              <p className="text-xs text-gray-600">consciência emocional</p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-6 rounded-xl text-base font-medium shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl"
          >
            Ver intervenção do dia
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-xs text-gray-400">
          Este não é um diagnóstico médico. É uma ferramenta de autoconhecimento.
        </p>
      </div>
    </div>
  );
}
