export interface Translations {
  tabs: {
    chat: string
    dashboard: string
    extrato: string
    config: string
  }
  tabTitles: {
    chat: string
    dashboard: string
    extrato: string
    config: string
  }
  chat: {
    placeholder: string
    cameraLabel: string
    sendLabel: string
    emptyGreeting: string
    emptySubtitle: string
    fallbackError: string
    correctionPrefix: string
    correctionOriginalData: string
    sessionExpired: string
    noInternet: string
    dateTooOld: string
    dateTooFar: string
  }
  confirm: {
    confirmButton: string
    correctButton: string
    saving: string
    correctionPlaceholder: string
    sendCorrection: string
    cancel: string
    at: string
  }
  dashboard: {
    totalPeriod: string
    dailyAverage: string
    allCategories: string
    calculating: string
    noData: string
    scrollHint: string
    budgetExceeded: string
    spendingByDay: string
    byCategory: string
    limits: string
    today: string
    thisMonth: string
    canSpend: string
    above: string
  }
  extrato: {
    allCategories: string
    emptyState: string
    search: string
    csv: string
    pdf: string
    csvHeader: (symbol: string) => string
    editTitle: string
    deleteConfirm: string
    deleteLabel: string
    descriptionLabel: string
    amountLabel: string
    categoryLabel: string
    dateLabel: string
    saveLabel: string
    savingLabel: string
  }
  periods: {
    hoje: string
    semana: string
    mes: string
    trimestre: string
    total: string
  }
  categories: {
    Alimentacao: string
    Transporte: string
    Saude: string
    Lazer: string
    Habitacao: string
    Impostos: string
    Outros: string
  }
  settings: {
    title: string
    regionTitle: string
    personaTitle: string
    limitsTitle: string
    dailyLimit: string
    monthlyLimit: string
    saveLimit: string
    savingLimit: string
    removeLimit: string
    helpTitle: string
    tutorial: string
    installApp: string
    accountTitle: string
    logout: string
    resetData: string
    resetConfirm: string
    deleteAccount: string
    deleteConfirm: string
    receiptPhotos: string
    receiptUnlockPlaceholder: string
    receiptUnlockButton: string
    receiptEnabled: string
    yearTitle: string
    currencyLabel: string
    activePersona: string
    general: string
    limitesDefined: string
    cancel: string
    deleting: string
    erasing: string
    eraseAll: string
    eliminating: string
  }
  login: {
    subtitle: string
    loginTab: string
    signupTab: string
    emailPlaceholder: string
    passwordPlaceholder: string
    loginButton: string
    signupButton: string
    processing: string
    wrongCredentials: string
    signupError: string
    signupSuccess: string
    installButton: string
    back: string
  }
  tutorial: {
    steps: Array<{ title: string; body: string }>
    next: string
    previous: string
    start: string
  }
  install: {
    title: string
    iosHint: string
    dismiss: string
    chromeStep1: string
    chromeStep2: string
    chromeStep3: string
    understood: string
  }
  dates: {
    today: string
    yesterday: string
  }
  pdf: {
    title: string
    subtitle: string
    generatedAt: string
    total: string
    dailyAverage: string
    transactions: string
    byCategory: string
    footer: string
    periods: Record<string, string>
  }
  lightbox: {
    subtitle: string
  }
}
