import { useState } from 'react'
import { blogPosts } from '../data/blogPosts'

function Blog() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-soft to-blue-soft">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button className="text-white hover:scale-110 active:scale-90 transition-transform">
          <i className="ri-arrow-left-line text-2xl"></i>
        </button>
        <h1 className="text-white font-bold text-lg">თანხის გატანა</h1>
        <button className="text-white text-sm hover:scale-110 active:scale-90 transition-transform">
          გაზიარება
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-white/80 text-xs text-center px-6 mb-4">
        ჯილდოს მისაღებად გააზიარეთ ეკრანის ანაბეჭდი.
      </p>

      {/* Fake pull-to-refresh indicator */}
      <p className="text-white/50 text-xs text-center mb-3">
        ↑ მეტი ჩასატვირთად აიწიეთ
      </p>

      {/* Feed Cards */}
      <div className="px-4 space-y-4 pb-4">
        {blogPosts.map((post) => (
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

      {/* Fake bottom indicator */}
      <p className="text-white/50 text-xs text-center pb-4">
        მეტი მონაცემი არ არის
      </p>

      {/* Floating + Button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 bg-purple-brand rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-90 transition-transform z-40">
        <i className="ri-add-line"></i>
      </button>

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
