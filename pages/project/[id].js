import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import FileExplorer from '../../components/FileExplorer'
import DeploymentMonitor from '../../components/DeploymentMonitor'
import ProjectSettings from '../../components/ProjectSettings'
import { 
  FaArrowLeft, 
  FaCode, 
  FaRocket, 
  FaCog,
  FaGithub,
  FaServer 
} from 'react-icons/fa'

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = router.query
  const [activeTab, setActiveTab] = useState('files')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/vercel/projects?id=${id}`)
      const data = await res.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'files', label: 'Files', icon: <FaCode /> },
    { id: 'deployments', label: 'Deployments', icon: <FaRocket /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ]

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="error-container">
        <h2>Project not found</h2>
        <button onClick={() => router.push('/')}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="project-detail">
      <Head>
        <title>{project.name} - Vercel Manager</title>
      </Head>

      <header className="project-header">
        <button onClick={() => router.push('/')} className="back-btn">
          <FaArrowLeft /> Back
        </button>
        
        <div className="project-title">
          <h1>{project.name}</h1>
          <div className="project-subtitle">
            <span className="project-id">ID: {project.id}</span>
            {project.latestDeployment && (
              <a 
                href={`https://${project.latestDeployment.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-url"
              >
                <FaServer /> {project.latestDeployment.url}
              </a>
            )}
          </div>
        </div>

        <div className="project-actions">
          {project.gitRepository && (
            <a 
              href={project.gitRepository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn"
            >
              <FaGithub /> View on GitHub
            </a>
          )}
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
          >
            <FaCog /> Settings
          </button>
        </div>
      </header>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'files' && project.gitRepository && (
          <FileExplorer 
            repo={project.gitRepository.repo}
            projectId={project.id}
          />
        )}
        
        {activeTab === 'deployments' && (
          <DeploymentMonitor projectId={project.id} />
        )}
        
        {activeTab === 'settings' && (
          <ProjectSettings 
            mode="edit"
            project={project}
            onSave={fetchProjectDetails}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>

      {showSettings && (
        <ProjectSettings 
          mode="edit"
          project={project}
          onSave={fetchProjectDetails}
          onClose={() => setShowSettings(false)}
        />
      )}

      <style jsx>{`
        .project-detail {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
        }
        
        .loading-spinner {
          border: 4px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top: 4px solid white;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .project-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem 2rem;
          border-radius: 15px;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .back-btn {
          background: #f5f5f5;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #333;
        }
        
        .back-btn:hover {
          background: #e0e0e0;
        }
        
        .project-title {
          flex: 1;
        }
        
        .project-title h1 {
          margin: 0;
          color: #333;
        }
        
        .project-subtitle {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        
        .project-id {
          font-family: monospace;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .project-url {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #667eea;
          text-decoration: none;
        }
        
        .project-url:hover {
          text-decoration: underline;
        }
        
        .project-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .github-btn, .settings-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .github-btn {
          background: #333;
          color: white;
          text-decoration: none;
        }
        
        .github-btn:hover {
          background: #000;
        }
        
        .settings-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .settings-btn:hover {
          opacity: 0.9;
        }
        
        .tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        
        .tab-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #666;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          background: #f8f9fa;
        }
        
        .tab-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .tab-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          min-height: 500px;
        }
        
        @media (max-width: 768px) {
          .project-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .project-actions {
            flex-direction: column;
          }
          
          .tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}