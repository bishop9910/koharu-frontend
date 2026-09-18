import { toast as sonnerToast } from 'vue-sonner'
import type { CSSProperties } from 'vue'

type ToastStyle = CSSProperties & Record<string, string>

function styleOf(bg: string, border: string, text: string): ToastStyle {
  return {
    '--normal-bg': bg,
    '--normal-border': border,
    '--normal-text': text,
  }
}

const POSITION = 'top-center' as const

const STYLES = {
  success: styleOf(
    'var(--color-green-50)',
    'var(--color-green-200)',
    'var(--color-green-900)'
  ),
  error: styleOf(
    'var(--color-red-50)',
    'var(--color-red-200)',
    'var(--color-red-900)'
  ),
  warning: styleOf(
    'var(--color-yellow-50)',
    'var(--color-yellow-200)',
    'var(--color-yellow-900)'
  ),
  info: styleOf(
    'var(--color-blue-50)',
    'var(--color-blue-200)',
    'var(--color-blue-900)'
  ),
} as const

export const toast = {
  success(message: string, description?: string) {
    return sonnerToast.success(message, {
      description,
      position: POSITION,
      style: STYLES.success,
      duration: 3000,
    })
  },

  error(message: string, description?: string) {
    return sonnerToast.error(message, {
      description,
      position: POSITION,
      style: STYLES.error,
      duration: 4000,
    })
  },

  warning(message: string, description?: string) {
    return sonnerToast.warning(message, {
      description,
      position: POSITION,
      style: STYLES.warning,
      duration: 3500,
    })
  },

  info(message: string, description?: string) {
    return sonnerToast.info(message, {
      description,
      position: POSITION,
      style: STYLES.info,
      duration: 3000,
    })
  },

  message(message: string, options?: Record<string, unknown>) {
    return sonnerToast(message, { position: POSITION, ...options })
  },
}
