import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { products, Product } from '../data/products'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'

const carouselImages = [
  'https://picsum.photos/400/200?random=1',
  'https://picsum.photos/400/200?random=2',
  'https://picsum.photos/400/200?random=3',
  'https://picsum.photos/400/200?random=4',
]

function Home() {
  const [showModal, setShowModal] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [purchaseModal, setPurchaseModal] = useState<Product | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const { balance, purchaseProduct, getTotalDailyIncome } = useUserStore()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const dailyIncome = getTotalDailyIncome()

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const closeModal = useCallback(() => setShowModal(false), [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
        setPurchaseModal(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [closeModal])

  const handlePurchase = async () => {
    if (!purchaseModal) return
    setPurchasing(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    const result = purchaseProduct(purchaseModal)
    if (result.success) {
      showToast(`${purchaseModal.name} წარმატებით შეძენილია!`, 'success')
      setPurchaseModal(null)
    } else {
      showToast(result.error || 'შეცდომა', 'error')
    }
    setPurchasing(false)
  }

  const quickActions = [
    { icon: 'ri-wallet-3-line', label: 'შევსება', action: () => navigate('/user/index') },
    { icon: 'ri-upload-2-line', label: 'გატანა', action: () => navigate('/user/index') },
    { icon: 'ri-cpu-line', label: 'მაინერები', action: () => navigate('/device/index') },
    { icon: 'ri-customer-service-2-line', label: 'სერვისი', action: () => showToast('მალე დაემატება', 'info') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-brand">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-brand to-indigo-600 p-6 rounded-b-3xl">
        <h1 className="text-white text-2xl font-bold text-center">CryptoMine</h1>
        <p className="text-purple-200 text-xs text-center mt-1">Cloud Mining Platform</p>
        {/* Balance Badge */}
        <div className="flex justify-center mt-3">
          <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 flex items-center gap-2">
            <i className="ri-wallet-3-line text-white"></i>
            <span className="text-white font-bold text-sm">₾{balance.toFixed(2)}</span>
            {dailyIncome > 0 && (
              <span className="text-green-300 text-xs">+₾{dailyIncome.toFixed(1)}/დღე</span>
            )}
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="px-4 -mt-4">
        <div className="relative rounded-xl overflow-hidden shadow-lg h-[160px]">
          <img
            src={carouselImages[carouselIndex]}
            alt="carousel"
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {carouselImages.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === carouselIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around px-4 py-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className="flex flex-col items-center gap-1 hover:scale-110 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-brand to-violet-soft flex items-center justify-center shadow-md">
              <i className={`${action.icon} text-white text-xl`}></i>
            </div>
            <span className="text-xs text-gray-300 font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Product Cards */}
      <div className="px-4 space-y-4 pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-700"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[140px] object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white text-lg">{product.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                  დღე: {product.days}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500 text-xs">დღიური:</span>{' '}
                  <span className="font-semibold text-green-600">₾{product.dailyIncome}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">ჯამური:</span>{' '}
                  <span className="font-semibold text-white">₾{product.totalIncome.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Hash:</span>{' '}
                  <span className="font-semibold text-purple-brand">{product.hashRate}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">₾{product.price.toLocaleString()}</span>
                <button
                  onClick={() => setPurchaseModal(product)}
                  className="bg-gradient-to-r from-purple-brand to-violet-soft text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  შეძენა
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[360px] relative animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 active:scale-90 transition-all"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
            <h2 className="text-xl font-bold text-navy text-center mb-3">შეტყობინება</h2>
            <p className="text-gray-600 text-sm text-center mb-5 leading-relaxed">
              ეს არის დემო ვერსია. აპლიკაცია შექმნილია მხოლოდ საპრეზენტაციო მიზნით.
              არანაირი რეალური ტრანზაქცია არ ხორციელდება.
            </p>
            <button
              onClick={closeModal}
              className="w-full bg-gradient-to-r from-purple-brand to-cyan-accent text-white py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              გასაგებია
            </button>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {purchaseModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={() => !purchasing && setPurchaseModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-navy text-center mb-4">
              შეძენის დადასტურება
            </h2>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">პროდუქტი:</span>
                <span className="font-bold text-navy">{purchaseModal.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ფასი:</span>
                <span className="font-bold text-navy">₾{purchaseModal.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">დღიური შემოსავალი:</span>
                <span className="font-bold text-green-600">₾{purchaseModal.dailyIncome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ვადა:</span>
                <span className="font-bold text-navy">{purchaseModal.days} დღე</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ჯამური მოგება:</span>
                <span className="font-bold text-green-600">₾{purchaseModal.totalIncome.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">თქვენი ბალანსი:</span>
                <span className={`font-bold ${balance >= purchaseModal.price ? 'text-green-600' : 'text-red-500'}`}>
                  ₾{balance.toFixed(2)}
                </span>
              </div>
            </div>

            {balance < purchaseModal.price && (
              <p className="text-red-500 text-xs text-center mb-3">
                ⚠️ არასაკმარისი ბალანსი. გთხოვთ შეავსოთ ₾{(purchaseModal.price - balance).toFixed(2)}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPurchaseModal(null)}
                disabled={purchasing}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                გაუქმება
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing || balance < purchaseModal.price}
                className="flex-1 bg-gradient-to-r from-purple-brand to-violet-soft text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-1">
                    <i className="ri-loader-4-line animate-spin"></i>
                  </span>
                ) : (
                  'შეძენა'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
