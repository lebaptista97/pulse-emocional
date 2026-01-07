'use client';

import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Activity, AlertCircle, Clock, Zap } from 'lucide-react';

interface PulseIntroProps {
  onContinue: () => void;
}

export default function PulseIntro({ onContinue }: PulseIntroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-pulse">🫀</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Conheça o Pulse
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Acompanhamento emocional diário
          </p>
        </div>

        {/* Banner de Urgência */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-400 rounded-xl p-4 mb-6 shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Ignorar seus sinais emocionais não os faz desaparecer
              </p>
              <p className="text-xs text-orange-700">
                Cada dia sem acompanhamento é um padrão se formando
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Check-in diário
                </h3>
                <p className="text-sm text-gray-600">
                  Registre como você está em menos de 2 minutos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  EME (Estado Mental Essencial)
                </h3>
                <p className="text-sm text-gray-600">
                  Seu indicador emocional diário, claro e acompanhável
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Radar emocional
                </h3>
                <p className="text-sm text-gray-600">
                  Identifique padrões antes que virem hábito
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Urgência com Estatística */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border border-rose-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">21 dias</p>
              <p className="text-sm text-gray-600">para formar um novo hábito emocional</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
            <Zap className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Quanto mais você espera, mais difícil fica.</span> Comece hoje e veja mudanças reais em 3 semanas.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="space-y-2 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <span className="text-rose-500">✗</span>
              <span>Não é terapia</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-rose-500">✗</span>
              <span>Não é motivação vazia</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>É acompanhamento real do seu estado emocional</span>
            </p>
          </div>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-6 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          Quero começar a cuidar de mim agora
        </Button>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          Trial gratuito • Cancele quando quiser
        </p>
      </div>
    </div>
  );
}
