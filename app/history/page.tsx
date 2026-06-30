import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0


type Product = {
  id: string
  name: string
  code: string | null
  type: string
  currency: string
}

type PriceRecord = {
  id: string
  product_id: string
  record_date: string
  close_price: number
  note: string | null
}

type PriceCell = {
  price: number
  change: number | null
  changePercent: number | null
}

function formatPrice(value: number) {
  return Number(value).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getPriceClass(change: number | null) {
  if (change === null) return 'text-gray-900'
  if (change > 0) return 'text-red-600'
  if (change < 0) return 'text-green-600'
  return 'text-gray-600'
}

export default async function HistoryPage() {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, code, type, currency')
    .order('created_at', { ascending: false })

  const { data: records, error: recordsError } = await supabase
    .from('price_records')
    .select('id, product_id, record_date, close_price, note')
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (productsError || recordsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md">
          <Link href="/" className="text-sm text-blue-600">
            ← 回首頁
          </Link>

          <h1 className="mt-4 text-2xl font-bold">歷史價格表</h1>

          <p className="mt-4 text-red-600">
            讀取失敗：{productsError?.message || recordsError?.message}
          </p>
        </div>
      </main>
    )
  }

  const productList = (products || []) as Product[]
  const recordList = (records || []) as PriceRecord[]

  const dateList = Array.from(
    new Set(recordList.map((record) => record.record_date))
  ).sort((a, b) => b.localeCompare(a))

  const recordsByProductAndDate = new Map<string, PriceRecord>()

  recordList.forEach((record) => {
    const key = `${record.product_id}_${record.record_date}`

    if (!recordsByProductAndDate.has(key)) {
      recordsByProductAndDate.set(key, record)
    }
  })

  const recordsByProduct = new Map<string, PriceRecord[]>()

  productList.forEach((product) => {
    const productRecords = recordList
      .filter((record) => record.product_id === product.id)
      .sort((a, b) => a.record_date.localeCompare(b.record_date))

    recordsByProduct.set(product.id, productRecords)
  })

  const priceMatrix = new Map<string, PriceCell>()

  productList.forEach((product) => {
    const productRecords = recordsByProduct.get(product.id) || []

    productRecords.forEach((record, index) => {
      const previousRecord = index > 0 ? productRecords[index - 1] : null
      const previousPrice = previousRecord
        ? Number(previousRecord.close_price)
        : null

      const currentPrice = Number(record.close_price)

      const change =
        previousPrice !== null ? currentPrice - previousPrice : null

      const changePercent =
        previousPrice !== null && previousPrice !== 0
          ? (change! / previousPrice) * 100
          : null

      priceMatrix.set(`${product.id}_${record.record_date}`, {
        price: currentPrice,
        change,
        changePercent,
      })
    })
  })

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-sm text-blue-600">
              ← 回首頁
            </Link>

            <h1 className="mt-2 text-2xl font-bold">歷史價格表</h1>

            <p className="mt-1 text-sm text-gray-600">
              依日期查看所有商品的每日收盤價。紅色代表上漲，綠色代表下跌。
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="text-gray-500">商品數</div>
              <div className="mt-1 text-xl font-bold">
                {productList.length}
              </div>
            </div>

            <div>
              <div className="text-gray-500">日期數</div>
              <div className="mt-1 text-xl font-bold">
                {dateList.length}
              </div>
            </div>

            <div>
              <div className="text-gray-500">價格筆數</div>
              <div className="mt-1 text-xl font-bold">
                {recordList.length}
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">每日收盤價矩陣</h2>

            <Link
              href="/records/new"
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white"
            >
              ＋ 新增收盤價
            </Link>
          </div>

          {productList.length === 0 ? (
            <p className="text-sm text-gray-500">
              尚未新增商品，請先新增商品。
            </p>
          ) : dateList.length === 0 ? (
            <p className="text-sm text-gray-500">
              尚未新增任何收盤價紀錄。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left font-semibold">
                      日期
                    </th>

                    {productList.map((product) => (
                      <th
                        key={product.id}
                        className="min-w-32 px-3 py-3 text-right font-semibold"
                      >
                        <div>{product.name}</div>
                        <div className="text-xs font-normal text-gray-500">
                          {product.code || '無代號'}｜{product.currency}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {dateList.map((date) => (
                    <tr key={date} className="border-b last:border-b-0">
                      <td className="sticky left-0 z-10 bg-white px-3 py-3 font-medium">
                        {date}
                      </td>

                      {productList.map((product) => {
                        const cell = priceMatrix.get(`${product.id}_${date}`)

                        if (!cell) {
                          return (
                            <td
                              key={product.id}
                              className="px-3 py-3 text-right text-gray-300"
                            >
                              —
                            </td>
                          )
                        }

                        return (
                          <td
                            key={product.id}
                            className={`px-3 py-3 text-right font-semibold ${getPriceClass(
                              cell.change
                            )}`}
                          >
                            <div>{formatPrice(cell.price)}</div>

                            {cell.change !== null ? (
                              <div className="mt-1 text-xs">
                                {cell.change > 0 ? '+' : ''}
                                {formatPrice(cell.change)}
                                {cell.changePercent !== null ? (
                                  <>
                                    {' '}
                                    (
                                    {cell.changePercent > 0 ? '+' : ''}
                                    {cell.changePercent.toFixed(2)}%)
                                  </>
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-gray-400">
                                首筆
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}