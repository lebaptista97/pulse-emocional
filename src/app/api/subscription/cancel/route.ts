import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID não fornecido' },
        { status: 400 }
      );
    }

    // Buscar subscription no banco
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    // Cancelar no Stripe
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erro ao atualizar banco:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao cancelar assinatura' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
    });

  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao cancelar' },
      { status: 500 }
    );
  }
}
