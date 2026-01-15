import { useState } from 'react'
import Link from 'next/link'
import { FaTrash, FaGithub, FaExternalLinkAlt, FaCog, FaEye } from 'react-icons/fa'

export default function ProjectList({ projects, onDelete }) {
  const [expandedProject, setExpandedProject] = useState(null)

  const toggleExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'READY': return '#4CAF50'
      case 'BUILDING': return '#FF9800'
      case 'ERROR': return '#F44336'
      default: return '#9E9E9E'
    }
  }

  return (
    <div className="project-list">
      <h2>Your Projects</h2>
      
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <div className="project-meta">
                    <span className="status" style={{ 
                      backgroundColor: getStatusColor(project.latestDeployment?.state) 
                    }}>
                      {project.latestDeployment?.state || 'NOT_DEPLOYED'}
                    </span>
                    <span className="framework">
                      {project.framework || 'No framework'}
                    </span>
                  </div>
                </div>
                
                <div className="project-actions">
                  {project.latestDeployment?.url && (
                    <a 
                      href={`https://${project.latestDeployment.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                  
                  <Link href={`/project/${project.id}`}>
                    <a className="action-btn">
                      <FaEye />
                    </a>
                  </Link>
                  
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete(project.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="project-details">
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <code className="detail-value">{project.id}</code>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Updated:</span>
                  <span className="detail-value">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {project.gitRepository && (
                  <div className="detail-row">
                    <span className="detail-label">
                      <FaGithub /> Repo:
                    </span>
                    <a 
                      href={project.gitRepository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-value repo-link"
                    >
                      {project.gitRepository.repo}
                    </a>
                  </div>
                )}
              </div>

              <button 
                className="expand-btn"
                onClick={() => toggleExpand(project.id)}
              >
                {expandedProject === project.id ? 'Show Less' : 'Show More'}
              </button>

              {expandedProject === project.id && project.latestDeployment && (
                <div className="expanded-details">
                  <h4>Latest Deployment</h4>
                  <div className="deployment-info">
                    <div className="deployment-row">
                      <span>URL:</span>
                      <a 
                        href={`https://${project.latestDeployment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.latestDeployment.url}
                      </a>
                    </div>
                    <div className="deployment-row">
                      <span>Created:</span>
                      <span>{new Date(project.latestDeployment.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="deployment-row">
                      <span>Target:</span>
                      <span>{project.latestDeployment.target || 'production'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .project-list h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f8f9fa;
          border-radius: 10px;
          color: #666;
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .project-card {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }
        
        .project-card:hover {
          transform: translateY(-5px);
        }
        
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .project-info h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.2rem;
        }
        
        .project-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          color: white;
          font-weight: 500;
        }
        
        .framework {
          padding: 2px 8px;
          background: #e3f2fd;
          border-radius: 12px;
          font-size: 0.8rem;
          color: #1976d2;
        }
        
        .project-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          background: #f5f5f5;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #e0e0e0;
          color: #333;
        }
        
        .delete-btn:hover {
          background: #ffebee;
          color: #f44336;
        }
        
        .project-details {
          margin: 1rem 0;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          gap: 0.5rem;
        }
        
        .detail-label {
          font-weight: 500;
          color: #666;
          min-width: 80px;
        }
        
        .detail-value {
          color: #333;
          font-family: monospace;
          font-size: 0.9rem;
        }
        
        .repo-link {
          color: #333;
          text-decoration: none;
        }
        
        .repo-link:hover {
          text-decoration: underline;
          color: #667eea;
        }
        
        .expand-btn {
          width: 100%;
          padding: 0.5rem;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }
        
        .expand-btn:hover {
          background: #e9ecef;
        }
        
        .expanded-details {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .expanded-details h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        
        .deployment-info {
          display: grid;
          gap: 0.5rem;
        }
        
        .deployment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .deployment-row span:first-child {
          font-weight: 500;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}