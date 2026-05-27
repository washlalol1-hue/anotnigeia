import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'

function Share() {
  const [showCopyPopup, setShowCopyPopup] = useState(false)
  const { user } = useAuthStore()
  const { referrals, balance, inviteCode, loadReferrals, loadProfile } = useUserStore()
  const { showToast } = useToast()

  useEffect(() => {
    loadReferrals()
    loadProfile()
  }, [])

  const displayInviteCode = inviteCode || user?.inviteCode || 'N/A'
  const inviteLink = `https://cryptomine-app.com/register?inviteCode=${displayInviteCode}`

  // Calculate team members by level
  const directReferrals = referrals.filter((r) => r.level === 1)
  const level2Referrals = referrals.filter((r) => r.level === 2)
  const level3Referrals = referrals.filter((r) => r.level === 3)

  const totalTeam = referrals.length
  const totalRewards = referrals.reduce((sum, r) => sum + r.total_earnings, 0)

  // Commission rates
  const commissionRates: Record<number, number> = { 1: 0.25, 2: 0.02, 3: 0.01 }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setShowCopyPopup(true)
    showToast('ბმული დაკოპირებულია!', 'success')
    setTimeout(() => setShowCopyPopup(false), 2000)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(displayInviteCode)
      showToast('კოდი დაკოპირებულია: ' + displayInviteCode, 'success')
    } catch {
      showToast('კოდი: ' + displayInviteCode, 'info')
    }
  }

  const levels = [
    {
      level: 1,
      name: 'დონე 1 -- პირდაპირი',
      percent: '25%',
      people: directReferrals.length,
      description: 'მოწვეულის შემოსავლის 25%',
      estimatedDaily: directReferrals.length * 2.5 * commissionRates[1],
    },
    {
      level: 2,
      name: 'დონე 2',
      percent: '2%',
      people: level2Referrals.length,
      description: 'მეორე დონის შემოსავლის 2%',
      estimatedDaily: level2Referrals.length * 2.5 * commissionRates[2],
    },
    {
      level: 3,
      name: 'დონე 3',
      percent: '1%',
      people: level3Referrals.length,
      description: 'მესამე დონის შემოსავლის 1%',
      estimatedDaily: level3Referrals.length * 2.5 * commissionRates[3],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-brand p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-white text-xl font-bold">რეფერალ სისტემა</h1>
        <p className="text-white/60 text-xs mt-1">მოიწვიე მეგობრები -- მიიღე 25% კომისია</p>
      </div>

      {/* Big Stats */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-white/60 text-[10px]">გუნდი</p>
            <p className="text-white text-2xl font-bold">{totalTeam}</p>
            <p className="text-white/40 text-[10px]">ადამიანი</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px]">ჯამური ბონუსი</p>
            <p className="text-green-400 text-2xl font-bold">₾{totalRewards.toFixed(0)}</p>
            <p className="text-white/40 text-[10px]">მიღებული</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px]">ბალანსი</p>
            <p className="text-yellow-300 text-2xl font-bold">₾{balance.toFixed(0)}</p>
            <p className="text-white/40 text-[10px]">ხელმისაწვდომი</p>
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-key-2-line text-purple-brand"></i>
          <p className="text-xs font-bold text-navy">თქვენი მოწვევის კოდი</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-dashed border-purple-brand/30 rounded-lg px-4 py-3 text-center">
            <span className="text-xl font-bold text-purple-brand tracking-widest">{displayInviteCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="bg-purple-brand text-white px-4 py-3 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <i className="ri-file-copy-line text-lg"></i>
          </button>
        </div>
        {/* Link */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-600 truncate">
            {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <i className="ri-share-line mr-1"></i>ასლი
          </button>
        </div>
      </div>

      {/* How It Works - Visual */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
        <h3 className="font-bold text-navy text-sm mb-3">
          <i className="ri-flow-chart mr-1 text-purple-brand"></i>როგორ მუშაობს რეფერალი?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-brand font-bold text-xs">1</div>
            <div className="flex-1">
              <p className="text-xs text-navy font-medium">გაუზიარე კოდი მეგობარს</p>
              <p className="text-[10px] text-gray-400">რეგისტრაციისას შეიყვანს თქვენს კოდს</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">2</div>
            <div className="flex-1">
              <p className="text-xs text-navy font-medium">მეგობარი ყიდულობს მაინერს</p>
              <p className="text-[10px] text-gray-400">და იწყებს ყოველდღიურ შემოსავალს</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xs">3</div>
            <div className="flex-1">
              <p className="text-xs text-navy font-medium">იღებთ 25% კომისიას</p>
              <p className="text-[10px] text-gray-400">ავტომატურად, ყოველ დღე მათი შემოსავლიდან</p>
            </div>
          </div>
        </div>

        {/* Example calculation */}
        <div className="mt-3 pt-3 border-t border-gray-100 bg-green-50 rounded-lg p-3">
          <p className="text-[10px] text-green-700 font-medium mb-1">მაგალითი:</p>
          <p className="text-xs text-green-800">
            მეგობარი ყიდულობს Miner Pro (₾17.2/დღე) → თქვენ იღებთ <span className="font-bold">₾4.3/დღე</span> ბონუსს
          </p>
        </div>
      </div>

      {/* Level Cards */}
      <div className="space-y-3 mb-4">
        {levels.map((item) => (
          <div
            key={item.level}
            className="bg-white rounded-2xl p-4 shadow-md"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  item.level === 1
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : item.level === 2
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                    : 'bg-gradient-to-br from-green-400 to-emerald-500'
                }`}>
                  L{item.level}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy text-lg">{item.people}</p>
                <p className="text-[10px] text-gray-400">ადამიანი</p>
              </div>
            </div>

            {/* Estimated earnings */}
            {item.people > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">სავარაუდო დღიური:</span>
                <span className="text-sm font-bold text-green-600">~₾{item.estimatedDaily.toFixed(2)}</span>
              </div>
            )}

            {/* Show referrals for level 1 */}
            {item.level === 1 && directReferrals.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {directReferrals.map((r) => (
                    <span key={r.id} className="text-[10px] bg-purple-50 text-purple-brand px-2 py-0.5 rounded-full">
                      {r.phone.substring(0, 3)}***{r.phone.substring(r.phone.length - 2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <i className="ri-trophy-line text-white text-3xl"></i>
          <div>
            <p className="text-white font-bold text-sm">ტოპ რეფერერი</p>
            <p className="text-white/80 text-xs">ამ თვეში ტოპ რეფერერმა ₾8,500+ მიიღო მხოლოდ ბონუსებიდან!</p>
          </div>
        </div>
      </div>

      {/* Copy Success Popup */}
      {showCopyPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-fade-in">
          <i className="ri-check-line mr-2"></i>კოპირებულია
        </div>
      )}
    </div>
  )
}

export default Share
