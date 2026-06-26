const LEADING_DECIMAL_AMOUNT = /(^|[^\dA-Za-z_])([€$£]?\s*)[.,](\d{1,2})(?=$|[^\dA-Za-z_])/g
const DECIMAL_COMMA_AMOUNT = /(\d+),(\d{1,2})(?=$|[^\d])/g
const CENT_AMOUNT = /(^|[^\dA-Za-z_])(\d{1,4})\s*(c[eê]ntimos?|centavos?|cents?)\b/gi

export function normalizeExpenseAmountText(input: string): string {
  return input
    .replace(LEADING_DECIMAL_AMOUNT, (_match, prefix: string, currency: string, cents: string) => {
      return `${prefix}${currency}0.${cents}`
    })
    .replace(DECIMAL_COMMA_AMOUNT, (_match, euros: string, cents: string) => {
      return `${euros}.${cents}`
    })
    .replace(CENT_AMOUNT, (_match, prefix: string, cents: string) => {
      return `${prefix}${(Number(cents) / 100).toFixed(2)} EUR`
    })
}
