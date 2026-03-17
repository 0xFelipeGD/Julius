import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('formata EUR — contém o valor e o símbolo', () => {
    const result = formatCurrency(12.5, 'EUR')
    expect(result).toContain('12')
    expect(result).toContain('50')
    expect(result).toContain('€')
  })

  it('formata BRL — contém o valor e o símbolo', () => {
    const result = formatCurrency(12.5, 'BRL')
    expect(result).toContain('12')
    expect(result).toContain('50')
    expect(result).toContain('R$')
  })

  it('usa EUR por defeito', () => {
    expect(formatCurrency(5)).toContain('€')
  })

  it('formata zero — retorna string com 0', () => {
    const result = formatCurrency(0, 'EUR')
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formata valor grande — contém todos os dígitos', () => {
    const result = formatCurrency(1234.56, 'EUR')
    expect(result).toMatch(/1[\s\u00a0\u202f.,]?234/)
    expect(result).toContain('€')
  })

  it('retorna uma string não-vazia', () => {
    expect(formatCurrency(99.99, 'EUR').length).toBeGreaterThan(0)
    expect(formatCurrency(99.99, 'BRL').length).toBeGreaterThan(0)
  })
})
