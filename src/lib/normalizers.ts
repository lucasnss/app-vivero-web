export type RawItem = {
  product_id?: string | null
  title?: string | null
  quantity: number | string
  price?: number | string
  unit_price?: number | string
  currency_id?: string
}

export type NormalizedItem = {
  product_id: string | null
  title: string | null
  quantity: number
  unit_price: number
  currency_id: string
  line_total: number
}

export function normalizeItems(raw: RawItem[]): { items: NormalizedItem[]; total_amount: number } {
  const items = raw.map((item, index) => {
    const quantityNumber = Math.trunc(Number(item.quantity))
    const quantity = Number.isFinite(quantityNumber) ? Math.max(1, quantityNumber) : NaN
    if (!Number.isFinite(quantity)) {
      throw new Error(`Item #${index}: quantity inválida`)
    }

    const unitPriceCandidate = item.unit_price ?? item.price
    const unitPriceNum = Number(unitPriceCandidate)
    if (!Number.isFinite(unitPriceNum)) {
      throw new Error(`Item #${index}: unit_price/price inválido`)
    }

    const unit_price = Math.round(unitPriceNum * 100) / 100
    const line_total = Math.round(unit_price * quantity * 100) / 100

    return {
      product_id: item.product_id ?? null,
      title: item.title ?? null,
      quantity,
      unit_price,
      currency_id: item.currency_id ?? 'ARS',
      line_total
    }
  })

  const total_amount = Math.round(items.reduce((acc, it) => acc + it.line_total, 0) * 100) / 100
  return { items, total_amount }
}


