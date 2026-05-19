import { useState } from 'react'
import { useBlogStore } from '../stores/blogStore'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useToast } from '../components/Toast'

function Blog() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  const { posts, addPost } = useBlogStore()
  const { user } = useAuthStore()
  const { balance } = useUserStore()
  const { showToast } = useToast()

  const handlePost = async () => {
    if (!newComment.trim()) {
      showToast('გთხოვთ დაწეროთ კომენტარი', 'error')
      return
    }
    setPosting(true)
    await new Promise((r) => setTimeout(r, 1000))

    const maskedPhone = user
      ? `${user.phone.substring(0, 2)}*****${user.phone.substring(user.phone.length - 2)}`
      : 'Anonymous'
    const reward = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2))

    addPost(newComment, reward, maskedPhone)
    showToast(`პოსტი გამოქვეყნდა! ჯილდო: ₾${reward}`, 'success')
    setNewComment('')
    setShowPostModal(false)
    setPosting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
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
            <p className="text-sm font-bold text-green-600">₾12,450</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-[10px] text-gray-400">ჯამური გატანილი</p>
            <p className="text-sm font-bold text-navy">₾2.4M</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <p className="text-[10px] text-gray-400">თქვენი ბალანსი</p>
            <p className="text-sm font-bold text-purple-brand">₾{balance.toFixed(2)}</p>
          </div>
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
                  <p className="text-[10px] text-gray-400">{post.timestamp}</p>
                </div>
              </div>
              {/* Withdrawal badge */}
              {'withdrawAmount' in post && post.withdrawAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                  <p className="text-[10px] text-green-600 font-medium">გატანილია</p>
                  <p className="text-sm font-bold text-green-700">₾{post.withdrawAmount.toLocaleString()}</p>
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
              {'method' in post && post.method && (
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
              გააზიარეთ თქვენი წარმატებული გატანა და მიიღეთ ₾0.20 – ₾0.70 ჯილდო
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
