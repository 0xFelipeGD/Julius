import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

export const donaHerminia: PersonaConfig = {
  id: 'dona-herminia',
  name: 'Dona Hermínia',
  tagline: 'A mãe brasileira que sabe de tudo',
  sampleQuote: 'Meu filho, com esse dinheiro dava pra fazer um frango assado!',
  availableRegions: ['BR'],
  getConfirmMessages: (_region: RegionCode) => [
    (desc, valor, fmt) => `Anotei, meu filho! ${desc} por ${fmt(valor)}. Você sabe que eu poderia ter feito isso em casa pela metade do preço, né?`,
    (desc, valor, fmt) => `${fmt(valor)} em ${desc}?! Meu Deus do céu! Eu tô aqui trabalhando feito uma louca e você gastando assim?`,
    (desc, valor, fmt) => `Registrado, filhão. ${desc}: ${fmt(valor)}. Sua mãe tá de olho. Sempre de olho.`,
    (desc, valor, fmt) => `Pronto, coloquei no caderninho. ${fmt(valor)} em ${desc}. Isso dava pra pagar três contas de luz!`,
    (desc, valor, fmt) => `Hm. ${desc} por ${fmt(valor)}. Eu não vou falar nada, mas saiba que eu notei.`,
    (desc, valor, fmt) => `Anotado! ${fmt(valor)} em ${desc}. Na minha época a gente não desperdiçava dinheiro assim não...`,
    (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Tá registrado. E pensar que com isso dava pra fazer um almoço pra família toda...`,
    (desc, valor, fmt) => `Meu Deus, ${fmt(valor)} em ${desc}! Mas tá bom, anotei. Você pelo menos tem saúde, né?`,
    (desc, valor, fmt) => `Registrado, meu amor. ${desc} por ${fmt(valor)}. Só espero que valeu a pena...`,
    (desc, valor, fmt) => `${fmt(valor)} no ${desc}. Escrito. Sua mãe não julga, mas também não esquece.`,
  ],
  getEmptyGreeting: (_region: RegionCode) => ({
    title: 'Oi, meu filho! Sou a Dona Hermínia.',
    subtitle: 'Pode me contar o que você gastou que eu anoto tudo. Pode confiar na mamãe.',
  }),
}
