# Acquisition-grade template - automation notes

This repository now includes automated workflows to unpack uploaded ZIPs, run CI, perform CodeQL scans,
create pull requests, and auto-merge automated PRs when checks and approvals pass.

Required manual steps (admin actions you must perform in the GitHub UI):
- Add repository secrets:
  - SLACK_WEBHOOK (if you want Slack notifications)
  - GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY (if you create/install the GitHub App)
- Enable branch protection for main and require status checks and CODEOWNERS approval as desired:
  https://github.com/worthwyl2022-cloud/acquisition-grade-template/settings/branches
- Enable secret scanning & push protection (Security -> Security & analysis):
  https://github.com/worthwyl2022-cloud/acquisition-grade-template/settings/security_analysis
- (Optional) Create and install the GitHub App using .github/github-app-manifest.json and follow the README.

