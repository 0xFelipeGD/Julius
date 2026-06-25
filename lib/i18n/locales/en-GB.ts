import type { Translations } from '../types'

export const enGB: Translations = {
  dashboard: {
    totalPeriod: 'Period total',
    dailyAverage: 'Daily average',
  },
  periods: {
    hoje: 'Today',
    semana: 'This week',
    mes: 'This month',
    trimestre: 'This quarter',
    total: 'All year',
  },
  login: {
    subtitle: 'Your personal financial agent',
    loginTab: 'Log in',
    signupTab: 'Sign up',
    emailPlaceholder: 'Your email',
    passwordPlaceholder: 'Password',
    loginButton: 'Log in',
    signupButton: 'Sign up',
    processing: 'Processing...',
    wrongCredentials: 'Wrong email or password.',
    signupError: 'Could not create account. Try another email.',
    signupSuccess: 'Account created. Check your email to confirm.',
    installButton: 'Install Julius',
    back: 'Back',
  },
  install: {
    title: 'Install Julius',
    settingsHint: 'Add Julius to your phone home screen.',
    iosHint: 'Tap Share, then Add to Home Screen.',
    dismiss: 'Dismiss',
    chromeStep1: 'In Chrome, tap the three-dot menu in the top right.',
    chromeStep2: 'Select "Add to home screen" or "Install app".',
    chromeStep3: 'Confirm and Julius will appear on your home screen.',
    understood: 'Got it',
  },
}
