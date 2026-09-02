const express = require('express')
const bodyParser = require('body-parser')
const { createAppAuth } = require('@octokit/auth-app')
const { Octokit } = require('@octokit/rest')

const APP_ID = process.env.GITHUB_APP_ID
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY

if (!APP_ID || !PRIVATE_KEY) {
  console.warn('GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set in env')
}

const auth = createAppAuth({
  id: APP_ID,
  privateKey: PRIVATE_KEY
})

async function getInstallationOctokit(installationId) {
  const installationAuth = await auth({ type: 'installation', installationId: Number(installationId) })
  const octokit = new Octokit({ auth: installationAuth.token })
  return octokit
}

const app = express()
app.use(bodyParser.json())

// Example endpoint: POST /create-pr
// Body: { installation_id, owner, repo, files: [{path, content}], branchName, prTitle, prBody }
app.post('/create-pr', async (req, res) => {
  try {
    const { installation_id, owner, repo, files, branchName, prTitle, prBody } = req.body
    if (!installation_id || !owner || !repo || !files) return res.status(400).json({ error: 'missing fields' })

    const octokit = await getInstallationOctokit(installation_id)

    // Get default branch sha
    const { data: repoData } = await octokit.repos.get({ owner, repo })
    const baseSha = repoData.default_branch

    // Create branch from default branch
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${baseSha}` })
    const commitSha = refData.object.sha

    // Create new branch
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: commitSha })

    // Create/Update files
    for (const f of files) {
      const contentEncoded = Buffer.from(f.content).toString('base64')
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path: f.path, message: `Add ${f.path}`, content: contentEncoded, branch: branchName
      })
    }

    // Create PR
    const { data: pr } = await octokit.pulls.create({ owner, repo, title: prTitle || 'Automated PR', head: branchName, base: 'main', body: prBody || '' })

    res.json({ pr })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Middleware listening on ${PORT}`))
