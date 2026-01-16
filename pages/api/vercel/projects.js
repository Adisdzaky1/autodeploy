// pages/api/vercel/projects.js - Perbaikan PUT method
export default async function handler(req, res) {
  const { method, query, body } = req
  const { id } = query
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token) {
    return res.status(500).json({ 
      success: false,
      error: 'Vercel token not configured',
      message: 'Please configure VERCEL_TOKEN environment variable'
    })
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
          const projectRes = await fetch(`${baseUrl}/v9/projects/${id}${teamParam}`, { headers })
          
          if (!projectRes.ok) {
            const error = await projectRes.json()
            return res.status(projectRes.status).json({ 
              success: false,
              error: error.error?.message || 'Project not found'
            })
          }
          
          const project = await projectRes.json()
          
          // Get deployments
          const deploymentsRes = await fetch(
            `${baseUrl}/v6/deployments?projectId=${id}&limit=10${teamId ? `&teamId=${teamId}` : ''}`,
            { headers }
          )
          
          const deployments = await deploymentsRes.json()
          
          res.json({
            success: true,
            ...project,
            deployments: deployments.deployments || []
          })
        } else {
          const response = await fetch(`${baseUrl}/v9/projects${teamParam}`, { headers })
          
          if (!response.ok) {
            const error = await response.json()
            return res.status(response.status).json({ 
              success: false,
              error: error.error?.message || 'Failed to fetch projects'
            })
          }
          
          const data = await response.json()
          
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
          
          res.json({ 
            success: true,
            projects: projectsWithDeployments 
          })
        }
        break

      case 'POST':
        try {
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
              success: false,
              error: result.error?.message || 'Failed to create project',
              details: result
            })
          }
          
          res.json({ 
            success: true,
            message: 'Project created successfully',
            project: result
          })
        } catch (error) {
          res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
          })
        }
        break

      case 'PUT':
        try {
          const updateRes = await fetch(`${baseUrl}/v9/projects/${id}${teamParam}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              name: body.name,
              framework: body.framework,
              buildCommand: body.buildCommand,
              outputDirectory: body.outputDirectory,
              rootDirectory: body.rootDirectory,
              installCommand: body.installCommand
            })
          })
          
          const result = await updateRes.json()
          
          if (!updateRes.ok) {
            return res.status(updateRes.status).json({ 
              success: false,
              error: result.error?.message || 'Failed to update project',
              details: result
            })
          }
          
          res.json({ 
            success: true,
            message: 'Project updated successfully',
            project: result
          })
        } catch (error) {
          res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
          })
        }
        break

      case 'DELETE':
        try {
          const deleteRes = await fetch(`${baseUrl}/v9/projects/${id}${teamParam}`, {
            method: 'DELETE',
            headers
          })
          
          if (!deleteRes.ok) {
            const error = await deleteRes.json()
            return res.status(deleteRes.status).json({ 
              success: false,
              error: error.error?.message || 'Failed to delete project'
            })
          }
          
          res.json({ 
            success: true,
            message: 'Project deleted successfully'
          })
        } catch (error) {
          res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
          })
        }
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ 
          success: false,
          error: `Method ${method} Not Allowed`
        })
    }
  } catch (error) {
    console.error('Vercel API Error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    })
  }
}
