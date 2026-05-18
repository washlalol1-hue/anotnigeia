import { useState } from 'react'

function MyProducts() {
  const [showSample, setShowSample] = useState(false)

  return (
    <div className="min-h-screen bg-purple-brand">
      <div className="p-4">
        {/* White Card Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-navy">პროდუქტის დეტალები</h2>
            <button
              onClick={() => setShowSample((prev) => !prev)}
              className="text-sm font-bold text-purple-brand hover:opacity-80 transition-opacity"
            >
              {showSample ? 'დამალვა' : 'ჩემი პროდუქტი'}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showSample ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16">
                <i className="ri-shopping-bag-line text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-400 text-base">პროდუქტები არ არის</p>
              </div>
            ) : (
              /* Sample Product Card */
              <div className="bg-gray-100 rounded-xl border-2 border-navy/20 p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-brand to-violet-soft flex items-center justify-center">
                    <i className="ri-ship-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">იახტა-1</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      At Work
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">დღიური შემოსავალი</p>
                    <p className="text-sm font-bold text-navy">₾2.5</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">საათობრივი შემოსავალი</p>
                    <p className="text-sm font-bold text-navy">₾0.10</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">პროდუქტის ფასი</p>
                    <p className="text-sm font-bold text-navy">₾20</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">startTime</p>
                    <p className="text-sm font-bold text-navy">2026-05-18</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProducts
