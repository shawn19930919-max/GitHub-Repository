import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  code: string | null
  type: string
  currency: string
  note: string | null
  created_at: string
}

type PriceRecord = {
  id: string
  product_id: string
  record_date: string
  close_price: number
  note: string | null
  created_at: string
}

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  const { data: records, error: recordsError } = await supabase
    .from('price_records')
    .select('*')
    .eq('product_id', id)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (productError || recordsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md">
          <Link href="/" className="text-sm text-blue-600">
            ← 回首頁
          </Link>
          

          <h1 className="mt-4 text-2xl font-bold">讀取失敗</h1>

          <p className="mt-4 text-red-600">
            {productError?.message || recordsError?.message}
          </p>
        </div>
      </main>
    )
  }

  const productData = product as Product
  const priceRecords = (records || []) as PriceRecord[]
  const latestRecord = priceRecords[0]

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-blue-600">
          ← 回首頁
        </Link>
        <Link
          href={`/products/${productData.id}/edit`}
          className="mt-3 block rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white"
        >
          編輯商品
        </Link>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">{productData.name}</h1>

          <p className="mt-1 text-sm text-gray-500">
            {productData.code || '無代號'}｜{productData.type}｜
            {productData.currency}
          </p>

          {productData.note ? (
            <p className="mt-3 text-sm text-gray-600">
              商品備註：{productData.note}
            </p>
          ) : null}
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">最新收盤價</h2>

          {latestRecord ? (
            <div className="mt-3 rounded-xl bg-gray-50 p-3">
              <div className="text-2xl font-bold">
                {latestRecord.close_price}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                日期：{latestRecord.record_date}
              </div>

              {latestRecord.note ? (
                <div className="mt-2 text-sm text-gray-600">
                  備註：{latestRecord.note}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              尚未輸入收盤價。
            </p>
          )}
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-semibold">歷史紀錄</h2>

          {priceRecords.length > 0 ? (
            <div className="space-y-3">
              {priceRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {record.record_date}
                    </span>

                    <span className="font-semibold">
                      {record.close_price}
                    </span>
                  </div>

                  {record.note ? (
                    <div className="mt-2 text-gray-500">
                      備註：{record.note}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              尚未有歷史收盤價紀錄。
            </p>
          )}
        </section>
      </div>
    </main>
  )
}