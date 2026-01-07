'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, X, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function TrialModal({ isOpen, onClose, userId, userEmail }: TrialModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'offer' | 'payment' | 'success'>('offer');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const handleStartTrial = () => {
    setStep('payment');
  };

  const handleSkip = () => {
    onClose();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscription/start-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry,
          cardCvc,
          cardName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        alert(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'offer' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Experimente 7 dias grátis!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Tenha acesso completo ao Pulse por 7 dias sem pagar nada
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 p-4 border border-rose-100">
                <h3 className="font-semibold text-gray-900 mb-3">O que você ganha:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>Check-ins diários ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>Acompanhamento do seu EME (Estado Mental e Emocional)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>Histórico completo e gráficos de evolução</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>Intervenções personalizadas com IA</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Apenas R$ 29,90/mês</strong> após o período de teste.
                  Cancele quando quiser, sem compromisso.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleStartTrial}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
              >
                Começar teste grátis
              </Button>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full text-gray-600"
              >
                Agora não
              </Button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Dados do cartão
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Não faremos nenhuma cobrança nos próximos 7 dias
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitPayment} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Nome no cartão</Label>
                <Input
                  id="cardName"
                  placeholder="João Silva"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Validade</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVV</Label>
                  <Input
                    id="cardCvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-100">
                <p className="text-xs text-gray-700">
                  🔒 Seus dados estão seguros. A cobrança de R$ 29,90 só será feita após 7 dias.
                  Você pode cancelar a qualquer momento.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
                >
                  {loading ? 'Processando...' : 'Confirmar e iniciar teste'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('offer')}
                  variant="ghost"
                  className="w-full text-gray-600"
                  disabled={loading}
                >
                  Voltar
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Teste ativado!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Aproveite seus 7 dias grátis do Pulse
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 text-center">
              <p className="text-sm text-gray-600">
                Você tem até <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</strong> para
                aproveitar todos os recursos sem pagar nada.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
