'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Home from '@/components/home/Home';
import CheckinForm, { CheckinData } from '@/components/checkin/CheckinForm';
import EMEDisplay from '@/components/eme/EMEDisplay';
import History from '@/components/history/History';
import Settings from '@/components/settings/Settings';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

type View = 'home' | 'checkin' | 'eme' | 'history' | 'settings';

export default function Dashboard({ userName, onLogout }: DashboardProps) {
  const [view, setView] = useState<View>('home');
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [emeData, setEmeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Buscar userId ao montar
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
      }
    };
    getUser();
  });

  const handleCheckinComplete = async (checkinData: CheckinData) => {
    setLoading(true);
    try {
      // Enviar check-in para API
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          checkinData
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar check-in');
      }

      const data = await response.json();
      
      // Salvar dados do EME e mostrar resultado
      setEmeData(data);
      setView('eme');

    } catch (error) {
      console.error('Erro ao processar check-in:', error);
      alert('Erro ao processar check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🫀</div>
          <p className="text-gray-600">Processando seu check-in...</p>
        </div>
      </div>
    );
  }

  if (view === 'checkin') {
    return (
      <CheckinForm
        onComplete={handleCheckinComplete}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'eme' && emeData) {
    return (
      <EMEDisplay
        score={emeData.eme.score}
        phrase={emeData.eme.phrase}
        insight={emeData.eme.insight}
        streak={emeData.streak}
        onContinue={() => setView('home')}
      />
    );
  }

  if (view === 'history') {
    return (
      <History
        userId={userId}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'settings') {
    return (
      <Settings
        userName={userName}
        userEmail={userEmail}
        onBack={() => setView('home')}
        onLogout={onLogout}
      />
    );
  }

  return (
    <Home
      userName={userName}
      userId={userId}
      onStartCheckin={() => setView('checkin')}
      onViewHistory={() => setView('history')}
      onViewSettings={() => setView('settings')}
    />
  );
}
