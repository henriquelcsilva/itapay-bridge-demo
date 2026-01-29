import type { NextApiRequest, NextApiResponse } from 'next'

type CustomerData = {
  full_name: string
  email: string
  type: 'individual' | 'business'
}

type BridgeCustomerResponse = {
  id: string
  full_name: string
  email: string
  type: string
  kyc_link: string
  tos_link: string
  kyc_status: string
  tos_status: string
  created_at: string
  customer_id: string
}

type ErrorResponse = {
  error: string
  details?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BridgeCustomerResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { full_name, email, type = 'individual' }: CustomerData = req.body

  if (!full_name || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'full_name and email are required'
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

    const response = await fetch(`${BRIDGE_API_URL}/v0/kyc_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': BRIDGE_API_KEY,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        full_name,
        email,
        type,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Bridge API error:', errorData)
      return res.status(response.status).json({
        error: 'Bridge API error',
        details: errorData.message || 'Failed to create customer',
      })
    }

    const data: BridgeCustomerResponse = await response.json()
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error creating customer:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
