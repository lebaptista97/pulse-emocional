import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID não fornecido' },
        { status: 400 }
      );
    }

    // Buscar subscription no banco
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar dados' },
        { status: 500 }
      );
    }

    // Se não tem subscription, retornar status free
    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: {
          status: 'free',
          hasActiveSubscription: false,
        },
      });
    }

    // Verificar se o trial expirou
    const now = new Date();
    const trialEnd = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;
    
    let currentStatus = subscription.status;
    if (subscription.status === 'trial' && trialEnd && now > trialEnd) {
      currentStatus = 'active'; // Trial expirou, agora é assinatura ativa
      
      // Atualizar status no banco
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        status: currentStatus,
        hasActiveSubscription: ['trial', 'active'].includes(currentStatus),
        daysRemaining: trialEnd && currentStatus === 'trial' 
          ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
      },
    });

  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
