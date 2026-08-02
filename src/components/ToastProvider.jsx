import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const nextIdRef = useRef(1)

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', durationMs = 3200) => {
    const id = nextIdRef.current++

    setToasts((current) => [...current, { id, message, type }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, durationMs)

    return id
  }, [])

  const contextValue = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className='toast-region' aria-live='polite' aria-atomic='true'>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role='status'>
            <p>{toast.message}</p>
            <button
              type='button'
              className='toast-close'
              onClick={() => dismissToast(toast.id)}
              aria-label='Dismiss notification'
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
