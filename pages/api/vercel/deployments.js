// pages/api/vercel/deployments.js
export default async function handler(req, res) {
  const { method, query, body } = req
  const { projectId, deploymentId } = query
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token) {
    return res.status(500).json({ 
      success: false,
      error: 'Vercel token not configured'
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
        if (!projectId) {
          return res.status(400).json({ 
            success: false,
            error: 'Project ID is required'
          })
        }

        const response = await fetch(
          `${baseUrl}/v6/deployments?projectId=${projectId}&limit=20${teamId ? `&teamId=${teamId}` : ''}`,
          { headers }
        )
        
        if (!response.ok) {
          const error = await response.json()
          return res.status(response.status).json({ 
            success: false,
            error: error.error?.message || 'Failed to fetch deployments'
          })
        }
        
        const data = await response.json()
        res.json({ 
          success: true,
          deployments: data.deployments || []
        })
        break

      case 'POST':
        if (!body.projectId) {
          return res.status(400).json({ 
            success: false,
            error: 'Project ID is required'
          })
        }

        const createRes = await fetch(`${baseUrl}/v13/deployments${teamParam}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: body.name,
            project: body.projectId,
            target: body.target || 'production',
            gitSource: body.gitSource || undefined
          })
        })
        
        const createData = await createRes.json()
        
        if (!createRes.ok) {
          return res.status(createRes.status).json({ 
            success: false,
            error: createData.error?.message || 'Failed to create deployment'
          })
        }
        
        res.json({ 
          success: true,
          message: 'Deployment triggered successfully',
          deployment: createData
        })
        break

      case 'DELETE':
        if (!deploymentId) {
          return res.status(400).json({ 
            success: false,
            error: 'Deployment ID is required'
          })
        }

        const deleteRes = await fetch(
          `${baseUrl}/v12/deployments/${deploymentId}${teamParam}`,
          {
            method: 'DELETE',
            headers
          }
        )
        
        if (!deleteRes.ok) {
          const error = await deleteRes.json()
          return res.status(deleteRes.status).json({ 
            success: false,
            error: error.error?.message || 'Failed to cancel deployment'
          })
        }
        
        res.json({ 
          success: true,
          message: 'Deployment cancelled successfully'
        })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).json({ 
          success: false,
          error: `Method ${method} Not Allowed`
        })
    }
  } catch (error) {
    console.error('Deployments API Error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}
