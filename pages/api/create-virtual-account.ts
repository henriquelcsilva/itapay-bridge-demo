import type { NextApiRequest, NextApiResponse } from 'next'

type VirtualAccountData = {
  customer_id: string
  wallet_address: string
  chain?: 'solana' | 'ethereum' | 'base'
  source_currency?: 'usd' | 'eur' | 'mxn'
  destination_currency?: 'usdc' | 'usdt'
}

type BridgeVirtualAccountResponse = {
  id: string
  status: string
  developer_fee_percent: string
  customer_id: string
  created_at: string
  source_deposit_instructions: {
    currency: string
    bank_name: string
    bank_address: string
    bank_routing_number: string
    bank_account_number: string
    bank_beneficiary_name: string
    bank_beneficiary_address: string
    payment_rail: string
    payment_rails: string[]
  }
  destination: {
    currency: string
    payment_rail: string
    address: string
  }
}

type ErrorResponse = {
  error: string
  details?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BridgeVirtualAccountResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { 
    customer_id, 
    wallet_address,
    chain = 'solana',
    source_currency = 'usd',
    destination_currency = 'usdc'
  }: VirtualAccountData = req.body

  if (!customer_id || !wallet_address) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'customer_id and wallet_address are required'
    })
  }

  const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY
  const BRIDGE_API_URL = process.env.BRIDGE_API_URL || 'https://api.bridge.xyz'

  if (!BRIDGE_API_KEY) {
    return res.status(500).json({ 
      error: 'Bridge API key not configured',
      details: 'Please set BRIDGE_API_KEY environment variable'
    })
  }

  try {
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(7)}`

    const response = await fetch(
      `${BRIDGE_API_URL}/v0/customers/${customer_id}/virtual_accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': BRIDGE_API_KEY,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          source: {
            currency: source_currency,
          },
          destination: {
            payment_rail: chain,
            currency: destination_currency,
            address: wallet_address,
          },
          developer_fee_percent: "0.0",
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Bridge API error:', errorData)
      return res.status(response.status).json({
        error: 'Bridge API error',
        details: errorData.message || 'Failed to create virtual account',
      })
    }

    const data: BridgeVirtualAccountResponse = await response.json()
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error creating virtual account:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
