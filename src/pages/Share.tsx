import { useState } from 'react'

function Share() {
  const [showCopyPopup, setShowCopyPopup] = useState(false)
  const inviteLink = 'https://example.com/login/register?inviteCode=demo123'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
    } catch {
      // fallback: do nothing in demo
    }
    setShowCopyPopup(true)
    setTimeout(() => setShowCopyPopup(false), 2000)
  }

  const levels = [
    { level: 1, name: 'დონე 1', percent: '25%', reward: '₾0.00', people: 1 },
    { level: 2, name: 'დონე 2', percent: '2%', reward: '₾0.00', people: 0 },
    { level: 3, name: 'დონე 3', percent: '1%', reward: '₾0.00', people: 0 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-brand to-indigo-700 p-4">
      {/* Header */}
      <h1 className="text-white text-xl font-bold text-center mb-6">
        პოპულარიზაცია და გაზიარება
      </h1>

      {/* Stats Card */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-white/70 text-xs">გუნდი</p>
            <p className="text-white text-2xl font-bold">1</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div>
            <p className="text-white/70 text-xs">ჯამური ჯილდოები</p>
            <p className="text-white text-2xl font-bold">0.00</p>
          </div>
        </div>
      </div>

      {/* Invitation Link Card */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
        <p className="text-xs text-gray-500 mb-2">მოწვევის ბმული</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600 truncate">
            {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className="bg-gradient-to-r from-purple-brand to-violet-soft text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            ასლი
          </button>
        </div>
      </div>

      {/* Level Cards */}
      <div className="space-y-3">
        {levels.map((item) => (
          <div
            key={item.level}
            className="bg-white rounded-2xl p-4 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                  {item.level}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">კომისია: {item.percent}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy">{item.reward}</p>
                <p className="text-xs text-gray-400">{item.people} ადამიანი</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Copy Success Popup */}
      {showCopyPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-brand text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fade-in">
          Copy succeeded
        </div>
      )}
    </div>
  )
}

export default Share
