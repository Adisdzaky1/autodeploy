import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProjectList from '../components/ProjectList'
import ProjectSettings from '../components/ProjectSettings'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/vercel/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const res = await fetch('/api/vercel/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })
      
      if (res.ok) {
        setShowCreateModal(false)
        fetchProjects() // Refresh list
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const res = await fetch(`/api/vercel/projects?id=${projectId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchProjects() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  return (
    <div className="dashboard">
      <Head>
        <title>Vercel Project Manager</title>
        <meta name="description" content="Manage Vercel projects with GitHub integration" />
      </Head>

      <header className="header">
        <h1>🚀 Vercel Project Manager</h1>
        <button 
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Project
        </button>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : (
          <>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Projects</h3>
                <p className="stat-number">{projects.length}</p>
              </div>
              <div className="stat-card">
                <h3>Live Projects</h3>
                <p className="stat-number">
                  {projects.filter(p => p.latestDeployment?.state === 'READY').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Team</h3>
                <p className="stat-number">Vercel</p>
              </div>
            </div>

            <ProjectList 
              projects={projects}
              onDelete={handleDeleteProject}
            />
          </>
        )}
      </main>

      {showCreateModal && (
        <ProjectSettings
          mode="create"
          onSave={handleCreateProject}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .header h1 {
          margin: 0;
          color: #333;
        }
        
        .create-btn {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .create-btn:hover {
          transform: translateY(-2px);
        }
        
        .main-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .stat-card h3 {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin: 0;
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  )
}