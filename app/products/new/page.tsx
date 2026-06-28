'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NewProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('stock')
  const [currency, setCurrency] = useState('TWD')
  const [market, setMarket] = useState('TW')
  const [apiSymbol, setApiSymbol] = useState('')
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      alert('請輸入商品名稱')
      return
    }

    if (autoUpdate && !apiSymbol.trim()) {
      alert('啟用自動更新時，請輸入 API 代號')
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      code: code.trim(),
      type,
      currency,
      market,
      api_symbol: apiSymbol.trim(),
      auto_update: autoUpdate,
      note: note.trim(),
    })

    setIsSaving(false)

    if (error) {
      alert(`儲存失敗：${error.message}`)
      return
    }

    alert('商品已儲存')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">新增商品</h1>

        <p className="mt-2 text-sm text-gray-600">
          建立你要追蹤的股票、ETF、基金、外幣或其他商品。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-5 shadow"
        >
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              商品名稱
            </label>
            <input
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：QQQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              商品代號
            </label>
            <input
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：QQQ、2330、TSM"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              商品類型
            </label>
            <select
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="stock">股票</option>
              <option value="etf">ETF</option>
              <option value="fund">基金</option>
              <option value="fx">外幣</option>
              <option value="index">指數</option>
              <option value="crypto">加密貨幣</option>
              <option value="insurance">保單</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              幣別
            </label>
            <select
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="TWD">TWD</option>
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
              <option value="HKD">HKD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              市場
            </label>
            <select
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            >
              <option value="TW">台灣 TW</option>
              <option value="US">美國 US</option>
              <option value="JP">日本 JP</option>
              <option value="HK">香港 HK</option>
              <option value="FX">外匯 FX</option>
              <option value="CRYPTO">加密貨幣 CRYPTO</option>
              <option value="OTHER">其他 OTHER</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              API 代號
            </label>
            <input
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：AAPL、QQQ、TSM、2330.TW"
              value={apiSymbol}
              onChange={(e) => setApiSymbol(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              之後自動抓收盤價會用這個代號。不確定可以先空白。
            </p>
          </div>

          <div className="mb-4 rounded-xl bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
              />
              啟用自動更新
            </label>

            <p className="mt-1 text-xs text-gray-500">
              目前只是先儲存設定，下一階段才會接行情 API。
            </p>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              備註
            </label>
            <textarea
              className="block min-h-24 w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：那斯達克 100 ETF、自己觀察商品"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="block w-full rounded-xl bg-black py-3 text-center font-semibold text-white disabled:bg-gray-400"
          >
            {isSaving ? '儲存中...' : '儲存商品'}
          </button>
        </form>
      </div>
    </main>
  )
}