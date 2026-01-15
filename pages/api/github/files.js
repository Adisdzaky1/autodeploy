// pages/api/github/files.js
export default async function handler(req, res) {
  const { method, query, body } = req
  const { repo, path, content } = query
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' })
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }

  const baseUrl = 'https://api.github.com'

  try {
    switch (method) {
      case 'GET':
        if (!repo) {
          return res.status(400).json({ error: 'Repository name required' })
        }

        const url = path 
          ? `${baseUrl}/repos/${repo}/contents/${encodeURIComponent(path)}`
          : `${baseUrl}/repos/${repo}/contents`

        const response = await fetch(url, { headers })
        
        if (response.status === 404) {
          return res.status(404).json({ error: 'File or directory not found' })
        }
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (content === 'true') {
          // Return file content
          res.json(data)
        } else {
          // Return list of files/directories
          const files = Array.isArray(data) ? data : [data]
          const formattedFiles = files.map(file => ({
            name: file.name,
            path: file.path,
            type: file.type,
            size: file.size,
            sha: file.sha,
            html_url: file.html_url,
            download_url: file.download_url
          }))
          res.json(formattedFiles)
        }
        break

      case 'POST':
        // Create file
        const { message, content: fileContent, type } = body
        
        if (type === 'dir') {
          // Create directory by creating .gitkeep file
          const dirRes = await fetch(`${baseUrl}/repos/${repo}/contents/${path}/.gitkeep`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: message || `Create directory ${path}`,
              content: Buffer.from('').toString('base64')
            })
          })
          res.json(await dirRes.json())
        } else {
          const fileRes = await fetch(`${baseUrl}/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: message || `Create ${path}`,
              content: fileContent
            })
          })
          res.json(await fileRes.json())
        }
        break

      case 'PUT':
        // Update file
        const updateRes = await fetch(`${baseUrl}/repos/${repo}/contents/${path}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: body.message || `Update ${path}`,
            content: body.content,
            sha: body.sha
          })
        })
        res.json(await updateRes.json())
        break

      case 'DELETE':
        // Delete file
        const deleteRes = await fetch(`${baseUrl}/repos/${repo}/contents/${path}`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({
            message: body.message || `Delete ${path}`,
            sha: body.sha
          })
        })
        res.json(await deleteRes.json())
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('GitHub API Error:', error)
    res.status(500).json({ 
      error: error.message,
      details: 'Check if repository exists and you have proper permissions'
    })
  }
}
