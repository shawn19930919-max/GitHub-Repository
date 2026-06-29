import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      { error: 'Missing product id' },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are missing' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { error: priceRecordsError } = await supabase
    .from('price_records')
    .delete()
    .eq('product_id', id)

  if (priceRecordsError) {
    return NextResponse.json(
      { error: priceRecordsError.message },
      { status: 500 }
    )
  }

  const { error: productError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (productError) {
    return NextResponse.json(
      { error: productError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}