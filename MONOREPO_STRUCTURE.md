# Acquisition-Grade Template - Monorepo Structure

This is a Tier 1 acquisition-grade project designed for Microsoft governance standards.

## Directory Layout

```
.
├── scripts/
│   └── github-app/                 # Node.js GitHub App middleware
│       ├── package.json            # Workspace package definition
│       └── index.js                # GitHub App entry point
│
├── cranium-push/                   # Kotlin kernel & invariants (unpacked from ZIP)
│   └── src/main/kotlin/
│       └── com/example/cranium/
│           ├── kernel/             # Kernel state reduction & invariants
│           └── authority/          # Authority receipt chain
│
├── test/                           # Test files (unit, integration, property tests)
│
├── package.json                    # Root workspace definition (Tier 1: REQUIRED)
├── package-lock.json               # Lock file (Tier 1: REQUIRED for deterministic builds)
├── .npmrc                          # NPM configuration
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # CI/CD pipeline
│   │   ├── auto-unpack-zip.yml     # Automatic ZIP extraction
│   │   └── auto-merge.yml          # Automated merging
│   ├── ISSUE_TEMPLATE/             # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md    # PR template
│
├── docs/
│   ├── PROPERTY_REGISTRY.md        # Adversarial properties & test coverage
│   ├── ARCHITECTURE.md             # System architecture
│   └── API.md                      # API documentation
│
├── LICENSE                         # MIT License
├── README.md                       # Project overview
├── SECURITY.md                     # Security policy
├── CODE_OF_CONDUCT.md              # Community guidelines
└── CONTRIBUTING.md                 # Contribution guidelines
```

## Acquisition-Grade Tier 1 Requirements Met

✅ **Package Management**
- Root `package.json` with all dependencies
- `package-lock.json` for reproducible builds
- Workspace configuration for monorepo

✅ **CI/CD Pipeline**
- GitHub Actions workflows for automated testing
- CodeQL static analysis
- Automated dependency updates (Dependabot)

✅ **Documentation**
- README with clear project description
- SECURITY.md for vulnerability reporting
- CODE_OF_CONDUCT.md for community standards
- PROPERTY_REGISTRY.md for governance
- CONTRIBUTING.md for developer onboarding

✅ **Governance**
- CODEOWNERS for review requirements
- Issue & PR templates
- Kernel invariants for state consistency
- Authority receipt chain for auditability

✅ **Multi-Language Support**
- Kotlin for kernel/invariants
- JavaScript/Node for GitHub App
- Automated ZIP unpacking workflow

## Building & Testing

```bash
# Install dependencies
npm ci

# Run all tests
npm test

# Start GitHub App
npm start

# Security audit
npm audit
```

## Workflow: Adding New Code

1. **For Kotlin/JVM code**: Package as ZIP with `cranium-push/` directory
2. **Push the ZIP** to this repository
3. **Workflow auto-executes**:
   - Detects `.zip` file
   - Extracts to correct locations
   - Creates PR for review
   - Maintains governance

4. **Review & Merge**: All code goes through CODEOWNERS review

## Microsoft Tier 1 Standards

This template ensures compliance with:
- Reproducible builds (lock files)
- Security scanning (CodeQL)
- Automated dependency management
- Clear governance structure
- Comprehensive documentation
- Multi-platform support
