'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type DeleteProductButtonProps = {
  productId: string
  productName: string
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `確定要刪除「${productName}」嗎？\n\n這會一起刪除它的歷史價格紀錄。`
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const response = await fetch(`/api/products/${productId}/delete`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`刪除失敗：${result.error || '未知錯誤'}`)
        return
      }

      alert('刪除成功')
      window.location.reload()
    } catch (error) {
      alert('刪除失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
    >
      {loading ? '刪除中...' : '刪除'}
    </button>
  )
}