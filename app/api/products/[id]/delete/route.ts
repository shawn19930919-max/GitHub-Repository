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
      { error: `刪除歷史價格失敗：${priceRecordsError.message}` },
      { status: 500 }
    )
  }

  const { data: deletedProducts, error: productError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select('id, name')

  if (productError) {
    return NextResponse.json(
      { error: `刪除商品失敗：${productError.message}` },
      { status: 500 }
    )
  }

  if (!deletedProducts || deletedProducts.length === 0) {
    return NextResponse.json(
      {
        error:
          '沒有刪到商品。可能是 Supabase delete policy 沒開，或商品 ID 不正確。',
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    deletedProduct: deletedProducts[0],
  })
}