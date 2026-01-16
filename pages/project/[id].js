import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import FileExplorer from '../../components/FileExplorer'
import DeploymentMonitor from '../../components/DeploymentMonitor'
import ProjectSettings from '../../components/ProjectSettings'
import MobileNav from '../../components/MobileNav'
import toast from 'react-hot-toast'
import { 
  FaArrowLeft, 
  FaCode, 
  FaRocket, 
  FaCog,
  FaGithub,
  FaServer,
  FaTerminal,
  FaHome,
  FaSpinner
} from 'react-icons/fa'

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = router.query
  const [activeTab, setActiveTab] = useState('files')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [deployments, setDeployments] = useState([])

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/vercel/projects?id=${id}`)
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
        router.push('/')
        return
      }
      
      setProject(data)
      
      // Fetch deployments
      const deploymentsRes = await fetch(`/api/vercel/deployments?projectId=${id}`)
      const deploymentsData = await deploymentsRes.json()
      setDeployments(deploymentsData.deployments || [])
      
    } catch (error) {
      toast.error('Failed to load project details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerDeployment = async () => {
    try {
      toast.loading('Triggering deployment...')
      const res = await fetch('/api/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Deployment triggered successfully!')
        fetchProjectDetails()
      } else {
        toast.error(data.error || 'Failed to trigger deployment')
      }
    } catch (error) {
      toast.error('Error triggering deployment')
      console.error(error)
    }
  }

  const tabs = [
    { id: 'files', label: 'Files', icon: <FaCode />, color: 'text-neon-blue' },
    { id: 'deployments', label: 'Deployments', icon: <FaRocket />, color: 'text-neon-purple' },
    { id: 'settings', label: 'Settings', icon: <FaCog />, color: 'text-neon-pink' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-neon-blue/30 border-t-neon-blue animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center cyber-border rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
          <p className="text-gray-400 mb-6">The project you're looking for doesn't exist or you don't have access.</p>
          <button 
            onClick={() => router.push('/')}
            className="neon-button px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
          >
            <FaHome /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{project.name} - CyberVercel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <MobileNav />
      
      <div className="container mx-auto px-4 pt-6 pb-20 md:pb-8">
        {/* Header */}
        <div className="cyber-border rounded-2xl p-4 md:p-6 mb-6 cyber-glow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/')}
                className="neon-button w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              >
                <FaArrowLeft />
              </button>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-cube text-neon-blue text-lg"></i>
                  <h1 className="text-xl md:text-2xl font-bold text-white truncate">{project.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-dark-800 px-2 py-1 rounded text-gray-300 font-mono truncate">
                    {project.id}
                  </code>
                  {project.gitRepository && (
                    <a
                      href={project.gitRepository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neon-blue hover:underline flex items-center gap-1"
                    >
                      <FaGithub /> {project.gitRepository.repo.split('/')[1]}
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {project.latestDeployment?.url && (
                <a
                  href={`https://${project.latestDeployment.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <FaExternalLinkAlt /> Open Live Site
                </a>
              )}
              
              <button
                onClick={handleTriggerDeployment}
                className="bg-gradient-to-r from-neon-purple to-neon-pink text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
              >
                <FaRocket /> Deploy Now
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="neon-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FaCog /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="cyber-border rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-400">Status</p>
                <p className={`text-lg md:text-xl font-bold ${
                  project.latestDeployment?.state === 'READY' ? 'text-neon-green' :
                  project.latestDeployment?.state === 'BUILDING' ? 'text-yellow-400' :
                  project.latestDeployment?.state === 'ERROR' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {project.latestDeployment?.state || 'NOT_DEPLOYED'}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 flex items-center justify-center">
                <FaServer className="text-neon-blue" />
              </div>
            </div>
          </div>

          <div className="cyber-border rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-400">Deployments</p>
                <p className="text-lg md:text-xl font-bold text-white">{deployments.length}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 flex items-center justify-center">
                <FaRocket className="text-neon-purple" />
              </div>
            </div>
          </div>

          <div className="cyber-border rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-400">Framework</p>
                <p className="text-lg md:text-xl font-bold text-white">{project.framework || 'None'}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 flex items-center justify-center">
                <FaCode className="text-neon-pink" />
              </div>
            </div>
          </div>

          <div className="cyber-border rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-400">Updated</p>
                <p className="text-lg md:text-xl font-bold text-white">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 flex items-center justify-center">
                <FaCalendarAlt className="text-neon-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto scrollbar-cyber mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? `border-${tab.color.split('-')[1]} ${tab.color} bg-dark-800/30`
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="cyber-border rounded-2xl overflow-hidden cyber-glow">
          {activeTab === 'files' && project.gitRepository ? (
            <FileExplorer 
              repo={project.gitRepository.repo}
              projectId={project.id}
              projectName={project.name}
            />
          ) : activeTab === 'files' ? (
            <div className="p-8 text-center">
              <i className="fas fa-github text-4xl text-gray-600 mb-4"></i>
              <h3 className="text-xl font-bold text-white mb-2">No GitHub Repository</h3>
              <p className="text-gray-400 mb-6">This project is not connected to a GitHub repository.</p>
              <button
                onClick={() => setShowSettings(true)}
                className="neon-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <FaCog /> Connect Repository
              </button>
            </div>
          ) : null}
          
          {activeTab === 'deployments' && (
            <DeploymentMonitor 
              projectId={project.id}
              deployments={deployments}
              onRefresh={fetchProjectDetails}
            />
          )}
          
          {activeTab === 'settings' && (
            <ProjectSettings 
              project={project}
              onSave={fetchProjectDetails}
            />
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <ProjectSettings 
              project={project}
              onSave={() => {
                setShowSettings(false)
                fetchProjectDetails()
              }}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
