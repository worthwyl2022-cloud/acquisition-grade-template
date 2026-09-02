# GitHub App middleware skeleton (Node)

This is a minimal Express app showing how to exchange a GitHub App JWT for an installation token
and create a branch + commit + PR. You must create a GitHub App and add the app ID & private key
as repository or organization secrets before using.

Files:
- index.js  : Express server and example endpoint
- package.json: dependencies

Secrets required (store in repo or org Secrets):
- GITHUB_APP_ID
- GITHUB_APP_PRIVATE_KEY (PEM format)
- INSTALLATION_ID (after installing the app; can be discovered via API)

This code uses @octokit/auth-app and @octokit/rest.
