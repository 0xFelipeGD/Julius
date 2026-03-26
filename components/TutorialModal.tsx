'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface TutorialModalProps {
  open: boolean
  onClose: () => void
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const t = useTranslation()
  const STEPS = t.tutorial.steps.map((s, i) => ({
    icon: ['💬', '📷', '✅', '📊', '🎯', '⚙️'][i] ?? '⚙️',
    title: s.title,
    desc: s.body,
  }))
  const [step, setStep] = useState(0)

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function handleNext() {
    if (isLast) { onClose(); setStep(0) }
    else setStep((s) => s + 1)
  }

  function handleClose() { onClose(); setStep(0) }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl bg-julius-card border-t border-julius-border p-6 pb-8"
        style={{ animation: 'tutorial-slide-up 0.3s cubic-bezier(0.34,1.2,0.64,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-julius-accent' : 'w-1.5 bg-julius-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8" key={step} style={{ animation: 'tutorial-fade 0.2s ease both' }}>
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="text-xl font-bold text-julius-text mb-2">{current.title}</h2>
          <p className="text-julius-muted text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl bg-julius-bg py-3 text-sm font-medium text-julius-muted"
            >
              {t.tutorial.previous}
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl bg-julius-accent py-3 text-sm font-semibold text-white"
          >
            {isLast ? t.tutorial.start : t.tutorial.next}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tutorial-slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tutorial-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
