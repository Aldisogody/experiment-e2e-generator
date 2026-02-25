---
name: release
description: Cut a new release of experiment-e2e-generator. Steps through version bump, CHANGELOG update, git tag, and npm publish.
disable-model-invocation: true
---

# Release Skill

Run each step in order. Do not skip steps or reorder them.

## Usage

Invoke with a bump type argument: `/release patch`, `/release minor`, or `/release major`.
Default to `patch` if no argument is provided.

## Steps

1. **Confirm the working tree is clean**:
   ```bash
   git status
   ```
   Stop and fix any uncommitted changes before proceeding.

2. **Bump the version**:
   ```bash
   yarn version --patch   # or --minor / --major per argument
   ```

3. **Update `CHANGELOG.md`**:
   - Get commits since last tag: `git log --oneline $(git describe --tags --abbrev=0)..HEAD`
   - Add a new `## [<new-version>] - <YYYY-MM-DD>` section at the top of the changelog
   - Group entries by type: `feat`, `fix`, `chore`, `refactor`, `docs`, `ci`

4. **Commit the release**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to <new-version>"
   ```

5. **Tag and push**:
   ```bash
   git tag v<new-version>
   git push && git push --tags
   ```
   The Release GitHub Action triggers automatically on tag push and creates the GitHub Release.

6. **Publish to npm**:
   ```bash
   yarn publish --access public
   ```

7. **Verify**: Check that the GitHub Release was created and `npx experiment-e2e-generator@<new-version>` resolves correctly.
