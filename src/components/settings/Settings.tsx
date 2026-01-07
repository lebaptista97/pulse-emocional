'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Lock, CreditCard, LogOut, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SettingsProps {
  userName: string;
  userEmail: string;
  userId: string;
  onBack: () => void;
  onLogout: () => void;
}

export default function Settings({ userName, userEmail, userId, onBack, onLogout }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [userId]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Erro ao carregar status da assinatura:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Assinatura cancelada com sucesso');
        loadSubscriptionStatus();
      } else {
        alert(data.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    onLogout();
  };

  const getSubscriptionStatusText = () => {
    if (!subscription) return 'Carregando...';
    
    switch (subscription.status) {
      case 'trial':
        return `Teste grátis (${subscription.daysRemaining} dias restantes)`;
      case 'active':
        return 'Assinatura ativa';
      case 'canceled':
        return 'Assinatura cancelada';
      case 'expired':
        return 'Assinatura expirada';
      default:
        return 'Plano gratuito';
    }
  };

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
            <div className="text-3xl">⚙️</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Configurações
              </h1>
              <p className="text-sm text-gray-500">
                Gerencie sua conta e preferências
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Nome</label>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Privacidade
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Dados criptografados</p>
                <p className="text-xs text-gray-500">Seus dados são protegidos</p>
              </div>
              <div className="text-green-500 text-sm">✓ Ativo</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Backup automático</p>
                <p className="text-xs text-gray-500">Seus check-ins são salvos</p>
              </div>
              <div className="text-green-500 text-sm">✓ Ativo</div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Assinatura
          </h3>
          
          {loadingSubscription ? (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-600">Carregando informações...</p>
            </div>
          ) : subscription?.hasActiveSubscription ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getSubscriptionStatusText()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {subscription.status === 'trial' 
                        ? 'Acesso completo durante o período de teste'
                        : 'R$ 29,90/mês • Acesso completo ao Pulse'}
                    </p>
                  </div>
                  <div className="text-2xl">🫀</div>
                </div>
                
                {subscription.status === 'trial' && subscription.daysRemaining !== null && (
                  <div className="bg-white/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-700">
                      <strong>Seu teste termina em {subscription.daysRemaining} {subscription.daysRemaining === 1 ? 'dia' : 'dias'}.</strong>
                      {' '}Após isso, será cobrado R$ 29,90/mês automaticamente.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-rose-500">✓</span>
                    <span>Check-ins diários ilimitados</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-rose-500">✓</span>
                    <span>Acompanhamento completo do EME</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-rose-500">✓</span>
                    <span>Histórico e gráficos de evolução</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-rose-500">✓</span>
                    <span>Intervenções personalizadas com IA</span>
                  </div>
                </div>
              </div>

              {subscription.status !== 'canceled' && (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancelar assinatura
                </Button>
              )}

              {subscription.status === 'canceled' && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assinatura cancelada</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Você ainda tem acesso até o final do período pago.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Plano Gratuito</p>
                  <p className="text-xs text-gray-600">Recursos limitados</p>
                </div>
                <div className="text-2xl">🫀</div>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Experimente o Pulse Premium por 7 dias grátis e tenha acesso a todos os recursos.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
              >
                Iniciar teste grátis
              </Button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100 mb-6">
          <h3 className="text-sm font-medium text-red-600 mb-4">
            Zona de perigo
          </h3>
          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Pulse v1.0 • Feito com 🫀 para você
          </p>
        </div>
      </main>
    </div>
  );
}
