import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import MobileNav from '../components/MobileNav'
import toast from 'react-hot-toast'
import { 
  FaRocket, 
  FaServer, 
  FaCodeBranch,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSync
} from 'react-icons/fa'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    building: 0,
    error: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, filter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/vercel/projects')
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
        return
      }
      
      setProjects(data.projects || [])
      
      // Calculate stats
      const ready = data.projects?.filter(p => p.latestDeployment?.state === 'READY').length || 0
      const building = data.projects?.filter(p => p.latestDeployment?.state === 'BUILDING').length || 0
      const error = data.projects?.filter(p => p.latestDeployment?.state === 'ERROR').length || 0
      
      setStats({
        total: data.projects?.length || 0,
        ready,
        building,
        error
      })
      
    } catch (error) {
      toast.error('Failed to fetch projects')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(project =>
        project.latestDeployment?.state === filter
      )
    }
    
    setFilteredProjects(filtered)
  }

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Delete project "${projectName}"? This action cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/vercel/projects?id=${projectId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Project deleted successfully')
        fetchProjects()
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      toast.error('Error deleting project')
      console.error(error)
    }
  }

  return (
    <>
      <Head>
        <title>CyberVercel - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <MobileNav />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              <i className="fas fa-rocket mr-3"></i>
              CyberVercel
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Next-gen Vercel project management with GitHub integration
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="neon-button px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-semibold group"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" />
            New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="cyber-border rounded-xl p-4 cyber-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center">
                <FaServer className="text-2xl text-neon-blue" />
              </div>
            </div>
            <div className="mt-2 h-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"></div>
          </div>

          <div className="cyber-border rounded-xl p-4 cyber-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ready</p>
                <p className="text-3xl font-bold text-neon-green">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center">
                <FaRocket className="text-2xl text-neon-green" />
              </div>
            </div>
            <div className="mt-2 h-1 bg-gradient-to-r from-neon-green to-neon-blue rounded-full"></div>
          </div>

          <div className="cyber-border rounded-xl p-4 cyber-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Building</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.building}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center">
                <FaCodeBranch className="text-2xl text-yellow-400" />
              </div>
            </div>
            <div className="mt-2 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
          </div>

          <div className="cyber-border rounded-xl p-4 cyber-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Errors</p>
                <p className="text-3xl font-bold text-red-400">{stats.error}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
              </div>
            </div>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass-effect rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-dark-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue"
              >
                <option value="all">All Status</option>
                <option value="READY">Ready</option>
                <option value="BUILDING">Building</option>
                <option value="ERROR">Error</option>
                <option value="QUEUED">Queued</option>
              </select>
              
              <button
                onClick={fetchProjects}
                className="neon-button px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              <i className="fas fa-cubes mr-2"></i>
              Projects ({filteredProjects.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="cyber-border rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-dark-800 rounded mb-4"></div>
                  <div className="h-4 bg-dark-800 rounded mb-2"></div>
                  <div className="h-4 bg-dark-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                <i className="fas fa-folder-open text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="neon-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <FaPlus /> Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => handleDeleteProject(project.id, project.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProjects()
            toast.success('Project created successfully')
          }}
        />
      )}

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg animate-pulse-glow"
        >
          <FaPlus className="text-2xl" />
        </button>
      </div>
    </>
  )
}
