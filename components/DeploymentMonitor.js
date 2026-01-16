import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  FaCheckCircle, 
  FaSync, 
  FaExclamationTriangle, 
  FaClock,
  FaRedo,
  FaExternalLinkAlt,
  FaSpinner,
  FaPlay,
  FaTrash
} from 'react-icons/fa'

export default function DeploymentMonitor({ projectId, deployments: initialDeployments, onRefresh }) {
  const [deployments, setDeployments] = useState(initialDeployments || [])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (initialDeployments) {
      setDeployments(initialDeployments)
    }
  }, [initialDeployments])

  useEffect(() => {
    if (autoRefresh && projectId) {
      const interval = setInterval(() => {
        refreshDeployments()
      }, 15000) // 15 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, projectId])

  const refreshDeployments = async () => {
    try {
      const res = await fetch(`/api/vercel/deployments?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setDeployments(data.deployments || [])
      }
    } catch (error) {
      console.error('Error refreshing deployments:', error)
    }
  }

  const triggerDeployment = async () => {
    try {
      toast.loading('Triggering deployment...')
      const res = await fetch('/api/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Deployment triggered successfully!')
        refreshDeployments()
        if (onRefresh) onRefresh()
      } else {
        toast.error(data.error || 'Failed to trigger deployment')
      }
    } catch (error) {
      toast.error('Error triggering deployment')
      console.error(error)
    }
  }

  const cancelDeployment = async (deploymentId) => {
    if (!confirm('Are you sure you want to cancel this deployment?')) return
    
    try {
      toast.loading('Cancelling deployment...')
      const res = await fetch('/api/vercel/deployments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Deployment cancelled!')
        refreshDeployments()
      } else {
        toast.error(data.error || 'Failed to cancel deployment')
      }
    } catch (error) {
      toast.error('Error cancelling deployment')
      console.error(error)
    }
  }

  const getStatusConfig = (state) => {
    switch (state) {
      case 'READY':
        return { 
          color: 'text-neon-green',
          bg: 'bg-neon-green/10',
          icon: <FaCheckCircle />,
          label: 'Live'
        }
      case 'BUILDING':
        return { 
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          icon: <FaSync className="animate-spin" />,
          label: 'Building'
        }
      case 'ERROR':
        return { 
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          icon: <FaExclamationTriangle />,
          label: 'Failed'
        }
      case 'QUEUED':
        return { 
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          icon: <FaClock />,
          label: 'Queued'
        }
      default:
        return { 
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          icon: <FaClock />,
          label: state || 'Unknown'
        }
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const duration = new Date(end) - new Date(start)
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaSync className="text-neon-purple" />
            Deployments
          </h2>
          <p className="text-gray-400 text-sm">Monitor and manage your deployments</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded bg-dark-700 border-gray-600"
            />
            <span className="text-sm text-gray-300">Auto-refresh</span>
          </label>
          
          <button
            onClick={refreshDeployments}
            disabled={loading}
            className="neon-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
            Refresh
          </button>
          
          <button
            onClick={triggerDeployment}
            className="bg-gradient-to-r from-neon-purple to-neon-pink text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
          >
            <FaPlay /> Deploy Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="cyber-border rounded-xl p-3">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-bold text-white">{deployments.length}</p>
        </div>
        <div className="cyber-border rounded-xl p-3">
          <p className="text-xs text-gray-400">Live</p>
          <p className="text-xl font-bold text-neon-green">
            {deployments.filter(d => d.state === 'READY').length}
          </p>
        </div>
        <div className="cyber-border rounded-xl p-3">
          <p className="text-xs text-gray-400">Building</p>
          <p className="text-xl font-bold text-yellow-400">
            {deployments.filter(d => d.state === 'BUILDING' || d.state === 'QUEUED').length}
          </p>
        </div>
        <div className="cyber-border rounded-xl p-3">
          <p className="text-xs text-gray-400">Failed</p>
          <p className="text-xl font-bold text-red-400">
            {deployments.filter(d => d.state === 'ERROR').length}
          </p>
        </div>
      </div>

      {/* Deployment List */}
      {deployments.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-rocket text-4xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-bold text-white mb-2">No Deployments Yet</h3>
          <p className="text-gray-400 mb-6">Deploy your project to see deployment history</p>
          <button
            onClick={triggerDeployment}
            className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <FaPlay /> Deploy Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map(deployment => {
            const status = getStatusConfig(deployment.state)
            const commitMessage = deployment.meta?.githubCommitMessage || 
                                deployment.meta?.gitlabCommitMessage ||
                                'Manual deployment'
            const commitSha = deployment.meta?.githubCommitSha?.substring(0, 7) || 
                            deployment.meta?.gitlabCommitSha?.substring(0, 7) ||
                            'N/A'
            const branch = deployment.target || 'production'
            
            return (
              <div key={deployment.uid} className="cyber-border rounded-xl p-4 hover:shadow-glow transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${status.bg} flex items-center justify-center`}>
                        <span className={status.color}>
                          {status.icon}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(deployment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-white font-medium truncate" title={commitMessage}>
                        {commitMessage}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-code-branch"></i>
                          <span>{branch}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-hashtag"></i>
                          <code>{commitSha}</code>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-clock"></i>
                          <span>{formatDuration(deployment.createdAt, deployment.ready)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {deployment.url && (
                      <a
                        href={`https://${deployment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neon-button w-10 h-10 rounded-lg flex items-center justify-center"
                        title="Open Deployment"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    
                    {(deployment.state === 'BUILDING' || deployment.state === 'QUEUED') && (
                      <button
                        onClick={() => cancelDeployment(deployment.uid)}
                        className="w-10 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        title="Cancel Deployment"
                      >
                        <FaTrash className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
