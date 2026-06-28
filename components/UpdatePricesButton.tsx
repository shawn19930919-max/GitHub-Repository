'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UpdateResult = {
  product: string
  symbol: string
  date?: string
  close?: number
  success: boolean
  error?: string
}

type UpdateResponse = {
  updatedCount: number
  totalCount: number
  results: UpdateResult[]
  error?: string
}

export default function UpdatePricesButton() {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [results, setResults] = useState<UpdateResult[]>([])
  const [summary, setSummary] = useState('')

  async function handleUpdate() {
    const confirmed = confirm('確定要更新所有啟用自動更新的商品價格嗎？')

    if (!confirmed) return

    setIsUpdating(true)
    setResults([])
    setSummary('')

    try {
      const response = await fetch('/api/update-prices', {
        method: 'POST',
        headers: {
          'x-update-secret': 'my-price-update-secret-2026',
        },
      })

      const data = (await response.json()) as UpdateResponse

      if (!response.ok) {
        alert(`更新失敗：${data.error || '未知錯誤'}`)
        return
      }

      setResults(data.results || [])
      setSummary(`成功 ${data.updatedCount} / 共 ${data.totalCount} 檔`)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '更新失敗')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleUpdate}
        disabled={isUpdating}
        className="w-full rounded-2xl bg-red-600 p-4 text-center font-semibold text-white shadow disabled:bg-gray-400"
      >
        {isUpdating ? '更新中...' : '更新價格'}
      </button>

      {summary ? (
        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="mb-3 font-semibold">更新結果：{summary}</div>

          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={`${result.symbol}-${index}`}
                  className="rounded-xl border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{result.product}</div>
                      <div className="text-xs text-gray-500">
                        Symbol：{result.symbol}
                      </div>
                    </div>

                    <div
                      className={
                        result.success
                          ? 'font-semibold text-blue-600'
                          : 'font-semibold text-red-600'
                      }
                    >
                      {result.success ? '成功' : '失敗'}
                    </div>
                  </div>

                  {result.success ? (
                    <div className="mt-2 text-gray-600">
                      日期：{result.date}｜收盤價：{result.close}
                    </div>
                  ) : (
                    <div className="mt-2 text-red-600">
                      原因：{result.error || '未知錯誤'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              沒有符合自動更新條件的商品。
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}