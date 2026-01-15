import { useState, useEffect } from 'react'
import { FaTimes, FaGithub, FaTerminal, FaFolder, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'

const FRAMEWORKS = [
  { id: 'nextjs', name: 'Next.js', icon: 'fab fa-react', color: 'text-white' },
  { id: 'create-react-app', name: 'React', icon: 'fab fa-react', color: 'text-blue-400' },
  { id: 'vue', name: 'Vue.js', icon: 'fab fa-vuejs', color: 'text-green-400' },
  { id: 'nuxt', name: 'Nuxt.js', icon: 'fas fa-bolt', color: 'text-green-300' },
  { id: 'angular', name: 'Angular', icon: 'fab fa-angular', color: 'text-red-500' },
  { id: 'svelte', name: 'Svelte', icon: 'fas fa-code', color: 'text-orange-500' },
  { id: 'static', name: 'Static', icon: 'fas fa-file-code', color: 'text-gray-400' },
  { id: 'express', name: 'Node.js', icon: 'fab fa-node-js', color: 'text-green-500' },
]

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [githubRepos, setGithubRepos] = useState([])
  const [repoLoading, setRepoLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    framework: 'nextjs',
    gitRepository: '',
    buildCommand: '',
    installCommand: '',
    outputDirectory: '.next',
    rootDirectory: '',
    environmentVariables: []
  })

  useEffect(() => {
    fetchGitHubRepos()
  }, [])

  const fetchGitHubRepos = async () => {
    try {
      setRepoLoading(true)
      const res = await fetch('/api/github/repos')
      if (res.ok) {
        const repos = await res.json()
        setGithubRepos(repos)
      } else {
        toast.error('Failed to fetch GitHub repositories')
      }
    } catch (error) {
      toast.error('Error connecting to GitHub')
      console.error(error)
    } finally {
      setRepoLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-set commands based on framework
    if (field === 'framework') {
      const commands = {
        'nextjs': { build: 'npm run build', install: 'npm install', output: '.next' },
        'create-react-app': { build: 'npm run build', install: 'npm install', output: 'build' },
        'vue': { build: 'npm run build', install: 'npm install', output: 'dist' },
        'nuxt': { build: 'npm run generate', install: 'npm install', output: 'dist' },
        'angular': { build: 'ng build', install: 'npm install', output: 'dist' },
        'svelte': { build: 'npm run build', install: 'npm install', output: 'public' },
        'static': { build: '', install: '', output: '' },
        'express': { build: '', install: 'npm install', output: '' },
      }
      
      const selected = commands[value] || {}
      setFormData(prev => ({
        ...prev,
        buildCommand: selected.build || '',
        installCommand: selected.install || '',
        outputDirectory: selected.output || ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        gitRepository: formData.gitRepository ? {
          repo: formData.gitRepository,
          type: 'github'
        } : undefined
      }

      const res = await fetch('/api/vercel/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Project created successfully!')
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to create project')
      }
    } catch (error) {
      toast.error('Error creating project')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl glass-effect border border-neon-blue/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                <i className="fas fa-plus mr-2"></i>
                Create New Project
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Step {step} of 3: {step === 1 ? 'Basic Info' : step === 2 ? 'Repository Setup' : 'Build Settings'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-dark-800 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-gray-400 hover:text-red-400" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map(num => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= num 
                      ? 'bg-gradient-to-br from-neon-blue to-neon-purple text-white' 
                      : 'bg-dark-800 text-gray-400'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink transition-all duration-300"
                style={{ width: `${(step - 1) * 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-cube mr-2"></i>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <i className="fas fa-layer-group mr-2"></i>
                  Select Framework
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FRAMEWORKS.map(fw => (
                    <button
                      type="button"
                      key={fw.id}
                      onClick={() => handleInputChange('framework', fw.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.framework === fw.id
                          ? 'border-neon-blue bg-neon-blue/10 cyber-glow'
                          : 'border-gray-700 bg-dark-800/30 hover:border-gray-600'
                      }`}
                    >
                      <i className={`${fw.icon} text-2xl ${fw.color} mb-2`}></i>
                      <p className="text-sm font-medium text-white">{fw.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Repository */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaGithub className="inline mr-2" />
                  Connect GitHub Repository
                </label>
                
                {repoLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-neon-blue mr-3" />
                    <span className="text-gray-400">Loading repositories...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {githubRepos.length > 0 ? (
                      <>
                        {githubRepos.map(repo => (
                          <button
                            type="button"
                            key={repo.id}
                            onClick={() => handleInputChange('gitRepository', repo.full_name)}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${
                              formData.gitRepository === repo.full_name
                                ? 'border-neon-purple bg-neon-purple/10'
                                : 'border-gray-700 bg-dark-800/30 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white">{repo.name}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {repo.description || 'No description'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-code-branch text-xs text-gray-400"></i>
                                <span className="text-xs text-gray-400">{repo.default_branch}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                        
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => handleInputChange('gitRepository', '')}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            Or connect repository manually later
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-github text-4xl text-gray-600 mb-3"></i>
                        <p className="text-gray-400">No repositories found</p>
                        <button
                          type="button"
                          onClick={fetchGitHubRepos}
                          className="mt-3 text-sm text-neon-blue hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaFolder className="inline mr-2" />
                  Root Directory (Optional)
                </label>
                <input
                  type="text"
                  value={formData.rootDirectory}
                  onChange={(e) => handleInputChange('rootDirectory', e.target.value)}
                  placeholder="e.g., /app or /frontend"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Leave empty if your project is in the repository root
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Build Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaTerminal className="inline mr-2" />
                  Install Command
                </label>
                <input
                  type="text"
                  value={formData.installCommand}
                  onChange={(e) => handleInputChange('installCommand', e.target.value)}
                  placeholder="npm install"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors font-mono"
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
                  onChange={(e) => handleInputChange('buildCommand', e.target.value)}
                  placeholder="npm run build"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors font-mono"
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
                  onChange={(e) => handleInputChange('outputDirectory', e.target.value)}
                  placeholder=".next"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  <i className="fas fa-sliders-h mr-2"></i>
                  Preview Configuration
                </h4>
                <div className="bg-dark-800/30 rounded-lg p-4 space-y-2 font-mono text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Name:</span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Framework:</span>
                    <span className="text-neon-blue">{formData.framework}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Repository:</span>
                    <span className="text-neon-purple">{formData.gitRepository || 'None'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Build Command:</span>
                    <span className="text-neon-green">{formData.buildCommand}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-dark-900/50">
          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-dark-800 hover:bg-red-500/20 text-gray-300 hover:text-red-300 transition-colors"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-neon-green to-neon-blue text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket"></i>
                      Create Project
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal
