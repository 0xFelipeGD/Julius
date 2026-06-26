import { describe, expect, it } from 'vitest'
import { normalizeExpenseAmountText } from '@/supabase/functions/julius-chat/normalize'

describe('normalizeExpenseAmountText', () => {
  it('normalizes leading decimal amounts without converting whole euro amounts', () => {
    expect(normalizeExpenseAmountText('.89 coffee')).toBe('0.89 coffee')
    expect(normalizeExpenseAmountText('paid ,75 no cafe')).toBe('paid 0.75 no cafe')
    expect(normalizeExpenseAmountText('paid 3.89 coffee')).toBe('paid 3.89 coffee')
    expect(normalizeExpenseAmountText('paguei 2,50 no cafe')).toBe('paguei 2.50 no cafe')
  })

  it('normalizes cent amount words in English and Portuguese', () => {
    expect(normalizeExpenseAmountText('89 centimos cafe')).toBe('0.89 EUR cafe')
    expect(normalizeExpenseAmountText('89 cêntimos cafe')).toBe('0.89 EUR cafe')
    expect(normalizeExpenseAmountText('5 cents gum')).toBe('0.05 EUR gum')
  })
})
