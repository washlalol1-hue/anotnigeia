import { useState } from 'react'
import { useBlogStore } from '../stores/blogStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../components/Toast'

function Blog() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  const { posts, addPost } = useBlogStore()
  const { user } = useAuthStore()
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
    <div className="min-h-screen bg-gradient-to-b from-violet-soft to-blue-soft">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <i className="ri-article-line text-white text-xl"></i>
          <h1 className="text-white font-bold text-lg">თანხის გატანა</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-full">
            {posts.length} პოსტი
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-white/80 text-xs text-center px-6 mb-4">
        ჯილდოს მისაღებად გააზიარეთ ეკრანის ანაბეჭდი.
      </p>

      {/* Feed Cards */}
      <div className="px-4 space-y-4 pb-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-[10px] shadow-md overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-brand to-violet-soft flex items-center justify-center text-white font-bold">
                {post.username[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{post.username}</p>
                <p className="text-[10px] text-gray-400">{post.timestamp}</p>
              </div>
            </div>

            {/* Image */}
            <div
              className="h-[200px] cursor-pointer"
              onClick={() => setPreviewImage(post.image)}
            >
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Comment */}
            <div className="p-3">
              <p className="text-sm text-teal-800">{post.comment}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1 px-3 pb-3">
              <i className="ri-gift-line text-purple-brand"></i>
              <span className="text-xs text-gray-500">ჯილდო: {post.reward} ₾</span>
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

      {/* Bottom indicator */}
      <p className="text-white/50 text-xs text-center pb-4">
        მეტი მონაცემი არ არის
      </p>

      {/* Floating + Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-40 pointer-events-none">
        <button
          onClick={() => setShowPostModal(true)}
          className="absolute bottom-0 right-4 w-14 h-14 bg-purple-brand rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-90 transition-transform pointer-events-auto"
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
              გააზიარეთ თქვენი გამოცდილება და მიიღეთ ჯილდო
            </p>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="დაწერეთ თქვენი კომენტარი..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:border-purple-brand resize-none"
            />

            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
              <i className="ri-image-line text-purple-brand"></i>
              <span>ეკრანის სურათი ავტომატურად დაემატება</span>
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
                className="flex-1 bg-gradient-to-r from-purple-brand to-violet-soft text-white py-3 rounded-xl font-medium disabled:opacity-50"
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
