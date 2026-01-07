import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, cardNumber, cardExpiry, cardCvc, cardName } = await request.json();

    // Validar dados
    if (!userId || !userEmail || !cardNumber || !cardExpiry || !cardCvc || !cardName) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar customer no Stripe
    const customer = await stripe.customers.create({
      email: userEmail,
      name: cardName,
      metadata: {
        userId,
      },
    });

    // Criar payment method
    const [expMonth, expYear] = cardExpiry.split('/');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: parseInt(expMonth),
        exp_year: parseInt('20' + expYear),
        cvc: cardCvc,
      },
    });

    // Anexar payment method ao customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    // Definir como método de pagamento padrão
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Criar subscription com trial de 7 dias
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID || '', // Você precisa criar um Price no Stripe
        },
      ],
      trial_period_days: 7,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    // Salvar no Supabase
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trial',
        trial_start_date: trialStartDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_payment_method_id: paymentMethod.id,
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Cancelar subscription no Stripe se falhar no banco
      await stripe.subscriptions.cancel(subscription.id);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar dados' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trialEndDate: trialEndDate.toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao iniciar trial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
