import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import MyProducts from './pages/MyProducts'
import Blog from './pages/Blog'
import Share from './pages/Share'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function App() {
  return (
    <div className="max-w-[450px] mx-auto min-h-screen relative bg-white">
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/device/index" element={<MyProducts />} />
          <Route path="/user/blog" element={<Blog />} />
          <Route path="/share/index" element={<Share />} />
          <Route path="/user/index" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default App
