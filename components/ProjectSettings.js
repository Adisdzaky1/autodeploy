import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  FaTimes, 
  FaSave, 
  FaGithub,
  FaTerminal,
  FaFolder,
  FaKey,
  FaSpinner,
  FaCopy
} from 'react-icons/fa'

const FRAMEWORKS = [
  { id: 'nextjs', name: 'Next.js', icon: 'fab fa-react' },
  { id: 'create-react-app', name: 'React', icon: 'fab fa-react' },
  { id: 'vue', name: 'Vue.js', icon: 'fab fa-vuejs' },
  { id: 'nuxt', name: 'Nuxt.js', icon: 'fas fa-bolt' },
  { id: 'angular', name: 'Angular', icon: 'fab fa-angular' },
  { id: 'svelte', name: 'Svelte', icon: 'fas fa-code' },
  { id: 'static', name: 'Static', icon: 'fas fa-file-code' },
  { id: 'express', name: 'Node.js', icon: 'fab fa-node-js' },
]

const ProjectSettings = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    framework: '',
    buildCommand: '',
    installCommand: '',
    outputDirectory: '',
    rootDirectory: '',
    environmentVariables: []
  })
  
  const [githubRepos, setGithubRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newEnvKey, setNewEnvKey] = useState('')
  const [newEnvValue, setNewEnvValue] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        framework: project.framework || '',
        buildCommand: project.buildCommand || '',
        installCommand: project.installCommand || '',
        outputDirectory: project.outputDirectory || '',
        rootDirectory: project.rootDirectory || '',
        environmentVariables: project.env || []
      })
    }
    fetchGithubRepos()
  }, [project])

  const fetchGithubRepos = async () => {
    try {
      const res = await fetch('/api/github/repos')
      if (res.ok) {
        const repos = await res.json()
        setGithubRepos(repos)
      }
    } catch (error) {
      console.error('Error fetching repos:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setSaving(true)
    try {
      toast.loading('Updating project...')
      
      // First, update basic settings
      const updateRes = await fetch(`/api/vercel/projects?id=${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          framework: formData.framework,
          buildCommand: formData.buildCommand,
          installCommand: formData.installCommand,
          outputDirectory: formData.outputDirectory,
          rootDirectory: formData.rootDirectory
        })
      })
      
      const updateData = await updateRes.json()
      
      if (updateRes.ok) {
        // Then update environment variables if any
        if (formData.environmentVariables.length > 0) {
          await updateEnvironmentVariables()
        }
        
        toast.success('Project updated successfully!')
        if (onSave) onSave()
        if (onClose) onClose()
      } else {
        toast.error(updateData.error || 'Failed to update project')
      }
    } catch (error) {
      toast.error('Error updating project')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const updateEnvironmentVariables = async () => {
    // This would require Vercel API v9 for environment variables
    // For now, we'll just log them
    console.log('Environment variables to update:', formData.environmentVariables)
  }

  const handleAddEnvVariable = () => {
    if (!newEnvKey.trim() || !newEnvValue.trim()) {
      toast.error('Both key and value are required')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      environmentVariables: [
        ...prev.environmentVariables,
        { key: newEnvKey, value: newEnvValue }
      ]
    }))
    
    setNewEnvKey('')
    setNewEnvValue('')
    toast.success('Environment variable added')
  }

  const handleRemoveEnvVariable = (index) => {
    const newEnvVars = [...formData.environmentVariables]
    newEnvVars.splice(index, 1)
    setFormData(prev => ({ ...prev, environmentVariables: newEnvVars }))
  }

  const copyProjectId = () => {
    navigator.clipboard.writeText(project.id)
    toast.success('Project ID copied to clipboard!')
  }

  const copyDeploymentUrl = () => {
    if (project.latestDeployment?.url) {
      navigator.clipboard.writeText(`https://${project.latestDeployment.url}`)
      toast.success('Deployment URL copied!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl glass-effect border border-neon-blue/30">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold gradient-text">
                <i className="fas fa-cog mr-2"></i>
                Project Settings
              </h2>
              <p className="text-gray-400 text-sm mt-1">{project?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-dark-800 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-gray-400 hover:text-red-400" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex overflow-x-auto mt-6 scrollbar-cyber">
            {['general', 'build', 'environment', 'danger'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-cube mr-2"></i>
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="neon-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaGithub className="inline mr-2" />
                  GitHub Repository
                </label>
                <div className="flex gap-2">
                  <select
                    value={project.gitRepository?.repo || ''}
                    disabled
                    className="neon-input w-full opacity-50"
                  >
                    <option value={project.gitRepository?.repo || ''}>
                      {project.gitRepository?.repo || 'Not connected'}
                    </option>
                  </select>
                  <button
                    type="button"
                    className="neon-button px-4 py-3 rounded-lg"
                    onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaFolder className="inline mr-2" />
                  Root Directory
                </label>
                <input
                  type="text"
                  value={formData.rootDirectory}
                  onChange={(e) => setFormData(prev => ({ ...prev, rootDirectory: e.target.value }))}
                  placeholder="Leave empty for repository root"
                  className="neon-input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={project.id}
                      readOnly
                      className="neon-input w-full font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={copyProjectId}
                      className="neon-button px-4 py-3 rounded-lg flex items-center gap-2"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deployment URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={project.latestDeployment?.url ? `https://${project.latestDeployment.url}` : 'Not deployed'}
                      readOnly
                      className="neon-input w-full font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={copyDeploymentUrl}
                      disabled={!project.latestDeployment?.url}
                      className="neon-button px-4 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Build Settings */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <i className="fas fa-layer-group mr-2"></i>
                  Framework
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FRAMEWORKS.map(fw => (
                    <button
                      type="button"
                      key={fw.id}
                      onClick={() => setFormData(prev => ({ ...prev, framework: fw.id }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.framework === fw.id
                          ? 'border-neon-blue bg-neon-blue/10'
                          : 'border-gray-700 bg-dark-800/30 hover:border-gray-600'
                      }`}
                    >
                      <i className={`${fw.icon} text-2xl mb-2 ${formData.framework === fw.id ? 'text-neon-blue' : 'text-gray-400'}`}></i>
                      <p className={`text-sm font-medium ${formData.framework === fw.id ? 'text-white' : 'text-gray-400'}`}>
                        {fw.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaTerminal className="inline mr-2" />
                  Install Command
                </label>
                <input
                  type="text"
                  value={formData.installCommand}
                  onChange={(e) => setFormData(prev => ({ ...prev, installCommand: e.target.value }))}
                  placeholder="npm install"
                  className="neon-input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-hammer mr-2"></i>
                  Build Command
                </label>
                <input
                  type="text"
                  value={formData.buildCommand}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildCommand: e.target.value }))}
                  placeholder="npm run build"
                  className="neon-input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-folder-open mr-2"></i>
                  Output Directory
                </label>
                <input
                  type="text"
                  value={formData.outputDirectory}
                  onChange={(e) => setFormData(prev => ({ ...prev, outputDirectory: e.target.value }))}
                  placeholder=".next"
                  className="neon-input w-full"
                />
              </div>
            </div>
          )}

          {/* Environment Variables */}
          {activeTab === 'environment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  <FaKey className="inline mr-2" />
                  Environment Variables
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Environment variables are managed directly on Vercel Dashboard for security reasons.
                </p>
                
                <a
                  href={`https://vercel.com/dashboard/${project.id}/settings/environment-variables`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <i className="fas fa-external-link-alt"></i>
                  Manage on Vercel Dashboard
                </a>
              </div>

              {/* Note: Actual environment variable management requires Vercel API v9 */}
              <div className="border border-gray-800 rounded-xl p-4">
                <h4 className="font-medium text-white mb-3">Add Variable (Simulation)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    type="text"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="Variable name"
                    className="neon-input"
                  />
                  <input
                    type="text"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    placeholder="Variable value"
                    className="neon-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddEnvVariable}
                    className="bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Add Variable
                  </button>
                </div>
                
                {formData.environmentVariables.length > 0 && (
                  <div className="space-y-2">
                    {formData.environmentVariables.map((env, index) => (
                      <div key={index} className="flex items-center justify-between bg-dark-800/50 rounded-lg p-3">
                        <div className="font-mono">
                          <span className="text-neon-blue">{env.key}</span>
                          <span className="text-gray-500 mx-2">=</span>
                          <span className="text-gray-300">••••••••</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEnvVariable(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="border border-red-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Danger Zone
                </h3>
                
                <div className="space-y-4">
                  <div className="border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Transfer Project</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Transfer this project to another team or user.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                      className="neon-button px-4 py-2 rounded-lg text-sm"
                    >
                      Transfer on Vercel Dashboard
                    </button>
                  </div>
                  
                  <div className="border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Delete Project</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Once deleted, all deployments will be removed and cannot be recovered.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
                          window.location.href = `/api/vercel/projects?id=${project.id}&action=delete`
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/30 transition-colors"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-800 bg-dark-900/50">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="text-sm text-gray-400">
              Changes are saved automatically on Vercel.
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectSettings
