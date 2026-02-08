# Contribution Guidelines

Thank you for considering contributing to this project! To ensure a smooth collaboration process, please follow the guidelines below.

---

## Branch Naming Conventions

When creating branches, use the following naming conventions:

| Type     | Format                 | Example                     |
| -------- | ---------------------- | --------------------------- |
| Feature  | `feature/your-feature` | `feature/login-auth`        |
| Bugfix   | `bugfix/fix-name`      | `bugfix/fix-navbar`         |
| Hotfix   | `hotfix/branch-name`   | `hotfix/crash-on-startup`   |
| Chore    | `chore/description`    | `chore/update-dependencies` |
| Refactor | `refactor/description` | `refactor/user-service`     |

> Use lowercase letters and hyphens (`-`) to separate words. Avoid underscores (`_`) or spaces.

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) style for commit messages:

```
<type>(<scope>): <short description>
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD configuration changes
- **build**: Build system changes

### Examples

```
feat(auth): add JWT token authentication
fix(ui): correct button alignment on mobile
chore(deps): update React to v19
docs(readme): add installation instructions
```

---

## Pull Request Guidelines

1. Always branch off the `main` or `develop` branch.
2. Ensure your branch is up-to-date with the base branch before creating a PR.
3. Run `npm run format` to ensure code is properly formatted.
4. Provide a descriptive title and summary for the PR.
5. Link relevant issues using `Closes #issue-number` or `Fixes #issue-number`.
6. Request reviews from at least one teammate before merging.
7. Ensure all CI checks pass before requesting review.

---

## Code Standards

- Write clear, readable code.
- Follow existing coding style and formatting.
- Run Prettier before committing: `npm run format`
- Include comments for complex logic.
- Ensure all tests pass before pushing changes.

---

## Reporting Issues

- Check if the issue already exists.
- Provide a clear and descriptive title.
- Include steps to reproduce, expected behavior, and screenshots if relevant.
- Label the issue appropriately (bug, enhancement, question, etc.).

---

Thanks for contributing! Your effort makes the project better for everyone.
