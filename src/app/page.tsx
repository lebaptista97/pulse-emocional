'use client'

import { useState } from 'react'
import SignupForm from '@/components/auth/SignupForm'

export default function Page() {
  const [step, setStep] = useState('login')
  const [isNewUser, setIsNewUser] = useState(false)

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🫀</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Crie sua conta
            </h1>
            <p className="text-sm text-gray-600">
              Cancele quando quiser
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <SignupForm
              onSuccess={() => {
                setIsNewUser(true);
              }}
              onEmailConfirmationNeeded={() => {
                setStep('login');
              }}
            />
            
            <div className="text-center mt-4">
              <button
                onClick={() => setStep('login')}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium"
              >
                Já tem conta? Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default to login step
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🫀</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-600">
            Entre na sua conta
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Login form would go here */}
          <div className="text-center mt-4">
            <button
              onClick={() => setStep('signup')}
              className="text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              Não tem conta? Criar conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}