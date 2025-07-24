# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.


## Collaboration & Contribution Guidelines

### Commit Message Convention
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.
- Prefix your commit with one of the following types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation only changes
  - `chore`: Maintenance, build, or tooling changes
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `test`: Adding or updating tests
  - `style`: Formatting, missing semi colons, etc; no code change
  - `perf`: Performance improvement
- Example:
  ```
  feat(auth): add OAuth login with Google
  fix(product): correct price calculation bug
  docs: update README with setup instructions
  ```

### Branch Naming Convention
- Use the format: `<devname>.<feature>`
- Example: `nafhan.auth`, `alex.product-listing`, `sarah.fix-login`
- Use short, descriptive feature names. Use hyphens for multi-word features: `john.product-table-fix`

### Pull Request (PR) Rules
- PR titles should be clear and reference the main change (e.g., `feat: add Kanban drag-and-drop`)
- Link related issues in the PR description if applicable.
- Provide a concise summary of changes and any special instructions for reviewers.
- Ensure all checks (CI, lint, tests) pass before requesting review.
- Assign at least one reviewer; self-merge is discouraged unless urgent.
- Use draft PRs for work-in-progress.

### General Collaboration Rules
- Sync with the latest `main` before starting new work.
- Keep PRs focused and as small as possible; large PRs should be split if feasible.
- Use code comments for complex logic or non-obvious decisions.
- Document new environment variables or configuration changes in the README.
- Discuss breaking changes or architectural decisions in issues before implementation.
- Be respectful and constructive in code reviews and discussions.

### Push/Pull Workflow

This project uses two main branches:
- **main**: Production branch (deploys to production)
- **dev**: Staging branch (for development and staging/testing)

> **All feature/fix branches must be merged into `dev`, _not_ `main`. Only maintainers should merge `dev` into `main` for production releases.**

#### Step-by-Step Workflow for Contributors
<picture><img alt="Sentry" src=".github/images/git_workflow.png">
        </picture>

1. **Sync your local repository**
   - Make sure you have the latest `dev` branch:
     ```sh
     git checkout dev
     git pull origin dev
     ```
2. **Create your feature/fix branch**
   - Use the branch naming convention:
     ```sh
     git checkout -b <devname>.<feature>
     # Example: git checkout -b nafhan.auth
     ```
3. **Work on your changes**
   - Commit using the [conventional commit](#commit-message-convention) format.
4. **Sync with `dev` before pushing**
   - Before pushing, always pull the latest `dev` to avoid conflicts:
     ```sh
     git checkout dev
     git pull origin dev
     git checkout <your-branch>
     git merge dev
     # Resolve any conflicts if needed
     ```
5. **Push your branch**
   ```sh
   git push origin <your-branch>
   ```
6. **Open a Pull Request**
   - Target the `dev` branch (not `main`).
   - Fill out the PR template, link issues if applicable, and request review.
