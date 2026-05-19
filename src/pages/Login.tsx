import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../components/Toast'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuthStore()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))

    if (isRegister) {
      if (password !== confirmPassword) {
        showToast('პაროლები არ ემთხვევა', 'error')
        setLoading(false)
        return
      }
      const result = register(phone, password, inviteCode || undefined)
      if (result.success) {
        showToast('რეგისტრაცია წარმატებულია!', 'success')
      } else {
        showToast(result.error || 'შეცდომა', 'error')
      }
    } else {
      const result = login(phone, password)
      if (result.success) {
        showToast('წარმატებით შეხვედით!', 'success')
      } else {
        showToast(result.error || 'შეცდომა', 'error')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-brand via-indigo-700 to-violet-soft flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
            <i className="ri-ship-line text-white text-4xl"></i>
          </div>
          <h1 className="text-white text-3xl font-bold">Princess</h1>
          <p className="text-white/60 text-sm mt-1">Luxury Yacht Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-navy text-center mb-6">
            {isRegister ? 'რეგისტრაცია' : 'შესვლა'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ტელეფონის ნომერი</label>
              <div className="relative">
                <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5XX XXX XXX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">პაროლი</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="მინიმუმ 6 სიმბოლო"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 transition-all"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">პაროლის დადასტურება</label>
                  <div className="relative">
                    <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="გაიმეორეთ პაროლი"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">მოწვევის კოდი (არასავალდებულო)</label>
                  <div className="relative">
                    <i className="ri-gift-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="PRN..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-brand focus:ring-2 focus:ring-purple-brand/20 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-brand to-violet-soft text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  მუშავდება...
                </span>
              ) : isRegister ? (
                'რეგისტრაცია'
              ) : (
                'შესვლა'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-purple-brand hover:underline"
            >
              {isRegister ? 'უკვე გაქვთ ანგარიში? შესვლა' : 'არ გაქვთ ანგარიში? რეგისტრაცია'}
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <p className="text-white/40 text-xs text-center mt-4">
          დემო ვერსია - არანაირი რეალური ტრანზაქცია არ ხორციელდება
        </p>
      </div>
    </div>
  )
}

export default Login
