import type { NextApiRequest, NextApiResponse } from 'next'

type WalletData = {
  customer_id: string
  chain?: 'solana' | 'ethereum' | 'base'
}

type BridgeWalletResponse = {
  id: string
  chain: string
  address: string
  created_at: string
}

type ErrorResponse = {
  error: string
  details?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BridgeWalletResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customer_id, chain = 'solana' }: WalletData = req.body

  if (!customer_id) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'customer_id is required'
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
      `${BRIDGE_API_URL}/v0/customers/${customer_id}/wallets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': BRIDGE_API_KEY,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          chain,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Bridge API error:', errorData)
      return res.status(response.status).json({
        error: 'Bridge API error',
        details: errorData.message || 'Failed to create wallet',
      })
    }

    const data: BridgeWalletResponse = await response.json()
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error creating wallet:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
