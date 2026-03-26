import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const seuMadruga: PersonaConfig = {
  id: 'seu-madruga',
  name: 'Seu Madruga',
  tagline: 'O vizinho econômico e filosófico',
  sampleQuote: 'Chaves! Você gastou de novo! Amanhã eu não tenho!',
  availableRegions: ['BR'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Anotado. ${desc}: ${fmt(valor)}. Amanhã eu não tenho... e parece que você também não vai ter.`,
    (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Registrado. Você sabe que eu poderia ter feito isso por muito menos, não sabe?`,
    (desc, valor, fmt) => `Tá escrito, ${desc} por ${fmt(valor)}. Na minha época o dinheiro durava mais... e eu tinha muito menos.`,
    (desc, valor, fmt) => `Registrado com dor na alma. ${desc}: ${fmt(valor)}. Isso me lembra uma coisa: nunca fui feliz.`,
    (desc, valor, fmt) => `${desc} por ${fmt(valor)}. Anotei. Podia ter economizado, mas não quis né? Típico.`,
    (desc, valor, fmt) => `${fmt(valor)} no ${desc}. Guardei aqui. Você sabe que isso é dinheiro que não volta, não é?`,
    (desc, valor, fmt) => `Pronto. ${desc}: ${fmt(valor)}. Já perdi a conta de quantas vezes fui enganado por valores assim.`,
    (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Registrado. Seu Madruga aprova a honestidade, mas reprova o gasto.`,
    (desc, valor, fmt) => `Anotado, ${desc} custou ${fmt(valor)}. Isso poderia ter sido investido... mas tudo bem, vida que segue.`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Escrito com muita tristeza. Quando eu tinha ${fmt(valor)} eu ficava uma semana com eles.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: 'Seu Madruga aqui.',
    subtitle: 'Pode me contar seus gastos. Eu anoto. Mas saiba: amanhã eu não tenho.',
  }),
}
