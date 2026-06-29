import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  code: string | null
  type: string
  currency: string
  market: string | null
  api_symbol: string | null
  auto_update: boolean | null
  note: string | null
  created_at: string
}

export default async function ProductsPage() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm text-blue-600">
            ← 回首頁
          </Link>

          <p className="mt-4 text-red-600">
            讀取商品失敗：{error.message}
          </p>
        </div>
      </main>
    )
  }

  const products = (data || []) as Product[]

  const autoUpdateCount = products.filter((product) => product.auto_update).length
  const manualCount = products.length - autoUpdateCount

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-blue-600">
          ← 回首頁
        </Link>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">商品管理</h1>
            <p className="mt-2 text-sm text-gray-600">
              管理所有股票、ETF、基金、外幣或其他觀察商品。
            </p>
          </div>

          <Link
            href="/products/new"
            className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white"
          >
            ＋ 新增商品
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">商品數</div>
            <div className="mt-1 text-2xl font-bold">{products.length}</div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">自動更新</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {autoUpdateCount}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">手動</div>
            <div className="mt-1 text-2xl font-bold text-gray-700">
              {manualCount}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">商品清單</h2>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left">商品</th>
                    <th className="px-3 py-3 text-left">代號</th>
                    <th className="px-3 py-3 text-left">類型</th>
                    <th className="px-3 py-3 text-left">市場</th>
                    <th className="px-3 py-3 text-left">幣別</th>
                    <th className="px-3 py-3 text-left">API Symbol</th>
                    <th className="px-3 py-3 text-left">更新方式</th>
                    <th className="px-3 py-3 text-left">備註</th>
                    <th className="px-3 py-3 text-right">操作</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-b-0">
                      <td className="px-3 py-3 font-semibold">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-blue-600"
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {product.code || '—'}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {product.type}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {product.market || '—'}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {product.currency}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {product.api_symbol || '—'}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${
                          product.auto_update ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {product.auto_update ? '自動更新' : '手動'}
                      </td>

                      <td className="max-w-xs px-3 py-3 text-gray-600">
                        {product.note || '—'}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                        >
                          編輯
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              目前尚無商品，請先新增一檔商品。
            </p>
          )}
        </section>
      </div>
    </main>
  )
}