// pages/api/vercel/projects.js
export default async function handler(req, res) {
  const { method, query, body } = req
  const { id } = query
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token) {
    return res.status(500).json({ error: 'Vercel token not configured' })
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const baseUrl = 'https://api.vercel.com'
  const teamParam = teamId ? `?teamId=${teamId}` : ''

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Get single project with deployments
          const [projectRes, deploymentsRes] = await Promise.all([
            fetch(`${baseUrl}/v9/projects/${id}${teamParam}`, { headers }),
            fetch(`${baseUrl}/v6/deployments?projectId=${id}&limit=5${teamId ? `&teamId=${teamId}` : ''}`, { headers })
          ])
          
          if (!projectRes.ok) {
            return res.status(projectRes.status).json({ error: 'Project not found' })
          }
          
          const project = await projectRes.json()
          const deployments = await deploymentsRes.json()
          
          res.json({
            ...project,
            deployments: deployments.deployments || []
          })
        } else {
          // List all projects with their latest deployment
          const response = await fetch(`${baseUrl}/v9/projects${teamParam}`, { headers })
          const data = await response.json()
          
          // Fetch latest deployment for each project
          const projectsWithDeployments = await Promise.all(
            (data.projects || []).map(async (project) => {
              try {
                const deploymentRes = await fetch(
                  `${baseUrl}/v6/deployments?projectId=${project.id}&limit=1${teamId ? `&teamId=${teamId}` : ''}`,
                  { headers }
                )
                const deployments = await deploymentRes.json()
                return {
                  ...project,
                  latestDeployment: deployments.deployments?.[0] || null
                }
              } catch (error) {
                return { ...project, latestDeployment: null }
              }
            })
          )
          
          res.json({ projects: projectsWithDeployments })
        }
        break

      case 'POST':
        // Create project
        const createRes = await fetch(`${baseUrl}/v9/projects${teamParam}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: body.name,
            framework: body.framework,
            gitRepository: body.gitRepository,
            buildCommand: body.buildCommand,
            outputDirectory: body.outputDirectory,
            rootDirectory: body.rootDirectory,
            installCommand: body.installCommand
          })
        })
        
        const result = await createRes.json()
        
        if (!createRes.ok) {
          return res.status(createRes.status).json({ 
            error: result.error?.message || 'Failed to create project' 
          })
        }
        
        res.json(result)
        break

      case 'DELETE':
        // Delete project
        const deleteRes = await fetch(`${baseUrl}/v9/projects/${id}${teamParam}`, {
          method: 'DELETE',
          headers
        })
        
        if (!deleteRes.ok) {
          const error = await deleteRes.json()
          return res.status(deleteRes.status).json({ error: error.message })
        }
        
        res.json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('Vercel API Error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
