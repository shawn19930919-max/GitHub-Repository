import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Product = {
  id: string
  name: string
  api_symbol: string | null
  auto_update: boolean | null
}

type TwelveDataEodResponse = {
  symbol?: string
  exchange?: string
  datetime?: string
  close?: string
  error?: string
  message?: string
  status?: string
}

export async function POST(request: NextRequest) {
  const requestSecret = request.headers.get('x-update-secret')
  const expectedSecret = process.env.UPDATE_PRICES_SECRET

  if (!expectedSecret || requestSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are missing' },
      { status: 500 }
    )
  }

  if (!twelveDataApiKey) {
    return NextResponse.json(
      { error: 'TWELVE_DATA_API_KEY is missing' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, api_symbol, auto_update')
    .eq('auto_update', true)
    .not('api_symbol', 'is', null)

  if (productsError) {
    return NextResponse.json(
      { error: productsError.message },
      { status: 500 }
    )
  }

  const results = []

  for (const product of (products || []) as Product[]) {
    if (!product.api_symbol) continue

    const url = new URL('https://api.twelvedata.com/eod')
    url.searchParams.set('symbol', product.api_symbol)
    url.searchParams.set('apikey', twelveDataApiKey)

    try {
      const response = await fetch(url.toString(), {
        cache: 'no-store',
      })

      const data = (await response.json()) as TwelveDataEodResponse

      if (!response.ok || data.status === 'error' || data.error || data.message) {
        results.push({
          product: product.name,
          symbol: product.api_symbol,
          success: false,
          error: data.error || data.message || 'API request failed',
        })
        continue
      }

      if (!data.datetime || !data.close) {
        results.push({
          product: product.name,
          symbol: product.api_symbol,
          success: false,
          error: 'Missing datetime or close price',
        })
        continue
      }

      const closePrice = Number(data.close)

      if (Number.isNaN(closePrice) || closePrice <= 0) {
        results.push({
          product: product.name,
          symbol: product.api_symbol,
          success: false,
          error: 'Invalid close price',
        })
        continue
      }

      const { error: upsertError } = await supabase
        .from('price_records')
        .upsert(
          {
            product_id: product.id,
            record_date: data.datetime,
            close_price: closePrice,
            note: `Auto updated from Twelve Data. Symbol: ${product.api_symbol}`,
          },
          {
            onConflict: 'product_id,record_date',
          }
        )

      if (upsertError) {
        results.push({
          product: product.name,
          symbol: product.api_symbol,
          success: false,
          error: upsertError.message,
        })
        continue
      }

      results.push({
        product: product.name,
        symbol: product.api_symbol,
        date: data.datetime,
        close: closePrice,
        success: true,
      })
    } catch (error) {
      results.push({
        product: product.name,
        symbol: product.api_symbol,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    updatedCount: results.filter((result) => result.success).length,
    totalCount: results.length,
    results,
  })
}