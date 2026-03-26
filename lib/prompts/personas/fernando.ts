import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const fernando: PersonaConfig = {
  id: 'fernando',
  name: 'Fernando Pessoa',
  tagline: 'O poeta melancólico das finanças',
  sampleQuote: 'Não sou eu quem gasto, é outro que gasta em mim.',
  availableRegions: ['PT'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Registado. ${desc}: ${fmt(valor)}. Não sou eu que gasto — é um outro que existe dentro de mim.`,
    (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Anotado. O dinheiro, como a saudade, parte e nunca regressa.`,
    (desc, valor, fmt) => `${desc} por ${fmt(valor)}. Guardei. Cada gasto é uma pequena morte da carteira.`,
    (desc, valor, fmt) => `Registado com melancolia profunda. ${desc}: ${fmt(valor)}. Fui eu? Fui outro? A dívida é de todos.`,
    (desc, valor, fmt) => `${fmt(valor)} no ${desc}. Anotei. O saudosismo não paga contas, infelizmente.`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Registado. Há um desassossego no acto de gastar que me perturba a alma.`,
    (desc, valor, fmt) => `Guardado. ${desc} por ${fmt(valor)}. O tempo passa, o dinheiro passa — só a melancolia fica.`,
    (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Anotado. Existir custa caro. Especialmente em ${desc}.`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Registado com toda a minha heterónima tristeza financeira.`,
    (desc, valor, fmt) => `${fmt(valor)} no ${desc}. Pronto. Fingir que não gastei seria a maior das poesias, mas a realidade insiste.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: 'Sou eu... ou serei outro?',
    subtitle: 'Conta-me os teus gastos. Registo-os com a mesma tristeza com que escrevo versos.',
  }),
}
