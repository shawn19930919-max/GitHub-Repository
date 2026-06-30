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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase service role environment variables are missing' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { error: updateLogsError } = await supabase
    .from('update_logs')
    .delete()
    .eq('product_id', id)

  if (updateLogsError) {
    return NextResponse.json(
      { error: `刪除更新紀錄失敗：${updateLogsError.message}` },
      { status: 500 }
    )
  }

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
        error: '刪除失敗：沒有刪到商品，可能是商品 ID 不正確。',
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    deletedProduct: deletedProducts[0],
  })
}