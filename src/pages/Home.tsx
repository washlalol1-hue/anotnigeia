import { useState, useEffect, useCallback } from 'react'
import { products } from '../data/products'

const carouselImages = [
  'https://picsum.photos/400/200?random=1',
  'https://picsum.photos/400/200?random=2',
  'https://picsum.photos/400/200?random=3',
  'https://picsum.photos/400/200?random=4',
]

function Home() {
  const [showModal, setShowModal] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [carouselImages.length])

  const closeModal = useCallback(() => setShowModal(false), [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    if (showModal) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [showModal, closeModal])

  const quickActions = [
    { icon: 'ri-wallet-3-line', label: 'შევსება' },
    { icon: 'ri-upload-2-line', label: 'გატანა' },
    { icon: 'ri-treasure-map-line', label: 'განძი' },
    { icon: 'ri-customer-service-2-line', label: 'სერვისი' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-brand to-indigo-600 p-6 rounded-b-3xl">
        <h1 className="text-white text-2xl font-bold text-center">Princess</h1>
        <p className="text-purple-200 text-xs text-center mt-1">Luxury Yacht Platform</p>
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
            className="flex flex-col items-center gap-1 hover:scale-110 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-brand to-violet-soft flex items-center justify-center shadow-md">
              <i className={`${action.icon} text-white text-xl`}></i>
            </div>
            <span className="text-xs text-gray-700 font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Product Cards */}
      <div className="px-4 space-y-4 pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[140px] object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-navy text-lg">{product.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  დღე: {product.days}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">დღიური:</span>{' '}
                  <span className="font-semibold text-green-600">₾{product.dailyIncome}</span>
                </div>
                <div>
                  <span className="text-gray-500">ჯამური:</span>{' '}
                  <span className="font-semibold text-navy">₾{product.totalIncome.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-navy">₾{product.price.toLocaleString()}</span>
                <button className="bg-gradient-to-r from-purple-brand to-violet-soft text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
                  შეძენა
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
            <button className="w-full bg-gradient-to-r from-purple-brand to-cyan-accent text-white py-3 rounded-full font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
              🚀შემოგვიერთდით ოფიციალურ არხს
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
