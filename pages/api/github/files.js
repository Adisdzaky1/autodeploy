export default async function handler(req, res) {
  const { method, query, body } = req
  const { repo, path, content } = query
  const token = process.env.GITHUB_TOKEN

  const headers = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Vercel-Manager',
    'Accept': 'application/vnd.github.v3+json'
  }

  const baseUrl = 'https://api.github.com'

  try {
    switch (method) {
      case 'GET':
        // Get files or file content
        if (!repo) {
          return res.status(400).json({ error: 'Repository name required' })
        }

        const url = path 
          ? `${baseUrl}/repos/${repo}/contents/${path}`
          : `${baseUrl}/repos/${repo}/contents`

        const response = await fetch(url, { headers })
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (content === 'true' && !Array.isArray(data)) {
          res.json(data) // File content
        } else {
          const files = Array.isArray(data) ? data : [data]
          res.json(files)
        }
        break

      case 'POST':
        // Create file or directory
        const { type, message, content: fileContent } = body
        
        if (type === 'dir') {
          // Create directory (empty file .gitkeep)
          await fetch(`${baseUrl}/repos/${repo}/contents/${path}/.gitkeep`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: message || `Create directory ${path}`,
              content: btoa('')
            })
          })
        } else {
          // Create file
          const createRes = await fetch(`${baseUrl}/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: message || `Create ${path}`,
              content: fileContent || btoa('')
            })
          })
          
          const result = await createRes.json()
          res.json(result)
        }
        res.json({ success: true })
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
        
        const updateResult = await updateRes.json()
        res.json(updateResult)
        break

      case 'DELETE':
        // Delete file
        await fetch(`${baseUrl}/repos/${repo}/contents/${path}`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({
            message: body.message || `Delete ${path}`,
            sha: body.sha
          })
        })
        res.json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('GitHub API Error:', error)
    res.status(500).json({ error: error.message })
  }
}