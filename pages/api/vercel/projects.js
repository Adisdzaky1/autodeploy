export default async function handler(req, res) {
  const { method, query, body } = req
  const { id } = query
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const baseUrl = 'https://api.vercel.com'

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Get single project
          const projectRes = await fetch(
            `${baseUrl}/v9/projects/${id}${teamId ? `?teamId=${teamId}` : ''}`,
            { headers }
          )
          const project = await projectRes.json()
          
          // Get latest deployment
          const deploymentsRes = await fetch(
            `${baseUrl}/v6/deployments?projectId=${id}&limit=1${teamId ? `&teamId=${teamId}` : ''}`,
            { headers }
          )
          const deployments = await deploymentsRes.json()
          
          res.json({
            ...project,
            latestDeployment: deployments.deployments?.[0] || null
          })
        } else {
          // List all projects
          const response = await fetch(
            `${baseUrl}/v9/projects${teamId ? `?teamId=${teamId}` : ''}`,
            { headers }
          )
          const data = await response.json()
          res.json(data)
        }
        break

      case 'POST':
        // Create project
        const createRes = await fetch(
          `${baseUrl}/v9/projects${teamId ? `?teamId=${teamId}` : ''}`,
          {
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
          }
        )
        const newProject = await createRes.json()
        res.json(newProject)
        break

      case 'DELETE':
        // Delete project
        await fetch(
          `${baseUrl}/v9/projects/${id}${teamId ? `?teamId=${teamId}` : ''}`,
          {
            method: 'DELETE',
            headers
          }
        )
        res.json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Vercel API Error:', error)
    res.status(500).json({ error: error.message })
  }
}