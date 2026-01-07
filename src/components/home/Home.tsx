'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Settings, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HomeProps {
  userName: string;
  userId: string;
  onStartCheckin: () => void;
  onViewHistory: () => void;
  onViewSettings: () => void;
}

export default function Home({ userName, userId, onStartCheckin, onViewHistory, onViewSettings }: HomeProps) {
  const [lastEME, setLastEME] = useState<any>(null);
  const [streak, setStreak] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasCheckinToday, setHasCheckinToday] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Verificar se já fez check-in hoje
      const { data: todayCheckin } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      setHasCheckinToday(!!todayCheckin);

      // Buscar último EME
      const { data: eme } = await supabase
        .from('emes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      setLastEME(eme);

      // Calcular streak
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (checkins && checkins.length > 0) {
        const streakCount = calculateStreak(checkins.map(c => c.date));
        setStreak(streakCount);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;

    let streak = 1;
    const today = new Date().toISOString().split('T')[0];
    
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    
    if (sortedDates[0] !== today) return 0;

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
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🫀</div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🫀</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-sm text-gray-500">
                  Como você está hoje?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onViewHistory}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Histórico"
              >
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onViewSettings}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Check-in Button */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl shadow-sm p-8 border border-rose-100 mb-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🫀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {hasCheckinToday ? 'Check-in de hoje completo!' : 'Faça seu check-in diário'}
            </h2>
            <p className="text-gray-600 mb-6">
              {hasCheckinToday 
                ? 'Você já registrou como está se sentindo hoje'
                : 'Leva menos de 1 minuto para registrar como você está'}
            </p>
            <Button
              onClick={onStartCheckin}
              disabled={hasCheckinToday}
              className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white px-8 py-6 rounded-xl text-base font-medium shadow-lg shadow-rose-200 transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {hasCheckinToday ? '✓ Check-in realizado' : 'Fazer check-in de hoje'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Last EME Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Último EME
              </h3>
            </div>
            {lastEME ? (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl font-bold text-gray-900">
                    {lastEME.score}
                    <span className="text-lg text-gray-500">/10</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {new Date(lastEME.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {lastEME.phrase}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Faça seu primeiro check-in para ver seu EME
              </p>
            )}
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Sequência
              </h3>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl font-bold text-gray-900">
                {streak}
                <span className="text-lg text-gray-500"> {streak === 1 ? 'dia' : 'dias'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {streak > 0 
                ? `Continue assim! Você está ${streak === 1 ? 'começando' : 'mantendo'} sua jornada.`
                : 'Faça seu check-in para começar sua sequência'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Ações rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onViewHistory}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ver histórico</p>
                <p className="text-xs text-gray-500">Acompanhe sua evolução</p>
              </div>
            </button>
            <button
              onClick={onViewSettings}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Configurações</p>
                <p className="text-xs text-gray-500">Personalize sua experiência</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
