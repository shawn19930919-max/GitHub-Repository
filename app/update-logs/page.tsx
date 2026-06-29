import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type UpdateLog = {
  id: string
  product_name: string
  api_symbol: string | null
  success: boolean
  record_date: string | null
  close_price: number | null
  error_message: string | null
  source: string
  created_at: string
}

export default async function UpdateLogsPage() {
  const { data, error } = await supabase
    .from('update_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm text-blue-600">
            ← 回首頁
          </Link>

          <p className="mt-4 text-red-600">
            讀取失敗：{error.message}
          </p>
        </div>
      </main>
    )
  }

  const logs = (data || []) as UpdateLog[]

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-blue-600">
          ← 回首頁
        </Link>

        <h1 className="mt-4 text-2xl font-bold">更新紀錄</h1>

        <p className="mt-2 text-sm text-gray-600">
          查看最近 100 筆自動或手動更新價格的結果。
        </p>

        <section className="mt-6 rounded-2xl bg-white p-4 shadow">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left">時間</th>
                    <th className="px-3 py-3 text-left">商品</th>
                    <th className="px-3 py-3 text-left">Symbol</th>
                    <th className="px-3 py-3 text-left">狀態</th>
                    <th className="px-3 py-3 text-right">收盤價</th>
                    <th className="px-3 py-3 text-left">價格日期</th>
                    <th className="px-3 py-3 text-left">來源</th>
                    <th className="px-3 py-3 text-left">錯誤原因</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="px-3 py-3 text-gray-500">
                        {new Date(log.created_at).toLocaleString('zh-TW')}
                      </td>

                      <td className="px-3 py-3 font-semibold">
                        {log.product_name}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {log.api_symbol || '—'}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${
                          log.success ? 'text-blue-600' : 'text-red-600'
                        }`}
                      >
                        {log.success ? '成功' : '失敗'}
                      </td>

                      <td className="px-3 py-3 text-right">
                        {log.close_price !== null
                          ? Number(log.close_price).toLocaleString('zh-TW', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '—'}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {log.record_date || '—'}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {log.source}
                      </td>

                      <td className="px-3 py-3 text-red-600">
                        {log.error_message || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              目前尚無更新紀錄。
            </p>
          )}
        </section>
      </div>
    </main>
  )
}