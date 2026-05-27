import { useState, useEffect } from 'react'
import { useBlogStore } from '../stores/blogStore'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'
import { api } from '../services/api'

function Blog() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [stats, setStats] = useState<{ todayWithdrawals: string; totalWithdrawals: string }>({ todayWithdrawals: '0', totalWithdrawals: '0' })

  const { posts, loadPosts, createPost } = useBlogStore()
  const { balance, loadProfile } = useUserStore()
  const { showToast } = useToast()

  useEffect(() => {
    loadPosts()
    loadProfile()
    api.getStats().then((data) => {
      setStats({
        todayWithdrawals: data.todayWithdrawals || '0',
        totalWithdrawals: data.totalWithdrawals || '0',
      })
    }).catch(() => {})
  }, [])

  const handlePost = async () => {
    if (!newComment.trim()) {
      showToast('გთხოვთ დაწეროთ კომენტარი', 'error')
      return
    }
    setPosting(true)

    const result = await createPost(newComment)
    if (result.success) {
      showToast(`პოსტი გამოქვეყნდა! ჯილდო: ₾${result.reward?.toFixed(2) || '0.00'}`, 'success')
      setNewComment('')
      setShowPostModal(false)
      loadProfile()
    } else {
      showToast(result.error || 'შეცდომა', 'error')
    }
    setPosting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-brand">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-4 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ri-money-dollar-circle-line text-white text-xl"></i>
            <h1 className="text-white font-bold text-lg">გატანის მტკიცებულებები</h1>
          </div>
          <span className="text-white/80 text-xs bg-white/20 px-2 py-1 rounded-full">
            {posts.length} გატანა
          </span>
        </div>
        <p className="text-white/80 text-xs mt-2">
          რეალური მომხმარებლების გატანები • გააზიარეთ და მიიღეთ ბონუსი
        </p>
      </div>

      {/* Stats Banner */}
      <div className="mx-4 -mt-3 bg-white rounded-xl shadow-lg p-3 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-[10px] text-gray-400">დღევანდელი გატანები</p>
            <p className="text-sm font-bold text-green-600">₾{stats.todayWithdrawals}</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-[10px] text-gray-400">ჯამური გატანილი</p>
            <p className="text-sm font-bold text-navy">₾{stats.totalWithdrawals}</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-[10px] text-gray-400">თქვენი ბალანსი</p>
            <p className="text-sm font-bold text-purple-brand">₾{balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Top Referrers + Giveaway */}
      <div className="mx-4 mb-4">
        {/* Giveaway Banner */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl p-4 mb-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6"></div>
          <div className="absolute bottom-0 left-0 w-14 h-14 bg-white/10 rounded-full -ml-4 -mb-4"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-gift-2-line text-white text-2xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">MEGA GIVEAWAY ₾10,000</p>
              <p className="text-white/80 text-[10px] mt-0.5">ტოპ 3 რეფერერი იღებს პრიზს! მოიწვიე მეგობრები და მოიგე</p>
            </div>
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className="text-white text-[10px] font-medium">3 დღე</p>
              <p className="text-white/70 text-[8px]">დარჩა</p>
            </div>
          </div>
        </div>

        {/* Top 3 Referrers */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-trophy-line text-yellow-400"></i>
            <p className="text-white font-bold text-sm">ტოპ რეფერერები -- თვის გამარჯვებულები</p>
          </div>
          <div className="space-y-2.5">
            {/* 1st place */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                1
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">59*****23</p>
                <p className="text-gray-400 text-[10px]">47 მოწვეული • ₾12,350 ბონუსი</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-sm">₾5,000</p>
                <p className="text-gray-500 text-[10px]">პრიზი</p>
              </div>
            </div>
            {/* 2nd place */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-400/10 to-transparent rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                2
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">55*****91</p>
                <p className="text-gray-400 text-[10px]">38 მოწვეული • ₾8,920 ბონუსი</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 font-bold text-sm">₾3,000</p>
                <p className="text-gray-500 text-[10px]">პრიზი</p>
              </div>
            </div>
            {/* 3rd place */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                3
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">57*****45</p>
                <p className="text-gray-400 text-[10px]">29 მოწვეული • ₾6,180 ბონუსი</p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold text-sm">₾2,000</p>
                <p className="text-gray-500 text-[10px]">პრიზი</p>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-[10px] text-center mt-3">მოიწვიე 10+ ადამიანი და მოხვდი ტოპ სიაში!</p>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="px-4 space-y-4 pb-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {post.username[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{post.username}</p>
                  <p className="text-[10px] text-gray-400">{post.created_at}</p>
                </div>
              </div>
              {/* Withdrawal badge */}
              {post.withdraw_amount && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                  <p className="text-[10px] text-green-600 font-medium">გატანილია</p>
                  <p className="text-sm font-bold text-green-700">₾{post.withdraw_amount.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Image - miner related */}
            <div
              className="h-[180px] cursor-pointer relative"
              onClick={() => setPreviewImage(post.image)}
            >
              <img
                src={post.image}
                alt="mining proof"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <i className="ri-check-double-line text-green-400 text-xs"></i>
                <span className="text-white text-[10px]">დადასტურებული</span>
              </div>
            </div>

            {/* Comment */}
            <div className="p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{post.comment}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <i className="ri-gift-line text-purple-brand"></i>
                <span className="text-xs text-gray-500">ჯილდო: ₾{post.reward}</span>
              </div>
              {post.method && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {post.method}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no posts */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <i className="ri-article-line text-white/30 text-5xl mb-4"></i>
          <p className="text-white/50">პოსტები არ არის</p>
        </div>
      )}

      {/* Floating + Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-40 pointer-events-none">
        <button
          onClick={() => setShowPostModal(true)}
          className="absolute bottom-0 right-4 w-14 h-14 bg-green-500 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-90 transition-transform pointer-events-auto"
        >
          <i className="ri-add-line"></i>
        </button>
      </div>

      {/* New Post Modal */}
      {showPostModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center"
          onClick={() => !posting && setShowPostModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full max-w-[450px] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-navy text-center mb-2">
              გატანის გაზიარება
            </h3>
            <p className="text-xs text-gray-400 text-center mb-4">
              გააზიარეთ თქვენი წარმატებული გატანა და მიიღეთ ₾0.20 - ₾0.70 ჯილდო
            </p>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="დაწერეთ რამდენი გაიტანეთ, რა მეთოდით და რამდენ ხანში ჩამოვიდა..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-brand resize-none"
            />

            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
              <i className="ri-image-line text-green-500"></i>
              <span>ტრანზაქციის სკრინშოტი ავტომატურად დაემატება</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPostModal(false)}
                disabled={posting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
              >
                გაუქმება
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !newComment.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {posting ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  <span>
                    <i className="ri-send-plane-line mr-1"></i>გამოქვეყნება
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition-transform"
            onClick={() => setPreviewImage(null)}
          >
            <i className="ri-close-line"></i>
          </button>
          <img
            src={previewImage}
            alt="preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

export default Blog
