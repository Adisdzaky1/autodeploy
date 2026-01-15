import { useState, useEffect } from 'react'
import { 
  FaTimes, 
  FaSave, 
  FaGithub,
  FaServer,
  FaTerminal 
} from 'react-icons/fa'

const FRAMEWORKS = [
  { id: 'nextjs', name: 'Next.js' },
  { id: 'create-react-app', name: 'Create React App' },
  { id: 'vue', name: 'Vue.js' },
  { id: 'nuxt', name: 'Nuxt.js' },
  { id: 'angular', name: 'Angular' },
  { id: 'svelte', name: 'Svelte' },
  { id: 'static', name: 'Static Site' },
  { id: null, name: 'Other' }
]

export default function ProjectSettings({ mode, project, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    framework: 'nextjs',
    gitRepository: '',
    buildCommand: '',
    installCommand: '',
    outputDirectory: '.next',
    rootDirectory: ''
  })

  const [githubRepos, setGithubRepos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        framework: project.framework || 'nextjs',
        gitRepository: project.gitRepository?.repo || '',
        buildCommand: project.buildCommand || '',
        installCommand: project.installCommand || '',
        outputDirectory: project.outputDirectory || '.next',
        rootDirectory: project.rootDirectory || ''
      })
    }
    
    fetchGithubRepos()
  }, [mode, project])

  const fetchGithubRepos = async () => {
    try {
      const res = await fetch('/api/github/repos')
      const repos = await res.json()
      setGithubRepos(repos)
    } catch (error) {
      console.error('Error fetching GitHub repos:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getFrameworkCommands = (framework) => {
    const commands = {
      'nextjs': {
        install: 'npm install',
        build: 'npm run build',
        output: '.next'
      },
      'create-react-app': {
        install: 'npm install',
        build: 'npm run build',
        output: 'build'
      },
      'vue': {
        install: 'npm install',
        build: 'npm run build',
        output: 'dist'
      },
      'nuxt': {
        install: 'npm install',
        build: 'npm run generate',
        output: 'dist'
      },
      'angular': {
        install: 'npm install',
        build: 'ng build',
        output: 'dist'
      },
      'svelte': {
        install: 'npm install',
        build: 'npm run build',
        output: 'public'
      },
      'static': {
        install: '',
        build: '',
        output: ''
      }
    }
    
    return commands[framework] || { install: '', build: '', output: '' }
  }

  const handleFrameworkChange = (framework) => {
    const commands = getFrameworkCommands(framework)
    setFormData(prev => ({
      ...prev,
      framework,
      installCommand: commands.install,
      buildCommand: commands.build,
      outputDirectory: commands.output
    }))
  }

  return (
    <div className="settings-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {mode === 'create' ? 'Create New Project' : 'Project Settings'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><FaServer /> Basic Settings</h3>
            
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="framework">Framework</label>
              <div className="framework-grid">
                {FRAMEWORKS.map(fw => (
                  <button
                    key={fw.id || 'other'}
                    type="button"
                    className={`framework-btn ${formData.framework === fw.id ? 'active' : ''}`}
                    onClick={() => handleFrameworkChange(fw.id)}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaGithub /> GitHub Integration</h3>
            
            <div className="form-group">
              <label htmlFor="gitRepository">GitHub Repository</label>
              <select
                id="gitRepository"
                name="gitRepository"
                value={formData.gitRepository}
                onChange={handleChange}
              >
                <option value="">Select a repository</option>
                {githubRepos.map(repo => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
              <p className="help-text">
                Or enter manually: owner/repo-name
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="rootDirectory">Root Directory</label>
              <input
                type="text"
                id="rootDirectory"
                name="rootDirectory"
                value={formData.rootDirectory}
                onChange={handleChange}
                placeholder="Leave empty for repository root"
              />
            </div>
          </div>

          <div className="form-section">
            <h3><FaTerminal /> Build Settings</h3>
            
            <div className="form-group">
              <label htmlFor="installCommand">Install Command</label>
              <input
                type="text"
                id="installCommand"
                name="installCommand"
                value={formData.installCommand}
                onChange={handleChange}
                placeholder="npm install"
              />
            </div>

            <div className="form-group">
              <label htmlFor="buildCommand">Build Command</label>
              <input
                type="text"
                id="buildCommand"
                name="buildCommand"
                value={formData.buildCommand}
                onChange={handleChange}
                placeholder="npm run build"
              />
            </div>

            <div className="form-group">
              <label htmlFor="outputDirectory">Output Directory</label>
              <input
                type="text"
                id="outputDirectory"
                name="outputDirectory"
                value={formData.outputDirectory}
                onChange={handleChange}
                placeholder=".next"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (
                <>
                  <FaSave /> {mode === 'create' ? 'Create Project' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .settings-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-content {
          background: white;
          border-radius: 15px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .modal-header h2 {
          margin: 0;
          color: #333;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          background: #f5f5f5;
        }
        
        form {
          padding: 1.5rem;
        }
        
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .help-text {
          margin-top: 0.25rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .framework-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
        }
        
        .framework-btn {
          padding: 10px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .framework-btn:hover {
          border-color: #667eea;
          background: #f0f0ff;
        }
        
        .framework-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .cancel-btn, .save-btn {
          padding: 10px 24px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cancel-btn {
          background: #f5f5f5;
          color: #333;
        }
        
        .cancel-btn:hover {
          background: #e0e0e0;
        }
        
        .save-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .save-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
          }
          
          .framework-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}