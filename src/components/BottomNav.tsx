import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'ri-home-line', label: '\u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8' },
  { to: '/device/index', icon: 'ri-cpu-line', label: '\u10DB\u10D0\u10D8\u10DC\u10D4\u10E0\u10D4\u10D1\u10D8' },
  { to: '/user/blog', icon: 'ri-article-line', label: '\u10D1\u10DA\u10DD\u10D2\u10D8' },
  { to: '/share/index', icon: 'ri-megaphone-line', label: '\u10D2\u10D0\u10D6\u10D8\u10D0\u10E0\u10D4\u10D1\u10D0' },
  { to: '/user/index', icon: 'ri-user-line', label: '\u10E9\u10D4\u10DB\u10D8' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 rounded-t-2xl shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs ${
                isActive ? 'text-purple-brand' : 'text-gray-500'
              }`
            }
          >
            <i className={`${item.icon} text-xl`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
