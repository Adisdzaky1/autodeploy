import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  FaFile, 
  FaFolder, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCode,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaUpload,
  FaDownload
} from 'react-icons/fa'

export default function FileExplorer({ repo, projectId, projectName }) {
  const [files, setFiles] = useState([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingFile, setEditingFile] = useState(null)
  const [newFileName, setNewFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fileType, setFileType] = useState('file')
  const [uploading, setUploading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState([])

  useEffect(() => {
    if (repo) {
      loadFiles(currentPath)
    }
  }, [repo, currentPath])

  useEffect(() => {
    // Update breadcrumbs
    const paths = currentPath.split('/').filter(Boolean)
    const breadcrumbItems = paths.map((path, index) => ({
      name: path,
      path: paths.slice(0, index + 1).join('/')
    }))
    setBreadcrumbs(breadcrumbItems)
  }, [currentPath])

  const loadFiles = async (path = '') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/github/files?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`)
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to load files')
      }
      
      const data = await res.json()
      setFiles(Array.isArray(data) ? data : [data])
      toast.success(`Loaded ${Array.isArray(data) ? data.length : 1} items`)
    } catch (error) {
      console.error('Error loading files:', error)
      toast.error(error.message || 'Failed to load files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (file) => {
    if (file.type === 'dir') {
      setCurrentPath(file.path)
    } else {
      try {
        const res = await fetch(`/api/github/files?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(file.path)}&content=true`)
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to load file')
        }
        
        const contentData = await res.json()
        setEditingFile(file)
        // Decode base64 content
        const content = atob(contentData.content || '')
        setFileContent(content)
        toast.success(`Loaded ${file.name}`)
      } catch (error) {
        console.error('Error loading file content:', error)
        toast.error(error.message || 'Failed to load file content')
      }
    }
  }

  const handleSaveFile = async () => {
    if (!editingFile) return

    try {
      toast.loading('Saving file...')
      const res = await fetch('/api/github/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: editingFile.path,
          content: btoa(fileContent),
          sha: editingFile.sha,
          message: `Update ${editingFile.name} via CyberVercel`
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('File saved successfully!')
        setEditingFile(null)
        loadFiles(currentPath)
        
        // Trigger deployment if this is a code file
        if (editingFile.name.match(/\.(js|jsx|ts|tsx|html|css|json|md)$/)) {
          triggerDeployment('File saved: ' + editingFile.name)
        }
      } else {
        toast.error(data.error || 'Failed to save file')
      }
    } catch (error) {
      toast.error('Error saving file')
      console.error(error)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name')
      return
    }

    const fullPath = currentPath ? `${currentPath}/${newFileName}` : newFileName
    
    try {
      toast.loading(`Creating ${fileType}...`)
      const res = await fetch('/api/github/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: fullPath,
          content: fileType === 'file' ? btoa('// New file created via CyberVercel') : null,
          type: fileType,
          message: `Create ${fileType}: ${newFileName} via CyberVercel`
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`${fileType === 'file' ? 'File' : 'Folder'} created successfully!`)
        setShowCreateModal(false)
        setNewFileName('')
        loadFiles(currentPath)
      } else {
        toast.error(data.error || `Failed to create ${fileType}`)
      }
    } catch (error) {
      toast.error(`Error creating ${fileType}`)
      console.error(error)
    }
  }

  const handleDeleteFile = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return

    try {
      toast.loading('Deleting...')
      const res = await fetch('/api/github/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: file.path,
          sha: file.sha,
          message: `Delete ${file.name} via CyberVercel`
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Deleted successfully!')
        loadFiles(currentPath)
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Error deleting file')
      console.error(error)
    }
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const content = event.target.result
        const base64Content = btoa(content)
        
        const uploadPath = currentPath ? `${currentPath}/${file.name}` : file.name
        
        toast.loading('Uploading file...')
        const res = await fetch('/api/github/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo,
            path: uploadPath,
            content: base64Content,
            message: `Upload ${file.name} via CyberVercel`
          })
        })
        
        const data = await res.json()
        
        if (res.ok) {
          toast.success('File uploaded successfully!')
          loadFiles(currentPath)
          triggerDeployment('File uploaded: ' + file.name)
        } else {
          toast.error(data.error || 'Upload failed')
        }
      } catch (error) {
        toast.error('Error uploading file')
        console.error(error)
      } finally {
        setUploading(false)
      }
    }
    
    reader.readAsBinaryString(file)
  }

  const triggerDeployment = async (reason) => {
    try {
      const res = await fetch('/api/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          reason 
        })
      })
      
      if (res.ok) {
        toast.success('Deployment triggered!')
      }
    } catch (error) {
      console.error('Error triggering deployment:', error)
    }
  }

  const getFileIcon = (fileName, type) => {
    if (type === 'dir') return '📁'
    
    const ext = fileName.split('.').pop().toLowerCase()
    const icons = {
      js: '🟨', jsx: '⚛️', ts: '🟦', tsx: '⚛️',
      html: '🌐', css: '🎨', json: '📋', md: '📝',
      py: '🐍', php: '🐘', java: '☕', cpp: '⚙️',
      go: '🐹', rs: '🦀', rb: '💎', vue: '🟢',
      txt: '📄', yml: '⚙️', yaml: '⚙️', xml: '📄',
      png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
      svg: '🖼️', ico: '🖼️', pdf: '📕', zip: '🗜️'
    }
    return icons[ext] || '📄'
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-folder-open text-neon-blue"></i>
            <h2 className="text-xl font-bold text-white truncate">{projectName}</h2>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setCurrentPath('')}
              className="text-sm text-neon-blue hover:underline px-2 py-1 rounded hover:bg-dark-800"
            >
              {repo.split('/')[1]}
            </button>
            
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <span className="text-gray-500 mx-1">/</span>
                <button
                  onClick={() => setCurrentPath(crumb.path)}
                  className="text-sm text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-dark-800 truncate max-w-[100px]"
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            id="fileUpload"
            onChange={handleUploadFile}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className={`neon-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            Upload
          </label>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
          >
            <FaPlus /> New
          </button>
          
          {currentPath && (
            <button
              onClick={() => {
                const paths = currentPath.split('/')
                paths.pop()
                setCurrentPath(paths.join('/'))
              }}
              className="neon-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaArrowLeft /> Back
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-2xl text-neon-blue mr-3" />
          <span className="text-gray-400">Loading files...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-folder-open text-4xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-bold text-white mb-2">Empty Directory</h3>
          <p className="text-gray-400 mb-6">This folder doesn't contain any files.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neon-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <FaPlus /> Create your first file
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {files.map(file => (
            <div 
              key={file.sha || file.path} 
              className="cyber-border rounded-lg p-4 hover:shadow-glow transition-all cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                    <div className="min-w-0">
                      <h4 className="font-medium text-white truncate" title={file.name}>
                        {file.name}
                      </h4>
                      {file.type === 'file' && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatSize(file.size)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {file.type === 'file' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileClick(file)
                      }}
                      className="w-8 h-8 rounded bg-dark-800 flex items-center justify-center hover:bg-neon-blue/20 transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="text-xs text-neon-blue" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(file)
                    }}
                    className="w-8 h-8 rounded bg-dark-800 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <FaTrash className="text-xs text-red-400" />
                  </button>
                </div>
              </div>
              
              {file.type === 'dir' && (
                <div className="mt-3 text-xs text-gray-400">
                  <i className="fas fa-folder mr-1"></i>
                  Directory
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingFile(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="cyber-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden bg-dark-900">
              <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaCode className="text-neon-blue" />
                  <div>
                    <h3 className="font-bold text-white">Editing: {editingFile.name}</h3>
                    <p className="text-xs text-gray-400">{editingFile.path}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingFile(null)}
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4 h-[60vh]">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full bg-dark-800 text-gray-200 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-neon-blue focus:outline-none resize-none scrollbar-cyber"
                  spellCheck="false"
                />
              </div>
              
              <div className="p-4 border-t border-gray-800 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {fileContent.length} characters, {fileContent.split('\n').length} lines
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFile(null)}
                    className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFile}
                    className="bg-gradient-to-r from-neon-green to-neon-blue text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create File/Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="cyber-border rounded-2xl w-full max-w-md bg-dark-900">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Create New</h3>
                <p className="text-gray-400 text-sm">in {currentPath || repo.split('/')[1]}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setFileType('file')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      fileType === 'file'
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-gray-700 bg-dark-800/30 hover:border-gray-600'
                    }`}
                  >
                    <FaFile className="text-2xl text-neon-blue mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">File</p>
                  </button>
                  <button
                    onClick={() => setFileType('dir')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      fileType === 'dir'
                        ? 'border-neon-purple bg-neon-purple/10'
                        : 'border-gray-700 bg-dark-800/30 hover:border-gray-600'
                    }`}
                  >
                    <FaFolder className="text-2xl text-neon-purple mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Folder</p>
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {fileType === 'file' ? 'File Name' : 'Folder Name'} *
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder={fileType === 'file' ? 'index.js' : 'src'}
                    className="neon-input w-full"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {fileType === 'file' ? 'Include extension (e.g., .js, .html)' : 'No special characters'}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFile}
                    disabled={!newFileName.trim()}
                    className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Create {fileType === 'file' ? 'File' : 'Folder'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
