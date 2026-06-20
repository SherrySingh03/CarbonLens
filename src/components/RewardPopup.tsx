import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { InsightTip } from '../types'

interface RewardPopupProps {
  tip: InsightTip | null
  onClose: () => void
}

export default function RewardPopup({ tip, onClose }: RewardPopupProps) {
  useEffect(() => {
    if (!tip) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [tip, onClose])

  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'oklch(0 0 0 / 0.55)' }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative"
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              width: '100%', maxWidth: 360,
              background: 'linear-gradient(155deg, oklch(0.19 0.018 165), oklch(0.155 0.014 168))',
              border: '1px solid oklch(0.84 0.16 152 / 0.35)',
              borderRadius: '1.5rem',
              padding: '2rem 1.75rem',
              boxShadow: '0 0 0 1px oklch(0.84 0.16 152 / 0.08), 0 32px 80px oklch(0 0 0 / 0.6)',
              textAlign: 'center',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl focus-ring"
              style={{ background: 'oklch(0.235 0.018 172)', color: 'var(--cl-text-muted)' }}
              aria-label="Close"
            >
              <X size={13} />
            </button>

            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.25rem',
                background: 'oklch(0.84 0.16 152 / 0.15)',
                border: '2px solid oklch(0.84 0.16 152 / 0.6)',
                boxShadow: '0 0 32px oklch(0.84 0.16 152 / 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}
            >
              🌱
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--cl-text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                Action completed!
              </p>
              <p style={{ fontSize: 14, color: 'var(--cl-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                {tip.title}
              </p>

              {/* Savings badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 999,
                background: 'oklch(0.84 0.16 152 / 0.12)',
                border: '1px solid oklch(0.84 0.16 152 / 0.32)',
                marginBottom: 20,
              }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: 'oklch(0.84 0.16 152)' }}>
                  −{tip.estimatedSavingKgCO2.toFixed(1)}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'oklch(0.84 0.16 152 / 0.8)' }}>
                  kg CO₂/mo
                </span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--cl-text-subtle)' }}>
                Keep it up — every action compounds 🌍
              </p>
            </motion.div>

            {/* Progress bar auto-close */}
            <motion.div
              style={{
                position: 'absolute', bottom: 0, left: 0, height: 3,
                borderRadius: '0 0 1.5rem 1.5rem',
                background: 'oklch(0.84 0.16 152)',
                transformOrigin: 'left',
              }}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
