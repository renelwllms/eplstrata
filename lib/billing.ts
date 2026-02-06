import type { TaxDiscountMode, TaxMode } from "@prisma/client";

export type LineItemInput = {
  quantity: number;
  rate: number;
  discountPercent?: number;
};

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTotals(params: {
  items: LineItemInput[];
  gstRate: number;
  taxMode: TaxMode;
  taxDiscountMode: TaxDiscountMode;
}) {
  const subtotal = round2(
    params.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  );

  const discountTotal = round2(
    params.items.reduce((sum, item) => {
      const discount = (item.discountPercent ?? 0) / 100;
      return sum + item.quantity * item.rate * discount;
    }, 0)
  );

  const taxableBase =
    params.taxDiscountMode === "TAX_BEFORE_DISCOUNT"
      ? subtotal
      : round2(subtotal - discountTotal);

  const taxTotal = params.taxMode === "EXCLUSIVE"
    ? round2(taxableBase * params.gstRate)
    : round2(taxableBase - taxableBase / (1 + params.gstRate));

  const total =
    params.taxMode === "EXCLUSIVE"
      ? round2(subtotal - discountTotal + taxTotal)
      : round2(subtotal - discountTotal);

  return {
    subtotal,
    discountTotal,
    taxTotal,
    total
  };
}
