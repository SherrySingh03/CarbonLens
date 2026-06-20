import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'cl_intro_seen'

const SLIDES = [
  {
    visual: (
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 140, height: 140, display: 'grid', placeItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.87 0.185 150 / 0.18), transparent 70%)' }} />
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="55" fill="none" stroke="oklch(0.3 0.016 170 / 0.5)" strokeWidth="10" />
            <circle cx="70" cy="70" r="55" fill="none" stroke="oklch(0.87 0.185 150)" strokeWidth="10"
              strokeLinecap="round" strokeDasharray="345" strokeDashoffset="120"
              style={{ filter: 'drop-shadow(0 0 7px oklch(0.87 0.185 150 / 0.6))' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 700, color: 'var(--cl-text)' }}>
            68
          </div>
        </div>
      </div>
    ),
    title: 'Meet your number',
    body: 'Your carbon score sums everything you log into one monthly kg total. We show you what it means in the real world — not just a number.',
  },
  {
    visual: (
      <div style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', height: 12, borderRadius: 999, background: 'linear-gradient(90deg, oklch(0.84 0.16 152), oklch(0.85 0.14 90) 52%, oklch(0.70 0.18 33))', marginBottom: 32 }}>
          <div style={{ position: 'absolute', top: '50%', left: '30%', width: 18, height: 18, borderRadius: '50%', background: 'oklch(0.97 0.01 160)', border: '4px solid oklch(0.87 0.185 150)', transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 4px oklch(0.87 0.185 150 / 0.2)' }} />
          <div style={{ position: 'absolute', bottom: '100%', left: '30%', transform: 'translateX(-50%)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'oklch(0.87 0.185 150)' }}>YOU</div>
          <div style={{ position: 'absolute', top: '100%', left: '55%', transform: 'translateX(-50%)', marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'oklch(0.72 0.018 165)', whiteSpace: 'nowrap' }}>INDIA AVG</div>
          <div style={{ position: 'absolute', top: '100%', left: '22%', transform: 'translateX(-50%)', marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'oklch(0.83 0.105 205)', whiteSpace: 'nowrap' }}>2030 TARGET</div>
        </div>
      </div>
    ),
    title: 'See where you stand',
    body: "Every score sits on a rail against India's national average and the 2030 science-based target — so you always know if you're making progress.",
  },
  {
    visual: (
      <div style={{ borderRadius: 16, border: '1px solid oklch(0.87 0.185 150 / 0.22)', background: 'linear-gradient(150deg, oklch(0.87 0.185 150 / 0.09), oklch(0.19 0.016 170))', padding: 18, marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'oklch(0.87 0.185 150)', marginBottom: 10 }}>AI Coach</div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'oklch(0.9 0.012 165)' }}>
          Switch 2 drives to metro this week →{' '}
          <span style={{ color: 'oklch(0.84 0.16 152)', fontWeight: 600 }}>−9 kg CO₂</span>
        </div>
      </div>
    ),
    title: 'Small swaps, real change',
    body: 'Each week your AI coach surfaces the single highest-impact action. No overwhelm — just the next useful step.',
  },
]

interface OnboardingIntroProps {
  onDone: () => void
}

export default function OnboardingIntro({ onDone }: OnboardingIntroProps) {
  const [step, setStep] = useState(0)

  function advance() {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, '1')
      onDone()
    }
  }

  function skip() {
    localStorage.setItem(STORAGE_KEY, '1')
    onDone()
  }

  const slide = SLIDES[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'oklch(0 0 0 / 0.6)' }} onClick={skip} />
      <motion.div
        className="relative"
        style={{
          width: '100%', maxWidth: 360,
          background: 'oklch(0.17 0.015 170)',
          border: '1px solid oklch(0.5 0.02 170 / 0.22)',
          borderRadius: '1.75rem',
          padding: '2rem 1.75rem 1.5rem',
          boxShadow: '0 32px 80px oklch(0 0 0 / 0.6)',
        }}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 999,
              background: i <= step ? 'oklch(0.87 0.185 150)' : 'oklch(0.3 0.016 170 / 0.6)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {slide.visual}
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--cl-text)', margin: '0 0 10px', textAlign: 'center' }}>
              {slide.title}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--cl-text-muted)', margin: 0, textAlign: 'center' }}>
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 28 }}>
          <button
            onClick={advance}
            style={{
              width: '100%', fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 15, fontWeight: 600,
              color: 'oklch(0.15 0.014 168)', background: 'oklch(0.87 0.185 150)',
              border: 'none', padding: '14px', borderRadius: 14, cursor: 'pointer',
              boxShadow: '0 6px 18px oklch(0.87 0.185 150 / 0.32)',
            }}
          >
            {step < SLIDES.length - 1 ? 'Next' : 'Start tracking'}
          </button>
          <button
            onClick={skip}
            style={{
              width: '100%', fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 13, fontWeight: 500, color: 'var(--cl-text-subtle)',
              background: 'transparent', border: 'none', padding: '12px', marginTop: 4, cursor: 'pointer',
            }}
          >
            {step < SLIDES.length - 1 ? 'Skip intro' : ''}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function useShowIntro(): [boolean, () => void] {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])
  return [show, () => setShow(false)]
}
