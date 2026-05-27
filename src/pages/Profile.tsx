import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserStore, Transaction } from '../stores/userStore'
import { useToast } from '../components/Toast'

type ModalType = 'deposit' | 'withdraw' | 'history' | 'account' | 'about' | null

function Profile() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [amount, setAmount] = useState('')
  const [accountInput, setAccountInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | Transaction['type']>('all')

  const { user, logout } = useAuthStore()
  const {
    balance,
    totalDeposits,
    totalWithdrawals,
    purchasedProducts,
    transactions,
    withdrawalAccount,
    deposit,
    withdraw,
    setWithdrawalAccount,
    loadProfile,
    loadTransactions,
    loadMyProducts,
  } = useUserStore()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadProfile()
    loadTransactions()
    loadMyProducts()
  }, [])

  const handleDeposit = async () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 1) {
      showToast('მინიმალური შევსება: ₾1', 'error')
      return
    }
    setProcessing(true)
    const result = await deposit(val)
    if (result.success) {
      showToast(`₾${val} წარმატებით შეივსო!`, 'success')
      setAmount('')
      setActiveModal(null)
      loadTransactions()
    } else {
      showToast(result.error || 'შეცდომა', 'error')
    }
    setProcessing(false)
  }

  const handleWithdraw = async () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 5) {
      showToast('მინიმალური გატანა: ₾5', 'error')
      return
    }
    setProcessing(true)
    const result = await withdraw(val)
    if (result.success) {
      showToast(`₾${val} გატანა მუშავდება (5-30 წუთი)`, 'success')
      setAmount('')
      setActiveModal(null)
      loadTransactions()
    } else {
      showToast(result.error || 'შეცდომა', 'error')
    }
    setProcessing(false)
  }

  const handleSetAccount = async () => {
    if (accountInput.length < 5) {
      showToast('გთხოვთ შეიყვანოთ ვალიდური ანგარიში', 'error')
      return
    }
    const result = await setWithdrawalAccount(accountInput)
    if (result.success) {
      showToast('ანგარიში შენახულია', 'success')
      setActiveModal(null)
    } else {
      showToast(result.error || 'შეცდომა', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredTransactions =
    historyFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === historyFilter)

  const menuItems = [
    { icon: 'ri-information-line', label: 'ჩვენ შესახებ', action: () => setActiveModal('about') },
    { icon: 'ri-file-list-3-line', label: 'ბალანსის ჩანაწერები', action: () => setActiveModal('history') },
    { icon: 'ri-download-2-line', label: 'გამოტანის ჩანაწერები', action: () => { setHistoryFilter('withdrawal'); setActiveModal('history') } },
    { icon: 'ri-upload-2-line', label: 'შევსების ჩანაწერები', action: () => { setHistoryFilter('deposit'); setActiveModal('history') } },
    { icon: 'ri-bank-card-line', label: 'გატანის ანგარიში', action: () => { setAccountInput(withdrawalAccount || ''); setActiveModal('account') } },
    { icon: 'ri-download-cloud-line', label: 'აპლიკაციის ჩამოტვირთვა', action: () => showToast('მალე ხელმისაწვდომი იქნება', 'info') },
  ]

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'ri-add-circle-line text-green-500'
      case 'withdrawal': return 'ri-subtract-line text-red-500'
      case 'purchase': return 'ri-shopping-bag-line text-purple-brand'
      case 'earning': return 'ri-money-dollar-circle-line text-green-600'
      case 'referral_bonus': return 'ri-gift-line text-yellow-500'
      default: return 'ri-exchange-line text-gray-500'
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">✓</span>
      case 'pending': return <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded">⏳</span>
      case 'failed': return <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">✗</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-brand">
      {/* Top Gradient Section */}
      <div className="bg-gradient-to-br from-purple-brand to-indigo-700 pt-8 pb-16 px-4 rounded-b-3xl">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <i className="ri-vip-crown-2-fill text-yellow-300 text-3xl"></i>
          </div>
          <p className="text-white/70 text-xs">User ID: {user?.id?.substring(0, 8) || '---'}</p>
          <p className="text-white/50 text-[10px] mt-0.5">{user?.phone}</p>
        </div>

        {/* Balance */}
        <div className="text-center mt-4">
          <p className="text-white/70 text-sm">ჩემი ბალანსი</p>
          <p className="text-white text-3xl font-bold">₾ {balance.toFixed(2)}</p>
        </div>

        {/* Two Buttons */}
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => setActiveModal('deposit')}
            className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
          >
            <i className="ri-add-line mr-1"></i>შევსება
          </button>
          <button
            onClick={() => setActiveModal('withdraw')}
            className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
          >
            <i className="ri-upload-2-line mr-1"></i>გატანა
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-4 -mt-8 bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-700">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-500">შევსება</p>
            <p className="font-bold text-white">₾{totalDeposits.toFixed(0)}</p>
          </div>
          <div className="w-px bg-gray-600"></div>
          <div>
            <p className="text-xs text-gray-400">გატანა</p>
            <p className="font-bold text-white">₾{totalWithdrawals.toFixed(0)}</p>
          </div>
          <div className="w-px bg-gray-600"></div>
          <div>
            <p className="text-xs text-gray-400">მაინერები</p>
            <p className="font-bold text-white">{purchasedProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Menu Card */}
      <div className="mx-4 mt-4 bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-700">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-700 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-gray-700' : ''
            }`}
          >
            <i className={`${item.icon} text-purple-brand text-lg`}></i>
            <span className="text-sm text-gray-200">{item.label}</span>
            <i className="ri-arrow-right-s-line text-gray-500 ml-auto"></i>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6 pb-4">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-brand text-white py-3 rounded-full font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          გასვლა
        </button>
      </div>

      {/* MODALS */}

      {/* Deposit Modal */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-[450px] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy text-center mb-4">ბალანსის შევსება</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[10, 50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    amount === String(val)
                      ? 'bg-purple-brand text-white border-purple-brand'
                      : 'bg-gray-50 text-navy border-gray-200 hover:border-purple-brand'
                  }`}
                >
                  ₾{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ან შეიყვანეთ თანხა..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-brand"
            />
            <button
              onClick={handleDeposit}
              disabled={processing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {processing ? <i className="ri-loader-4-line animate-spin"></i> : 'შევსება'}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-[450px] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy text-center mb-2">თანხის გატანა</h3>
            <p className="text-xs text-gray-400 text-center mb-4">ხელმისაწვდომი: ₾{balance.toFixed(2)} | მინიმალური: ₾5</p>
            {withdrawalAccount ? (
              <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3">
                ანგარიში: {withdrawalAccount}
              </p>
            ) : (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
                ⚠️ ჯერ დააყენეთ გატანის ანგარიში მენიუდან
              </p>
            )}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="შეიყვანეთ თანხა (მინ. ₾5)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-brand"
            />
            <button
              onClick={handleWithdraw}
              disabled={processing || !withdrawalAccount}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {processing ? <i className="ri-loader-4-line animate-spin"></i> : 'გატანა'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => { setActiveModal(null); setHistoryFilter('all') }}>
          <div className="bg-white rounded-t-2xl p-4 w-full max-w-[450px] max-h-[70vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy text-center mb-3">ტრანზაქციები</h3>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {(['all', 'deposit', 'withdrawal', 'purchase', 'earning'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                    historyFilter === f ? 'bg-purple-brand text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {f === 'all' ? 'ყველა' : f === 'deposit' ? 'შევსება' : f === 'withdrawal' ? 'გატანა' : f === 'purchase' ? 'შეძენა' : 'შემოსავალი'}
                </button>
              ))}
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">ჩანაწერები არ არის</p>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <i className={`${getTypeIcon(tx.type)} text-xl`}></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-navy truncate">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(tx.created_at).toLocaleString('ka-GE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount >= 0 ? '+' : ''}₾{Math.abs(tx.amount).toFixed(2)}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set Account Modal */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy text-center mb-4">გატანის ანგარიში</h3>
            <p className="text-xs text-gray-400 mb-3">შეიყვანეთ საბანკო ანგარიში, TBC Pay ან BOG ნომერი</p>
            <input
              type="text"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              placeholder="მაგ: GE00TB0000000000000000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-brand"
            />
            <button
              onClick={handleSetAccount}
              className="w-full bg-gradient-to-r from-purple-brand to-violet-soft text-white py-3 rounded-xl font-medium"
            >
              შენახვა
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <i className="ri-cpu-line text-purple-brand text-4xl mb-3"></i>
              <h3 className="text-xl font-bold text-navy mb-2">CryptoMine Platform</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                CryptoMine არის კლაუდ მაინინგის პლატფორმა. შეიძინეთ ვირტუალური მაინერები და მიიღეთ ყოველდღიური შემოსავალი.
              </p>
              <p className="text-xs text-red-400">⚠️ ეს არის დემო ვერსია</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
