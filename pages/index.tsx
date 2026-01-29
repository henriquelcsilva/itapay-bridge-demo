import { useState } from 'react'
import Head from 'next/head'

type CustomerResponse = {
  id: string
  customer_id: string
  full_name: string
  email: string
  kyc_link: string
  kyc_status: string
}

type WalletResponse = {
  id: string
  chain: string
  address: string
  created_at: string
}

type VirtualAccountResponse = {
  id: string
  source_deposit_instructions: {
    bank_name: string
    bank_routing_number: string
    bank_account_number: string
    bank_beneficiary_name: string
  }
  destination: {
    address: string
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  
  const [customerData, setCustomerData] = useState<CustomerResponse | null>(null)
  const [walletData, setWalletData] = useState<WalletResponse | null>(null)
  const [virtualAccountData, setVirtualAccountData] = useState<VirtualAccountResponse | null>(null)
  
  const [error, setError] = useState<string | null>(null)

  const createCustomer = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          type: 'individual',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create customer')
      }

      const data = await response.json()
      setCustomerData(data)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async () => {
    if (!customerData) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerData.customer_id,
          chain: 'solana',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create wallet')
      }

      const data = await response.json()
      setWalletData(data)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createVirtualAccount = async () => {
    if (!customerData || !walletData) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/create-virtual-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerData.customer_id,
          wallet_address: walletData.address,
          chain: 'solana',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create virtual account')
      }

      const data = await response.json()
      setVirtualAccountData(data)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setCustomerData(null)
    setWalletData(null)
    setVirtualAccountData(null)
    setError(null)
    setFullName('')
    setEmail('')
  }

  return (
    <>
      <Head>
        <title>ItaPay - Bridge Integration Demo</title>
        <meta name="description" content="Demo da integração ItaPay com Bridge.xyz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ItaPay × Bridge.xyz
            </h1>
            <p className="text-xl text-gray-600">
              Demo de Integração - Onboarding Completo
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erro</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {num}
                  </div>
                  {num < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > num ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Customer</span>
              <span>Wallet</span>
              <span>Virtual Account</span>
              <span>Complete</span>
            </div>
          </div>

          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Passo 1: Criar Customer
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="João Silva"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={createCustomer}
                  disabled={loading || !fullName || !email}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Criando...' : 'Criar Customer na Bridge'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && customerData && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ Customer Criado!
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700"><strong>Customer ID:</strong> {customerData.customer_id}</p>
                <p className="text-sm text-gray-700"><strong>Nome:</strong> {customerData.full_name}</p>
                <p className="text-sm text-gray-700"><strong>Email:</strong> {customerData.email}</p>
                <p className="text-sm text-gray-700"><strong>KYC Status:</strong> {customerData.kyc_status}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ⚠️ Ação Necessária
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Para continuar, você precisa completar seu cadastro e aceitar os termos de serviço da Bridge.
                </p>
                <div className="space-y-2">
                  <a
                    href={customerData.tos_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
                  >
                    1. Aceitar Termos de Serviço →
                  </a>
                  <a
                    href={customerData.kyc_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition text-center"
                  >
                    2. Completar Cadastro (KYC) →
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Após completar, volte aqui e continue para o próximo passo
                </p>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Passo 2: Criar USDC Wallet
              </h3>
              <button
                onClick={createWallet}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Criando...' : 'Criar Wallet Solana/USDC'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ⚠️ Wallet só será criada se o KYC estiver aprovado
              </p>
            </div>
          )}

          {step === 3 && walletData && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ Wallet USDC Criada!
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700"><strong>Wallet ID:</strong> {walletData.id}</p>
                <p className="text-sm text-gray-700"><strong>Chain:</strong> {walletData.chain}</p>
                <p className="text-sm text-gray-700 break-all"><strong>Address:</strong> {walletData.address}</p>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Passo 3: Criar Virtual Account USD
              </h3>
              <button
                onClick={createVirtualAccount}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Criando...' : 'Criar Conta USD'}
              </button>
            </div>
          )}

          {step === 4 && virtualAccountData && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  🎉 Integração Completa!
                </h2>
                <p className="text-gray-600">
                  Cliente pode receber USD nesta conta bancária
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dados Bancários USD</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Banco:</span>
                    <span className="font-medium">{virtualAccountData.source_deposit_instructions.bank_name}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Routing Number:</span>
                    <span className="font-mono font-medium">{virtualAccountData.source_deposit_instructions.bank_routing_number}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono font-medium">{virtualAccountData.source_deposit_instructions.bank_account_number}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Beneficiary:</span>
                    <span className="font-medium">{virtualAccountData.source_deposit_instructions.bank_beneficiary_name}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wallet USDC (Destino)</h3>
                <p className="text-sm text-gray-600 mb-2">USD recebidos são convertidos automaticamente para USDC neste endereço:</p>
                <p className="font-mono text-xs bg-white p-3 rounded border break-all">
                  {virtualAccountData.destination.address}
                </p>
              </div>

              <button
                onClick={reset}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Testar Novamente
              </button>
            </div>
          )}

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>ItaPay Corp © 2026 - Powered by Bridge.xyz</p>
            <p className="mt-1">Demo em ambiente Sandbox</p>
          </div>
        </div>
      </main>
    </>
  )
}
