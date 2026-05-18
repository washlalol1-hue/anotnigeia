function Profile() {
  const menuItems = [
    { icon: 'ri-information-line', label: 'ჩვენ შესახებ' },
    { icon: 'ri-file-list-3-line', label: 'ბალანსის ჩანაწერები' },
    { icon: 'ri-download-2-line', label: 'გამოტანის ჩანაწერები' },
    { icon: 'ri-upload-2-line', label: 'შევსების ჩანაწერები' },
    { icon: 'ri-bank-card-line', label: 'გატანის ანგარიში' },
    { icon: 'ri-download-cloud-line', label: 'აპლიკაციის ჩამოტვირთვა' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Gradient Section */}
      <div className="bg-gradient-to-br from-purple-brand to-indigo-700 pt-8 pb-16 px-4 rounded-b-3xl">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <i className="ri-vip-crown-2-fill text-yellow-300 text-3xl"></i>
          </div>
          <p className="text-white/70 text-xs">User ID: 574642424</p>
        </div>

        {/* Balance */}
        <div className="text-center mt-4">
          <p className="text-white/70 text-sm">ჩემი ბალანსი</p>
          <p className="text-white text-3xl font-bold">₾ 7</p>
        </div>

        {/* Two Buttons */}
        <div className="flex gap-3 mt-4 justify-center">
          <button className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 active:scale-95 transition-all">
            შევსება
          </button>
          <button className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 active:scale-95 transition-all">
            გატანა
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-lg p-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-500">შევსება</p>
            <p className="font-bold text-navy">₾0</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-xs text-gray-500">გატანა</p>
            <p className="font-bold text-navy">₾0</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-xs text-gray-500">ჩემი პროდუქტები</p>
            <p className="font-bold text-navy">0</p>
          </div>
        </div>
      </div>

      {/* Menu Card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <i className={`${item.icon} text-purple-brand text-lg`}></i>
            <span className="text-sm text-navy">{item.label}</span>
            <i className="ri-arrow-right-s-line text-gray-300 ml-auto"></i>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6 pb-4">
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-brand text-white py-3 rounded-full font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
          გასვლა
        </button>
      </div>
    </div>
  )
}

export default Profile
