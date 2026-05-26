import { useState, useEffect, createContext, useContext, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, text, type }])
  }, [])

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-purple-brand',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] space-y-2 w-[90%] max-w-[360px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${colors[toast.type]} text-white px-4 py-3 rounded-xl shadow-2xl text-sm text-center animate-fade-in`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
