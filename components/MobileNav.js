import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  FaHome,
  FaServer,
  FaRocket,
  FaCog,
  FaBars,
  FaTimes,
  FaUser,
  FaBell
} from 'react-icons/fa'

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/deployments', label: 'Deployments', icon: <FaRocket /> },
    { path: '/projects', label: 'Projects', icon: <FaServer /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-effect border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
            
            <div>
              <h1 className="text-xl font-bold gradient-text">CyberVercel</h1>
              <p className="text-xs text-gray-400">v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center relative">
              <FaBell />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </button>
            
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <FaUser />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sidebar */}
        <div className="absolute inset-y-0 left-0 w-64 bg-dark-900 border-r border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <i className="fas fa-rocket text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold">CyberVercel</h2>
                <p className="text-sm text-gray-400">Admin Panel</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        router.pathname === item.path
                          ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30'
                          : 'text-gray-400 hover:text-white hover:bg-dark-800'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={`text-lg ${router.pathname === item.path ? 'text-neon-blue' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                      {item.label === 'Projects' && (
                        <span className="ml-auto w-6 h-6 bg-neon-blue/20 text-neon-blue text-xs rounded-full flex items-center justify-center">
                          12
                        </span>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400 mb-3 px-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-xl bg-dark-800 hover:bg-neon-blue/20 text-left transition-colors flex items-center gap-3">
                  <i className="fas fa-plus text-neon-blue"></i>
                  <span>New Project</span>
                </button>
                <button className="w-full p-3 rounded-xl bg-dark-800 hover:bg-neon-purple/20 text-left transition-colors flex items-center gap-3">
                  <i className="fas fa-sync text-neon-purple"></i>
                  <span>Sync All</span>
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                    <span className="text-xs text-gray-400">All Systems Operational</span>
                  </div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">
                  v2.0.1
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-20"></div>
    </>
  )
}

export default MobileNav
