'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HistoryProps {
  userId: string;
  onBack: () => void;
}

export default function History({ userId, onBack }: HistoryProps) {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      const { data } = await supabase
        .from('daily_checkins')
        .select(`
          *,
          emes (
            score,
            phrase,
            insight
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverages = () => {
    if (checkins.length === 0) return null;

    const totals = checkins.reduce((acc, c) => ({
      mood: acc.mood + c.mood,
      stress: acc.stress + c.stress,
      energy: acc.energy + c.energy,
      sleep: acc.sleep + c.sleep,
      selfCriticism: acc.self_criticism + c.selfCriticism
    }), { mood: 0, stress: 0, energy: 0, sleep: 0, selfCriticism: 0 });

    return {
      mood: (totals.mood / checkins.length).toFixed(1),
      stress: (totals.stress / checkins.length).toFixed(1),
      energy: (totals.energy / checkins.length).toFixed(1),
      sleep: (totals.sleep / checkins.length).toFixed(1),
      selfCriticism: (totals.selfCriticism / checkins.length).toFixed(1)
    };
  };

  const averages = getAverages();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📈</div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">📈</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Seu Histórico
              </h1>
              <p className="text-sm text-gray-500">
                Acompanhe sua evolução emocional
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Averages */}
        {averages && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Médias dos últimos {checkins.length} dias
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averages.mood}</p>
                <p className="text-xs text-gray-500">Humor</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averages.stress}</p>
                <p className="text-xs text-gray-500">Estresse</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averages.energy}</p>
                <p className="text-xs text-gray-500">Energia</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averages.sleep}</p>
                <p className="text-xs text-gray-500">Sono</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{averages.selfCriticism}</p>
                <p className="text-xs text-gray-500">Autocrítica</p>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100 mb-6">
          <p className="text-center text-gray-700 font-medium">
            💪 Você melhora com constância
          </p>
        </div>

        {/* Checkins List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-600">
            Check-ins recentes
          </h3>
          {checkins.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
              <p className="text-gray-500">
                Você ainda não tem check-ins registrados
              </p>
            </div>
          ) : (
            checkins.map((checkin) => (
              <div
                key={checkin.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(checkin.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                    {checkin.emes && checkin.emes.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        EME: {checkin.emes[0].score}/10
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{checkin.mood}</p>
                    <p className="text-xs text-gray-500">Humor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{checkin.stress}</p>
                    <p className="text-xs text-gray-500">Estresse</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{checkin.energy}</p>
                    <p className="text-xs text-gray-500">Energia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{checkin.sleep}</p>
                    <p className="text-xs text-gray-500">Sono</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{checkin.self_criticism}</p>
                    <p className="text-xs text-gray-500">Autocrítica</p>
                  </div>
                </div>

                {checkin.emes && checkin.emes.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {checkin.emes[0].phrase}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
