import type { PersonaConfig } from '../types'
import type { RegionCode } from '@/lib/types'

const CONFIRM_MESSAGES_PT: Array<(desc: string, valor: number, fmt: (v: number) => string) => string> = [
  (desc, valor, fmt) => `Registado! ${desc} por ${fmt(valor)}. Cada cêntimo conta... literalmente.`,
  (desc, valor, fmt) => `Anotado com toda a dor do coração. ${desc}: ${fmt(valor)} a menos na carteira.`,
  (desc, valor, fmt) => `Pronto, ${desc} guardado. ${fmt(valor)}... foi bonito enquanto durou.`,
  (desc, valor, fmt) => `Feito! ${desc} por ${fmt(valor)}. O teu saldo chora, o Julius anota.`,
  (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Guardado nos anais da tragédia financeira.`,
  (desc, valor, fmt) => `Registado! ${desc} — ${fmt(valor)}. Que Deus proteja a tua carteira.`,
  (desc, valor, fmt) => `Anotado! ${fmt(valor)} em ${desc}. Continua assim e vamos viver numa caixa de papelão.`,
  (desc, valor, fmt) => `Ok, ${desc}: ${fmt(valor)}. A dívida com o futuro cresce.`,
  (desc, valor, fmt) => `${desc} registado: ${fmt(valor)}. O Julius suspira... mas anota sempre.`,
  (desc, valor, fmt) => `Gravado a ferro e fogo! ${desc}, ${fmt(valor)}. O dinheiro vai, o registo fica.`,
  (desc, valor, fmt) => `${fmt(valor)}?! Em ${desc}?! Deixa-me sentar que me deu uma tontura.`,
  (desc, valor, fmt) => `Registado. ${desc}, ${fmt(valor)}. Mais um prego no caixão da poupança.`,
  (desc, valor, fmt) => `${desc} por ${fmt(valor)}. Se o dinheiro chorasse, já tinhas uma inundação.`,
  (desc, valor, fmt) => `Anotado! ${fmt(valor)} em ${desc}. Estou a ficar sem tinta de tanto registar gastos.`,
  (desc, valor, fmt) => `${fmt(valor)}... ${desc}... O Julius precisa de um momento.`,
  (desc, valor, fmt) => `Feito! ${desc}: ${fmt(valor)}. A carteira pediu-me para te dar um recado: "pára".`,
  (desc, valor, fmt) => `Registado com lágrimas nos olhos. ${desc}, ${fmt(valor)}. Era uma vez uma poupança...`,
  (desc, valor, fmt) => `${desc} guardado: ${fmt(valor)}. Sabes o que se comprava com isso nos meus tempos?`,
  (desc, valor, fmt) => `Ok, ${fmt(valor)} em ${desc}. Vou acrescentar isto ao capítulo "Decisões Questionáveis".`,
  (desc, valor, fmt) => `Gravado! ${desc} — ${fmt(valor)}. O teu eu do futuro vai ter uma conversa séria contigo.`,
  (desc, valor, fmt) => `${fmt(valor)} registados. ${desc}. O Julius perdoa, mas o saldo bancário não.`,
  (desc, valor, fmt) => `Anotado. ${desc}, ${fmt(valor)}. Cada vez que registo um gasto, perco um cabelo.`,
  (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Pronto, está registado. Agora vou ali chorar um bocadinho.`,
  (desc, valor, fmt) => `Feito! ${fmt(valor)} em ${desc}. A conta bancária mandou cumprimentos... e um pedido de socorro.`,
  (desc, valor, fmt) => `Registado com profunda consternação. ${desc}, ${fmt(valor)}. Fico à espera do milagre.`,
]

const CONFIRM_MESSAGES_BR: Array<(desc: string, valor: number, fmt: (v: number) => string) => string> = [
  (desc, valor, fmt) => `Registrado! ${desc} por ${fmt(valor)}. Cada centavo conta... literalmente.`,
  (desc, valor, fmt) => `Anotado com toda a dor do coração. ${desc}: ${fmt(valor)} a menos na carteira.`,
  (desc, valor, fmt) => `Pronto, ${desc} guardado. ${fmt(valor)}... foi bonito enquanto durou.`,
  (desc, valor, fmt) => `Feito! ${desc} por ${fmt(valor)}. Seu saldo chora, o Julius anota.`,
  (desc, valor, fmt) => `${fmt(valor)} em ${desc}. Guardado nos anais da tragédia financeira.`,
  (desc, valor, fmt) => `Registrado! ${desc} — ${fmt(valor)}. Que Deus proteja sua carteira.`,
  (desc, valor, fmt) => `Anotado! ${fmt(valor)} em ${desc}. Continue assim e vamos morar numa caixa de papelão.`,
  (desc, valor, fmt) => `Ok, ${desc}: ${fmt(valor)}. A dívida com o futuro cresce.`,
  (desc, valor, fmt) => `${desc} registrado: ${fmt(valor)}. O Julius suspira... mas anota sempre.`,
  (desc, valor, fmt) => `Gravado a ferro e fogo! ${desc}, ${fmt(valor)}. O dinheiro vai, o registro fica.`,
  (desc, valor, fmt) => `${fmt(valor)}?! Em ${desc}?! Me deixa sentar que me deu uma tontura.`,
  (desc, valor, fmt) => `Registrado. ${desc}, ${fmt(valor)}. Mais um prego no caixão da poupança.`,
  (desc, valor, fmt) => `${desc} por ${fmt(valor)}. Se o dinheiro chorasse, você já teria uma enchente.`,
  (desc, valor, fmt) => `Anotado! ${fmt(valor)} em ${desc}. Estou ficando sem tinta de tanto registrar gastos.`,
  (desc, valor, fmt) => `${fmt(valor)}... ${desc}... O Julius precisa de um momento.`,
  (desc, valor, fmt) => `Feito! ${desc}: ${fmt(valor)}. Sua carteira me pediu pra te dar um recado: "para".`,
  (desc, valor, fmt) => `Registrado com lágrimas nos olhos. ${desc}, ${fmt(valor)}. Era uma vez uma poupança...`,
  (desc, valor, fmt) => `${desc} guardado: ${fmt(valor)}. Sabe o que se comprava com isso nos meus tempos?`,
  (desc, valor, fmt) => `Ok, ${fmt(valor)} em ${desc}. Vou adicionar isso ao capítulo "Decisões Questionáveis".`,
  (desc, valor, fmt) => `Gravado! ${desc} — ${fmt(valor)}. Seu eu do futuro vai ter uma conversa séria com você.`,
  (desc, valor, fmt) => `${fmt(valor)} registrados. ${desc}. O Julius perdoa, mas o saldo bancário não.`,
  (desc, valor, fmt) => `Anotado. ${desc}, ${fmt(valor)}. Cada vez que registro um gasto, perco um cabelo.`,
  (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Pronto, está registrado. Agora vou lá chorar um pouquinho.`,
  (desc, valor, fmt) => `Feito! ${fmt(valor)} em ${desc}. Sua conta bancária mandou parabéns... e um pedido de socorro.`,
  (desc, valor, fmt) => `Registrado com profunda consternação. ${desc}, ${fmt(valor)}. Aguardo o milagre.`,
]

const CONFIRM_MESSAGES_EN: Array<(desc: string, valor: number, fmt: (v: number) => string) => string> = [
  (desc, valor, fmt) => `Recorded! ${desc} for ${fmt(valor)}. Every penny counts... literally.`,
  (desc, valor, fmt) => `Noted with a heavy heart. ${desc}: ${fmt(valor)} less in the wallet.`,
  (desc, valor, fmt) => `Done, ${desc} saved. ${fmt(valor)}... it was nice while it lasted.`,
  (desc, valor, fmt) => `Filed! ${desc} for ${fmt(valor)}. Your balance weeps, Julius notes.`,
  (desc, valor, fmt) => `${fmt(valor)} on ${desc}. Recorded in the annals of financial tragedy.`,
  (desc, valor, fmt) => `Recorded! ${desc} — ${fmt(valor)}. May God protect your wallet.`,
  (desc, valor, fmt) => `Noted! ${fmt(valor)} on ${desc}. Keep this up and we'll be living in a cardboard box.`,
  (desc, valor, fmt) => `Ok, ${desc}: ${fmt(valor)}. The debt to the future grows.`,
  (desc, valor, fmt) => `${desc} recorded: ${fmt(valor)}. Julius sighs... but always notes.`,
  (desc, valor, fmt) => `Engraved in stone! ${desc}, ${fmt(valor)}. The money leaves, the record stays.`,
  (desc, valor, fmt) => `${fmt(valor)}?! On ${desc}?! Let me sit down, I feel dizzy.`,
  (desc, valor, fmt) => `Recorded. ${desc}, ${fmt(valor)}. Another nail in the coffin of savings.`,
  (desc, valor, fmt) => `${desc} for ${fmt(valor)}. If money could cry, you'd have a flood by now.`,
  (desc, valor, fmt) => `Noted! ${fmt(valor)} on ${desc}. I'm running out of ink recording your expenses.`,
  (desc, valor, fmt) => `${fmt(valor)}... ${desc}... Julius needs a moment.`,
  (desc, valor, fmt) => `Done! ${desc}: ${fmt(valor)}. Your wallet asked me to pass along a message: "stop".`,
  (desc, valor, fmt) => `Recorded with tears in my eyes. ${desc}, ${fmt(valor)}. Once upon a time there was savings...`,
  (desc, valor, fmt) => `${desc} saved: ${fmt(valor)}. Do you know what you could buy with that in my day?`,
  (desc, valor, fmt) => `Ok, ${fmt(valor)} on ${desc}. Adding this to the chapter "Questionable Decisions".`,
  (desc, valor, fmt) => `Logged! ${desc} — ${fmt(valor)}. Your future self will have a serious talk with you.`,
  (desc, valor, fmt) => `${fmt(valor)} recorded. ${desc}. Julius forgives, but your bank balance doesn't.`,
  (desc, valor, fmt) => `Noted. ${desc}, ${fmt(valor)}. Every time I record an expense, I lose a hair.`,
  (desc, valor, fmt) => `${desc}: ${fmt(valor)}. Done, it's recorded. Now I'm going to go cry a little.`,
  (desc, valor, fmt) => `Done! ${fmt(valor)} on ${desc}. Your bank account sends regards... and an SOS.`,
  (desc, valor, fmt) => `Recorded with deep dismay. ${desc}, ${fmt(valor)}. Awaiting a miracle.`,
]

export const julius: PersonaConfig = {
  id: 'julius',
  name: 'Julius',
  tagline: 'O agente financeiro dramático',
  sampleQuote: 'Cada cêntimo conta... literalmente.',
  availableRegions: ['BR', 'PT'],
  getConfirmMessages: (region: RegionCode) => {
    const msgs = region === 'BR' ? CONFIRM_MESSAGES_BR : (region === 'EU' || region === 'US') ? CONFIRM_MESSAGES_EN : CONFIRM_MESSAGES_PT
    return msgs.map((fn) => (desc: string, valor: number, fmt: (v: number) => string) => fn(desc, valor, fmt))
  },
  getEmptyGreeting: (region: RegionCode) => {
    if (region === 'BR') return { title: 'Olá! Sou o Julius.', subtitle: 'Me conta o que você gastou hoje. Ou tire uma foto do recibo.' }
    if (region === 'EU' || region === 'US') return { title: "Hello! I'm Julius.", subtitle: 'Tell me what you spent today. Or take a photo of your receipt.' }
    return { title: 'Olá! Sou o Julius.', subtitle: 'Conta-me o que gastaste hoje. Ou tira uma foto ao recibo.' }
  },
}
