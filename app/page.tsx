import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import UpdatePricesButton from '@/components/UpdatePricesButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Product = {
  id: string
  name: string
  code: string | null
  type: string
  currency: string
  api_symbol: string | null
  market: string | null
  auto_update: boolean | null
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

type MarketRow = {
  product: Product
  latestRecord: PriceRecord | null
  previousRecord: PriceRecord | null
  change: number | null
  changePercent: number | null
}

function formatPrice(value: number) {
  return Number(value).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getChangeClass(change: number | null) {
  if (change === null) return 'text-gray-500'
  if (change > 0) return 'text-red-600'
  if (change < 0) return 'text-green-600'
  return 'text-gray-600'
}

function formatChange(change: number | null) {
  if (change === null) return '—'

  const sign = change > 0 ? '+' : ''
  return `${sign}${formatPrice(change)}`
}

function formatChangePercent(changePercent: number | null) {
  if (changePercent === null) return '—'

  const sign = changePercent > 0 ? '+' : ''
  return `${sign}${changePercent.toFixed(2)}%`
}

export default async function HomePage() {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: priceRecords, error: priceRecordsError } = await supabase
    .from('price_records')
    .select('*')
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (productsError || priceRecordsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold">商品收盤價紀錄</h1>

          <p className="mt-4 text-red-600">
            讀取失敗：
            {productsError?.message || priceRecordsError?.message}
          </p>
        </div>
      </main>
    )
  }

  const productList = (products || []) as Product[]
  const recordList = (priceRecords || []) as PriceRecord[]

  const recordsByProduct = new Map<string, PriceRecord[]>()

  productList.forEach((product) => {
    const records = recordList
      .filter((record) => record.product_id === product.id)
      .sort((a, b) => b.record_date.localeCompare(a.record_date))

    recordsByProduct.set(product.id, records)
  })

  const marketRows: MarketRow[] = productList.map((product) => {
    const records = recordsByProduct.get(product.id) || []

    const latestRecord = records[0] || null
    const previousRecord = records[1] || null

    const latestPrice = latestRecord ? Number(latestRecord.close_price) : null
    const previousPrice = previousRecord ? Number(previousRecord.close_price) : null

    const change =
      latestPrice !== null && previousPrice !== null
        ? latestPrice - previousPrice
        : null

    const changePercent =
      change !== null && previousPrice !== null && previousPrice !== 0
        ? (change / previousPrice) * 100
        : null

    return {
      product,
      latestRecord,
      previousRecord,
      change,
      changePercent,
    }
  })

  const upCount = marketRows.filter(
    (row) => row.change !== null && row.change > 0
  ).length

  const downCount = marketRows.filter(
    (row) => row.change !== null && row.change < 0
  ).length

  const flatCount = marketRows.filter(
    (row) => row.change !== null && row.change === 0
  ).length

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-bold">全球市場總覽</h1>

        <p className="mb-6 text-sm text-gray-600">
          快速查看所有商品的最新收盤價、漲跌與漲跌幅。紅色代表上漲，綠色代表下跌。
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Link
            href="/products/new"
            className="rounded-2xl bg-black p-4 text-center text-white shadow"
        >
            ＋ 新增商品
        </Link>
        <Link
            href="/products"
            className="rounded-2xl bg-white p-4 text-center font-semibold text-gray-900 shadow"
        >
          商品管理
        </Link>
        <Link
          href="/records/new"
          className="rounded-2xl bg-blue-600 p-4 text-center text-white shadow"
        >
          ＋ 新增收盤價
        </Link>

        <Link
          href="/update-logs"
          className="rounded-2xl bg-white p-4 text-center font-semibold text-gray-900 shadow"
        >
          更新紀錄
        </Link>

        <Link
          href="/history"
          className="rounded-2xl bg-white p-4 text-center font-semibold text-gray-900 shadow"
        >
          歷史價格表
        </Link>
      </div>

     

        <div className="mb-6">
          <UpdatePricesButton />
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">商品數</div>
            <div className="mt-1 text-xl font-bold">{productList.length}</div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">上漲</div>
            <div className="mt-1 text-xl font-bold text-red-600">
              {upCount}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">下跌</div>
            <div className="mt-1 text-xl font-bold text-green-600">
              {downCount}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">持平</div>
            <div className="mt-1 text-xl font-bold text-gray-600">
              {flatCount}
            </div>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">市場列表</h2>

            <span className="text-xs text-gray-500">依新增時間排序</span>
          </div>

          {marketRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left font-semibold">
                      商品
                    </th>

                    <th className="px-3 py-3 text-left font-semibold">
                      市場
                    </th>

                    <th className="px-3 py-3 text-left font-semibold">
                      類型
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      最新價
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      漲跌
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      漲跌幅
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      日期
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {marketRows.map((row) => {
                    const latestPrice = row.latestRecord
                      ? Number(row.latestRecord.close_price)
                      : null

                    return (
                      <tr
                        key={row.product.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-3 py-3">
                          <Link
                            href={`/products/${row.product.id}`}
                            className="block"
                          >
                            <div className="font-semibold">
                              {row.product.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {row.product.code || '無代號'}｜{row.product.currency}
                            </div>
                          </Link>
                        </td>

                        <td className="px-3 py-3 text-gray-600">
                          <div>{row.product.market || '—'}</div>

                          <div className="text-xs text-gray-400">
                            {row.product.api_symbol || '無 API 代號'}
                          </div>

                          <div
                            className={`mt-1 text-xs ${
                              row.product.auto_update
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {row.product.auto_update ? '自動更新' : '手動'}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-gray-600">
                          {row.product.type}
                        </td>

                        <td className="px-3 py-3 text-right font-semibold">
                          {latestPrice !== null ? formatPrice(latestPrice) : '—'}
                        </td>

                        <td
                          className={`px-3 py-3 text-right font-semibold ${getChangeClass(
                            row.change
                          )}`}
                        >
                          {formatChange(row.change)}
                        </td>

                        <td
                          className={`px-3 py-3 text-right font-semibold ${getChangeClass(
                            row.change
                          )}`}
                        >
                          {formatChangePercent(row.changePercent)}
                        </td>

                        <td className="px-3 py-3 text-right text-gray-500">
                          {row.latestRecord?.record_date || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              尚未新增商品，請先新增一檔商品。
            </p>
          )}
        </section>
      </div>
    </main>
  )
}