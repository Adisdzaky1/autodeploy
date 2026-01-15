import { useState, useEffect } from 'react'
import { 
  FaFile, 
  FaFolder, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCode,
  FaSave,
  FaTimes 
} from 'react-icons/fa'

export default function FileExplorer({ repo, projectId }) {
  const [files, setFiles] = useState([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingFile, setEditingFile] = useState(null)
  const [newFileName, setNewFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fileType, setFileType] = useState('file')

  useEffect(() => {
    if (repo) {
      loadFiles(currentPath)
    }
  }, [repo, currentPath])

  const loadFiles = async (path = '') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/github/files?repo=${repo}&path=${path}`)
      const data = await res.json()
      setFiles(data)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (file) => {
    if (file.type === 'dir') {
      setCurrentPath(file.path)
    } else {
      try {
        const res = await fetch(`/api/github/files?repo=${repo}&path=${file.path}&content=true`)
        const content = await res.json()
        setEditingFile(file)
        setFileContent(atob(content.content || ''))
      } catch (error) {
        console.error('Error loading file content:', error)
      }
    }
  }

  const handleSaveFile = async () => {
    if (!editingFile) return

    try {
      await fetch('/api/github/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: editingFile.path,
          content: btoa(fileContent),
          sha: editingFile.sha,
          message: `Update ${editingFile.name}`
        })
      })
      
      setEditingFile(null)
      loadFiles(currentPath)
    } catch (error) {
      console.error('Error saving file:', error)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return

    const fullPath = currentPath ? `${currentPath}/${newFileName}` : newFileName
    
    try {
      await fetch('/api/github/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: fullPath,
          content: fileType === 'file' ? btoa('') : null,
          type: fileType,
          message: `Create ${newFileName}`
        })
      })
      
      setShowCreateModal(false)
      setNewFileName('')
      loadFiles(currentPath)
    } catch (error) {
      console.error('Error creating file:', error)
    }
  }

  const handleDeleteFile = async (file) => {
    if (!confirm(`Delete ${file.name}?`)) return

    try {
      await fetch('/api/github/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: file.path,
          sha: file.sha,
          message: `Delete ${file.name}`
        })
      })
      
      loadFiles(currentPath)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleBack = () => {
    const paths = currentPath.split('/')
    paths.pop()
    setCurrentPath(paths.join('/'))
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const icons = {
      js: '🟨', jsx: '⚛️', ts: '🟦', tsx: '⚛️',
      html: '🌐', css: '🎨', json: '📋', md: '📝',
      py: '🐍', php: '🐘', java: '☕', cpp: '⚙️',
      go: '🐹', rs: '🦀', rb: '💎'
    }
    return icons[ext] || '📄'
  }

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <div className="path-navigation">
          <button 
            onClick={() => setCurrentPath('')}
            className="path-root"
          >
            {repo.split('/')[1]}
          </button>
          
          {currentPath.split('/').filter(Boolean).map((segment, index, arr) => (
            <button
              key={index}
              onClick={() => setCurrentPath(arr.slice(0, index + 1).join('/'))}
              className="path-segment"
            >
              / {segment}
            </button>
          ))}
        </div>

        <div className="explorer-actions">
          <button 
            className="action-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> New
          </button>
          
          {currentPath && (
            <button 
              className="action-btn"
              onClick={handleBack}
            >
              Back
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="empty-folder">
          <p>This folder is empty</p>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create your first file
          </button>
        </div>
      ) : (
        <div className="file-list">
          {files.map(file => (
            <div key={file.sha} className="file-item">
              <div 
                className="file-info"
                onClick={() => handleFileClick(file)}
              >
                <span className="file-icon">
                  {file.type === 'dir' ? '📁' : getFileIcon(file.name)}
                </span>
                <span className="file-name">{file.name}</span>
                {file.type === 'file' && (
                  <span className="file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                )}
              </div>
              
              <div className="file-actions">
                {file.type === 'file' && (
                  <button
                    className="edit-btn"
                    onClick={() => handleFileClick(file)}
                  >
                    <FaEdit />
                  </button>
                )}
                
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteFile(file)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingFile && (
        <div className="editor-modal">
          <div className="editor-content">
            <div className="editor-header">
              <h3>
                <FaCode /> Editing: {editingFile.name}
              </h3>
              <button 
                className="close-btn"
                onClick={() => setEditingFile(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <textarea
              className="editor-textarea"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              spellCheck="false"
            />
            
            <div className="editor-footer">
              <button 
                className="save-btn"
                onClick={handleSaveFile}
              >
                <FaSave /> Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setEditingFile(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="create-modal">
          <div className="modal-content">
            <h3>Create New</h3>
            
            <div className="type-selector">
              <button
                className={`type-btn ${fileType === 'file' ? 'active' : ''}`}
                onClick={() => setFileType('file')}
              >
                <FaFile /> File
              </button>
              <button
                className={`type-btn ${fileType === 'dir' ? 'active' : ''}`}
                onClick={() => setFileType('dir')}
              >
                <FaFolder /> Folder
              </button>
            </div>
            
            <input
              type="text"
              placeholder={`Enter ${fileType} name...`}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="filename-input"
            />
            
            <div className="modal-actions">
              <button 
                className="create-file-btn"
                onClick={handleCreateFile}
              >
                Create
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .file-explorer {
          height: 100%;
        }
        
        .explorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .path-navigation {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .path-root, .path-segment {
          background: #f0f0f0;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          color: #333;
        }
        
        .path-root:hover, .path-segment:hover {
          background: #e0e0e0;
        }
        
        .explorer-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .action-btn:hover {
          opacity: 0.9;
        }
        
        .loading, .empty-folder {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        
        .empty-folder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .create-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .file-item:hover {
          background: #e9ecef;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          flex: 1;
        }
        
        .file-icon {
          font-size: 1.2rem;
        }
        
        .file-name {
          color: #333;
          font-weight: 500;
        }
        
        .file-size {
          color: #666;
          font-size: 0.9rem;
          margin-left: auto;
        }
        
        .file-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .edit-btn, .delete-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .edit-btn {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .edit-btn:hover {
          background: #bbdefb;
        }
        
        .delete-btn {
          background: #ffebee;
          color: #f44336;
        }
        
        .delete-btn:hover {
          background: #ffcdd2;
        }
        
        .editor-modal, .create-modal {
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
        }
        
        .editor-content, .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .editor-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        
        .editor-textarea {
          flex: 1;
          padding: 1rem;
          border: none;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          resize: none;
          min-height: 400px;
        }
        
        .editor-footer, .modal-actions {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        
        .save-btn, .create-file-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .cancel-btn {
          padding: 10px 20px;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #333;
        }
        
        .type-selector {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }
        
        .type-btn {
          flex: 1;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .type-btn.active {
          border-color: #667eea;
          background: #f0f0ff;
        }
        
        .filename-input {
          margin: 0 1.5rem 1.5rem;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
        }
        
        @media (max-width: 768px) {
          .explorer-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .editor-content, .modal-content {
            width: 95%;
          }
        }
      `}</style>
    </div>
  )
}