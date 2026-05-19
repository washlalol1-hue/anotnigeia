import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'

function Share() {
  const [showCopyPopup, setShowCopyPopup] = useState(false)
  const { user, users } = useAuthStore()
  const { referrals } = useUserStore()
  const { showToast } = useToast()

  const inviteCode = user?.inviteCode || 'N/A'
  const inviteLink = `https://cryptomine-app.com/register?inviteCode=${inviteCode}`

  // Calculate team members from registered users who used this user's invite code
  const directReferrals = users.filter((u) => u.referredBy === user?.id)
  const level2Referrals = users.filter((u) => 
    directReferrals.some((dr) => dr.id === u.referredBy)
  )
  const level3Referrals = users.filter((u) => 
    level2Referrals.some((lr) => lr.id === u.referredBy)
  )

  const totalTeam = directReferrals.length + level2Referrals.length + level3Referrals.length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setShowCopyPopup(true)
      showToast('ბმული დაკოპირებულია!', 'success')
      setTimeout(() => setShowCopyPopup(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopyPopup(true)
      showToast('ბმული დაკოპირებულია!', 'success')
      setTimeout(() => setShowCopyPopup(false), 2000)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      showToast('კოდი დაკოპირებულია: ' + inviteCode, 'success')
    } catch {
      showToast('კოდი: ' + inviteCode, 'info')
    }
  }

  const levels = [
    { level: 1, name: 'დონე 1', percent: '25%', people: directReferrals.length, description: 'პირდაპირი მოწვეული' },
    { level: 2, name: 'დონე 2', percent: '2%', people: level2Referrals.length, description: 'მეორე დონის' },
    { level: 3, name: 'დონე 3', percent: '1%', people: level3Referrals.length, description: 'მესამე დონის' },
  ]

  const totalRewards = referrals.reduce((sum, r) => sum + r.totalEarnings, 0)

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
            <p className="text-white text-2xl font-bold">{totalTeam}</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div>
            <p className="text-white/70 text-xs">ჯამური ჯილდოები</p>
            <p className="text-white text-2xl font-bold">₾{totalRewards.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
        <p className="text-xs text-gray-500 mb-2">მოწვევის კოდი</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-dashed border-purple-brand/30 rounded-lg px-4 py-3 text-center">
            <span className="text-lg font-bold text-purple-brand tracking-wider">{inviteCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="bg-purple-brand text-white px-4 py-3 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <i className="ri-file-copy-line"></i>
          </button>
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

      {/* How It Works */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
        <h3 className="text-white font-bold text-sm mb-2">
          <i className="ri-question-line mr-1"></i> როგორ მუშაობს?
        </h3>
        <ul className="space-y-1.5 text-white/80 text-xs">
          <li>• გააზიარეთ თქვენი კოდი ან ბმული</li>
          <li>• როცა ვინმე დარეგისტრირდება თქვენი კოდით</li>
          <li>• მიიღებთ კომისიას მათი შემოსავლიდან</li>
          <li>• 3 დონის სისტემა: 25% → 2% → 1%</li>
        </ul>
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  item.level === 1
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                    : item.level === 2
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-400'
                    : 'bg-gradient-to-br from-green-400 to-emerald-400'
                }`}>
                  {item.level}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">კომისია: {item.percent}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy">{item.people}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
            </div>

            {/* Show direct referral names */}
            {item.level === 1 && directReferrals.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">მოწვეულები:</p>
                <div className="flex flex-wrap gap-1">
                  {directReferrals.map((r) => (
                    <span key={r.id} className="text-xs bg-purple-50 text-purple-brand px-2 py-0.5 rounded-full">
                      {r.phone.substring(0, 3)}***{r.phone.substring(r.phone.length - 2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Copy Success Popup */}
      {showCopyPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-brand text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fade-in">
          <i className="ri-check-line mr-2"></i>კოპირებულია
        </div>
      )}
    </div>
  )
}

export default Share
