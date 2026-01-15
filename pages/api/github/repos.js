// pages/api/github/repos.js
export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN
  
  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' })
  }

  try {
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    
    // Format repos
    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      private: repo.private,
      fork: repo.fork,
      default_branch: repo.default_branch,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at
    }))

    res.status(200).json(formattedRepos)
  } catch (error) {
    console.error('GitHub repos error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      details: error.message 
    })
  }
}
