# Contribution Guidelines

Thank you for considering contributing to this project! To ensure a smooth collaboration process, please follow the guidelines below.

---

## Branch Naming Conventions

When creating branches, use the following naming conventions:

| Type      | Format                     | Example                     |
|-----------|----------------------------|-----------------------------|
| Feature   | `feature/your-feature`     | `feature/login-auth`        |
| Bugfix    | `bugfix/fix-name`          | `bugfix/fix-navbar`         |
| Hotfix    | `hotfix/branch-name`       | `hotfix/crash-on-startup`   |
| Chore     | `chore/description`        | `chore/update-dependencies` |
| Refactor  | `refactor/description`     | `refactor/user-service`     |

> Use lowercase letters and hyphens (`-`) to separate words. Avoid underscores (`_`) or spaces.

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) style for commit messages:
```
<type>(<scope>): <short description>
```

- **type**: feat, fix, docs, style, refactor, test, chore
- **scope**: optional, e.g., `auth`, `ui`, `api`
- **short description**: concise summary of changes

**Examples:**
```
feat(auth): add JWT token authentication
fix(ui): correct button alignment on mobile
chore(deps): update React to v19
```

---

## Pull Request Guidelines

1. Always branch off the `main` or `develop` branch.
2. Ensure your branch is up-to-date with the base branch before creating a PR.
3. Provide a descriptive title and summary for the PR.
4. Link relevant issues using `#issue-number`.
5. Request reviews from at least one teammate before merging.

---

## Code Standards

- Write clear, readable code.
- Follow existing coding style and formatting.
- Include comments for complex logic.
- Ensure tests pass before pushing changes.

---

## Reporting Issues

- Check if the issue already exists.
- Provide a clear and descriptive title.
- Include steps to reproduce, expected behavior, and screenshots if relevant.

---

Thanks for contributing! Your effort makes the project better for everyone.