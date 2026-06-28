'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  code: string | null
  type: string
  currency: string
}

export default function NewPriceRecordPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [recordDate, setRecordDate] = useState(() => {
    return new Date().toISOString().slice(0, 10)
  })
  const [closePrice, setClosePrice] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, code, type, currency')
        .order('created_at', { ascending: false })

      if (error) {
        alert(`讀取商品失敗：${error.message}`)
        setIsLoading(false)
        return
      }

      setProducts(data || [])

      if (data && data.length > 0) {
        setProductId(data[0].id)
      }

      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!productId) {
      alert('請先選擇商品')
      return
    }

    if (!recordDate) {
      alert('請選擇日期')
      return
    }

    const priceNumber = Number(closePrice)

    if (!closePrice || Number.isNaN(priceNumber) || priceNumber <= 0) {
      alert('請輸入正確的收盤價')
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from('price_records').insert({
      product_id: productId,
      record_date: recordDate,
      close_price: priceNumber,
      note: note.trim(),
    })

    setIsSaving(false)

    if (error) {
      if (error.message.includes('duplicate key')) {
        alert('這檔商品在這個日期已經有收盤價紀錄')
        return
      }

      alert(`儲存失敗：${error.message}`)
      return
    }

    alert('收盤價已儲存')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">新增收盤價</h1>

        <p className="mt-2 text-sm text-gray-600">
          選擇商品、日期，並輸入當日收盤價。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-5 shadow"
        >
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              商品
            </label>

            {isLoading ? (
              <p className="text-sm text-gray-500">讀取商品中...</p>
            ) : products.length > 0 ? (
              <select
                className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.code ? `｜${product.code}` : ''}
                    ｜{product.currency}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-red-600">
                尚未建立商品，請先新增商品。
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              日期
            </label>
            <input
              type="date"
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              收盤價
            </label>
            <input
              type="number"
              step="0.01"
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：18.35"
              value={closePrice}
              onChange={(e) => setClosePrice(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              備註
            </label>
            <textarea
              className="block min-h-24 w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
              placeholder="例如：放量、利多消息、外資賣超"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || isLoading || products.length === 0}
            className="block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white disabled:bg-gray-400"
          >
            {isSaving ? '儲存中...' : '儲存收盤價'}
          </button>
        </form>
      </div>
    </main>
  )
}