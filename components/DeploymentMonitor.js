import { useState, useEffect } from 'react'
import { 
  FaCheckCircle, 
  FaSync, 
  FaExclamationTriangle, 
  FaClock,
  FaRedo,
  FaExternalLinkAlt
} from 'react-icons/fa'

export default function DeploymentMonitor({ projectId }) {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadDeployments()
      
      if (autoRefresh) {
        const interval = setInterval(loadDeployments, 10000) // Refresh every 10 seconds
        return () => clearInterval(interval)
      }
    }
  }, [projectId, autoRefresh])

  const loadDeployments = async () => {
    try {
      const res = await fetch(`/api/vercel/deployments?projectId=${projectId}`)
      const data = await res.json()
      setDeployments(data.deployments || [])
    } catch (error) {
      console.error('Error loading deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerDeployment = async () => {
    try {
      await fetch('/api/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      loadDeployments()
    } catch (error) {
      console.error('Error triggering deployment:', error)
    }
  }

  const getStatusIcon = (state) => {
    switch (state) {
      case 'READY': return <FaCheckCircle style={{ color: '#4CAF50' }} />
      case 'BUILDING': return <FaSync style={{ color: '#FF9800' }} />
      case 'ERROR': return <FaExclamationTriangle style={{ color: '#F44336' }} />
      case 'QUEUED': return <FaClock style={{ color: '#9E9E9E' }} />
      default: return <FaClock style={{ color: '#9E9E9E' }} />
    }
  }

  const getStatusColor = (state) => {
    switch (state) {
      case 'READY': return '#4CAF50'
      case 'BUILDING': return '#FF9800'
      case 'ERROR': return '#F44336'
      case 'QUEUED': return '#9E9E9E'
      default: return '#9E9E9E'
    }
  }

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const duration = new Date(end) - new Date(start)
    const seconds = Math.floor(duration / 1000)
    return `${seconds}s`
  }

  return (
    <div className="deployment-monitor">
      <div className="monitor-header">
        <h2>Deployments</h2>
        
        <div className="monitor-controls">
          <label className="auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
          
          <button 
            className="refresh-btn"
            onClick={loadDeployments}
          >
            <FaRedo /> Refresh
          </button>
          
          <button 
            className="deploy-btn"
            onClick={triggerDeployment}
          >
            Trigger Deployment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading deployments...</div>
      ) : deployments.length === 0 ? (
        <div className="empty-state">
          <p>No deployments yet</p>
          <button 
            className="deploy-btn"
            onClick={triggerDeployment}
          >
            Deploy Now
          </button>
        </div>
      ) : (
        <div className="deployments-list">
          <div className="deployments-table">
            <div className="table-header">
              <div>Status</div>
              <div>Commit</div>
              <div>Branch</div>
              <div>Duration</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            
            {deployments.map(deployment => (
              <div key={deployment.uid} className="table-row">
                <div className="status-cell">
                  <div className="status-indicator">
                    {getStatusIcon(deployment.state)}
                    <span style={{ color: getStatusColor(deployment.state) }}>
                      {deployment.state}
                    </span>
                  </div>
                </div>
                
                <div className="commit-cell">
                  <div className="commit-message">
                    {deployment.meta?.githubCommitMessage || 'No commit message'}
                  </div>
                  <div className="commit-hash">
                    {deployment.meta?.githubCommitSha?.substring(0, 7) || 'N/A'}
                  </div>
                </div>
                
                <div className="branch-cell">
                  <span className="branch-tag">
                    {deployment.target || 'production'}
                  </span>
                </div>
                
                <div className="duration-cell">
                  {formatDuration(deployment.createdAt, deployment.ready)}
                </div>
                
                <div className="time-cell">
                  {new Date(deployment.createdAt).toLocaleString()}
                </div>
                
                <div className="actions-cell">
                  {deployment.url && (
                    <a 
                      href={`https://${deployment.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      <FaExternalLinkAlt /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .deployment-monitor {
          height: 100%;
        }
        
        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .monitor-header h2 {
          margin: 0;
          color: #333;
        }
        
        .monitor-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .auto-refresh {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          cursor: pointer;
        }
        
        .refresh-btn, .deploy-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .refresh-btn {
          background: #f5f5f5;
          color: #333;
        }
        
        .refresh-btn:hover {
          background: #e0e0e0;
        }
        
        .deploy-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .deploy-btn:hover {
          opacity: 0.9;
        }
        
        .loading, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .deployments-table {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1.5fr 1fr;
          background: #f8f9fa;
          padding: 1rem;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1.5fr 1fr;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          align-items: center;
        }
        
        .table-row:hover {
          background: #f8f9fa;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .status-cell .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .commit-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .commit-message {
          font-weight: 500;
          color: #333;
        }
        
        .commit-hash {
          font-family: monospace;
          font-size: 0.9rem;
          color: #666;
        }
        
        .branch-cell .branch-tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .duration-cell, .time-cell {
          color: #666;
          font-size: 0.95rem;
        }
        
        .actions-cell .view-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .view-btn:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 1200px) {
          .deployments-table {
            overflow-x: auto;
          }
          
          .table-header, .table-row {
            min-width: 1000px;
          }
        }
        
        @media (max-width: 768px) {
          .monitor-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .monitor-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  )
}