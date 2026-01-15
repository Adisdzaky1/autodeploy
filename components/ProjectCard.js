import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  FaExternalLinkAlt,
  FaTrash,
  FaCode,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaBranch,
  FaClock
} from 'react-icons/fa'

const ProjectCard = ({ project, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const getStatusConfig = (status) => {
    switch (status) {
      case 'READY':
        return { 
          color: 'text-neon-green', 
          bg: 'bg-neon-green/10', 
          border: 'border-neon-green/30',
          icon: 'fas fa-check-circle',
          pulse: true
        }
      case 'BUILDING':
        return { 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-400/10', 
          border: 'border-yellow-400/30',
          icon: 'fas fa-sync fa-spin',
          pulse: false
        }
      case 'ERROR':
        return { 
          color: 'text-red-400', 
          bg: 'bg-red-400/10', 
          border: 'border-red-400/30',
          icon: 'fas fa-exclamation-circle',
          pulse: false
        }
      case 'QUEUED':
        return { 
          color: 'text-blue-400', 
          bg: 'bg-blue-400/10', 
          border: 'border-blue-400/30',
          icon: 'fas fa-clock',
          pulse: false
        }
      default:
        return { 
          color: 'text-gray-400', 
          bg: 'bg-gray-400/10', 
          border: 'border-gray-400/30',
          icon: 'fas fa-question-circle',
          pulse: false
        }
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  const status = project.latestDeployment?.state || 'NOT_DEPLOYED'
  const statusConfig = getStatusConfig(status)

  return (
    <div className="cyber-border rounded-xl overflow-hidden cyber-glow hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px]">
      {/* Card Header */}
      <div className="p-5 bg-dark-850">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-cube text-neon-blue"></i>
              <h3 className="text-lg font-bold text-white truncate" title={project.name}>
                {project.name}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                <i className={`${statusConfig.icon} mr-1`}></i>
                {status}
                {statusConfig.pulse && <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-neon-green animate-pulse"></span>}
              </span>
              
              {project.framework && (
                <span className="px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-xs font-semibold border border-neon-purple/30">
                  {project.framework}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-2">
            {project.latestDeployment?.url && (
              <a
                href={`https://${project.latestDeployment.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center hover:bg-neon-blue/20 transition-colors"
                title="Open Live Site"
              >
                <FaExternalLinkAlt className="text-sm text-neon-blue" />
              </a>
            )}
            
            <Link href={`/project/${project.id}`}>
              <a className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center hover:bg-neon-purple/20 transition-colors" title="Open Dashboard">
                <FaCog className="text-sm text-neon-purple" />
              </a>
            </Link>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <>
                <FaChevronUp /> Less Details
              </>
            ) : (
              <>
                <FaChevronDown /> More Details
              </>
            )}
          </button>
          
          <div className="flex gap-2">
            <Link href={`/project/${project.id}`}>
              <a className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-neon-blue/20 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <FaCode className="text-xs" /> Manage
              </a>
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaTrash className={`text-xs ${deleting ? 'animate-spin' : ''}`} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 bg-dark-900 border-t border-gray-800">
          {/* Deployment Info */}
          {project.latestDeployment && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <FaCalendarAlt /> Latest Deployment
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">URL</p>
                  <a
                    href={`https://${project.latestDeployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neon-blue hover:underline truncate block"
                    title={project.latestDeployment.url}
                  >
                    {project.latestDeployment.url}
                  </a>
                </div>
                
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <p className="text-sm text-white">
                    {new Date(project.latestDeployment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Target</p>
                  <p className="text-sm text-white flex items-center gap-1">
                    <FaBranch className="text-xs" />
                    {project.latestDeployment.target || 'production'}
                  </p>
                </div>
                
                <div className="bg-dark-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Build Time</p>
                  <p className="text-sm text-white flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {project.latestDeployment.readyAt 
                      ? `${Math.round((new Date(project.latestDeployment.readyAt) - new Date(project.latestDeployment.createdAt)) / 1000)}s`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Project Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Project Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Project ID</span>
                <code className="text-xs bg-dark-800 px-2 py-1 rounded text-gray-300 font-mono">
                  {project.id.substring(0, 8)}...
                </code>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Updated</span>
                <span className="text-sm text-white">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              {project.gitRepository && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">GitHub Repo</span>
                  <a
                    href={project.gitRepository.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neon-blue hover:underline flex items-center gap-1"
                  >
                    <i className="fab fa-github"></i>
                    {project.gitRepository.repo.split('/')[1]}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCard
