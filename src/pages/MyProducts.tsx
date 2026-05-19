import { useState, useEffect } from 'react'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'

function MyProducts() {
  const { purchasedProducts, balance, collectEarnings, getTotalDailyIncome } = useUserStore()
  const { showToast } = useToast()
  const [collecting, setCollecting] = useState(false)
  const [, setTick] = useState(0)

  // Update earnings display every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])

  const handleCollect = async () => {
    setCollecting(true)
    await new Promise((r) => setTimeout(r, 800))
    collectEarnings()
    showToast('შემოსავალი დაგერიცხათ!', 'success')
    setCollecting(false)
  }

  const activeProducts = purchasedProducts.filter((p) => p.status === 'active')
  const completedProducts = purchasedProducts.filter((p) => p.status === 'completed')
  const dailyIncome = getTotalDailyIncome()

  const getProgress = (pp: typeof purchasedProducts[0]) => {
    return Math.min((pp.totalEarned / pp.product.totalIncome) * 100, 100)
  }

  const getElapsedTime = (purchasedAt: string) => {
    const start = new Date(purchasedAt)
    const now = new Date()
    const hours = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'ახლახანს'
    if (hours < 24) return `${hours} საათის წინ`
    const days = Math.floor(hours / 24)
    return `${days} დღის წინ`
  }

  return (
    <div className="min-h-screen bg-purple-brand">
      <div className="p-4">
        {/* Stats Header */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-white/70 text-xs">ბალანსი</p>
              <p className="text-white text-xl font-bold">₾{balance.toFixed(2)}</p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <p className="text-white/70 text-xs">დღიური შემოსავალი</p>
              <p className="text-green-300 text-xl font-bold">₾{dailyIncome.toFixed(1)}</p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <p className="text-white/70 text-xs">აქტიური</p>
              <p className="text-white text-xl font-bold">{activeProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Collect Button */}
        {activeProducts.length > 0 && (
          <button
            onClick={handleCollect}
            disabled={collecting}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-medium mb-4 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {collecting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                იტვირთება...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-money-dollar-circle-line"></i>
                შემოსავლის აკრეფა
              </span>
            )}
          </button>
        )}

        {/* White Card Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-navy">ჩემი პროდუქტები ({purchasedProducts.length})</h2>
          </div>

          {/* Content */}
          <div className="p-4">
            {purchasedProducts.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16">
                <i className="ri-shopping-bag-line text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-400 text-base mb-2">პროდუქტები არ არის</p>
                <p className="text-gray-300 text-sm">შეიძინეთ მაინერი მთავარ გვერდზე</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Products */}
                {activeProducts.map((pp) => (
                  <div
                    key={pp.id}
                    className="bg-gray-50 rounded-xl border-2 border-green-200 p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-brand to-violet-soft flex items-center justify-center">
                        <i className="ri-cpu-line text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-navy">{pp.product.name}</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          აქტიური
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{getElapsedTime(pp.purchasedAt)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>პროგრესი</span>
                        <span>{getProgress(pp).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${getProgress(pp)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] text-gray-500">დღიური შემოსავალი</p>
                        <p className="text-sm font-bold text-green-600">₾{pp.product.dailyIncome}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] text-gray-500">მიღებული</p>
                        <p className="text-sm font-bold text-navy">₾{pp.totalEarned.toFixed(2)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] text-gray-500">ინვესტიცია</p>
                        <p className="text-sm font-bold text-navy">₾{pp.product.price}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] text-gray-500">ჯამური მოგება</p>
                        <p className="text-sm font-bold text-navy">₾{pp.product.totalIncome}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Completed Products */}
                {completedProducts.map((pp) => (
                  <div
                    key={pp.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-70"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                        <i className="ri-cpu-line text-white text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-500">{pp.product.name}</h3>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          დასრულებული
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      მიღებული: ₾{pp.totalEarned.toFixed(2)} / ₾{pp.product.totalIncome}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProducts
