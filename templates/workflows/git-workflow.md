---
description: Professional Git workflow for team collaboration
---

# Git Workflow

## Branch Strategy

### Branch Naming Convention
```
feature/TICKET-123-short-description
fix/TICKET-456-bug-description
hotfix/critical-issue
refactor/module-name
docs/update-readme
chore/update-dependencies
```

### Branch Types
| Branch | Purpose | Merge To |
|--------|---------|----------|
| `main` | Production-ready code | - |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `hotfix/*` | Critical production fixes | `main` + `develop` |
| `release/*` | Release preparation | `main` + `develop` |

---

## Daily Workflow

### 1. Start of Day
```bash
# Switch to main/develop and update
git checkout develop
git pull origin develop

# Check your branches
git branch --list

# Clean up old branches
git fetch --prune
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

### 2. Starting New Work
```bash
# Create feature branch from latest develop
git checkout develop
git pull origin develop
git checkout -b feature/TICKET-123-user-authentication
```

### 3. Making Changes
```bash
# Check status frequently
git status

# Stage specific files
git add src/auth/login.js src/auth/login.test.js

# Or stage all changes
git add -A

# Review what you're committing
git diff --staged

# Commit with meaningful message
git commit
```

### 4. Commit Message Format
```
type(scope): short description (50 chars max)

Longer description if needed. Explain WHY, not WHAT.
The code shows what changed, the commit explains why.

- Bullet points for multiple items
- Keep lines under 72 characters

Refs: TICKET-123
Breaking Change: Description of breaking change (if any)
```

**Commit Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |

### 5. Pushing Changes
```bash
# First push (set upstream)
git push -u origin feature/TICKET-123-user-authentication

# Subsequent pushes
git push
```

---

## Keeping Your Branch Updated

### 6. Sync with Upstream Regularly
```bash
# Option A: Rebase (preferred for clean history)
git checkout feature/your-branch
git fetch origin
git rebase origin/develop

# Option B: Merge (preserves history but creates merge commits)
git checkout feature/your-branch
git fetch origin
git merge origin/develop
```

### 7. Handling Rebase Conflicts
```bash
# During rebase, if conflicts occur:
# 1. Check conflict status
git status

# 2. Open and resolve conflicts in each file
# Look for: <<<<<<< HEAD, =======, >>>>>>> 

# 3. After resolving each file
git add resolved-file.js

# 4. Continue rebase
git rebase --continue

# If you need to abort and start over
git rebase --abort
```

---

## Pull Requests

### 8. Before Creating PR
```bash
# Ensure tests pass
npm test
npm run lint

# Update from develop
git fetch origin
git rebase origin/develop

# Clean up commits if needed
git rebase -i origin/develop
```

### 9. Interactive Rebase (Cleaning History)
```bash
# Squash multiple commits into one
git rebase -i HEAD~3  # Last 3 commits

# In the editor:
pick abc1234 First commit message
squash def5678 Second commit (will be squashed into first)
squash ghi9012 Third commit (will be squashed into first)

# Save and edit the combined commit message
```

### 10. Force Push After Rebase
```bash
# Use force-with-lease (safer than --force)
git push --force-with-lease
```

### 11. Creating the PR
- Use descriptive title matching commit convention
- Link to related ticket/issue
- Fill out PR template completely
- Add appropriate reviewers
- Add labels (feature, bug, needs-review, etc.)

---

## Code Review Process

### 12. Responding to Review Comments
```bash
# Make requested changes
# ... edit code ...

# Commit with specific message
git commit -m "fix: address review feedback

- Renamed variable for clarity
- Added error handling for edge case
- Fixed typo in comment"

# Push changes
git push
```

### 13. Handling Requested Changes
```bash
# If major changes requested, consider:

# Option A: Amend last commit (if minor)
git add .
git commit --amend --no-edit
git push --force-with-lease

# Option B: New commit (for substantial changes)
git add .
git commit -m "fix: address review feedback"
git push
```

---

## Merging

### 14. Merge Strategies
```bash
# Squash merge (recommended for feature branches)
# Creates single commit on target branch
git checkout develop
git merge --squash feature/branch
git commit -m "feat: complete feature description"

# Regular merge (preserves all commits)
git checkout develop
git merge feature/branch

# Rebase and merge (linear history)
git checkout feature/branch
git rebase develop
git checkout develop
git merge feature/branch
```

### 15. After Merge
```bash
# Delete merged branch locally
git branch -d feature/TICKET-123

# Delete remote branch
git push origin --delete feature/TICKET-123

# Or delete via GitHub/GitLab UI after merge
```

---

## Undoing Changes

### 16. Unstage Files
```bash
# Unstage specific file
git reset HEAD file.js

# Unstage all
git reset HEAD
```

### 17. Discard Local Changes
```bash
# Discard changes to specific file
git checkout -- file.js

# Discard all changes (careful!)
git checkout -- .

# Or using restore (Git 2.23+)
git restore file.js
git restore .
```

### 18. Undo Commits
```bash
# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Undo last commit and unstage changes
git reset HEAD~1

# Undo last commit and discard changes (careful!)
git reset --hard HEAD~1

# Create a new commit that undoes a specific commit (safe for shared branches)
git revert abc1234
```

### 19. Recover Lost Commits
```bash
# Find lost commits in reflog
git reflog

# Restore to specific point
git reset --hard HEAD@{5}

# Or create branch from lost commit
git branch recovery-branch abc1234
```

---

## Advanced Operations

### 20. Cherry-Pick
```bash
# Apply specific commit to current branch
git cherry-pick abc1234

# Cherry-pick without committing
git cherry-pick -n abc1234
```

### 21. Stashing
```bash
# Save current work temporarily
git stash

# Save with description
git stash push -m "WIP: login feature"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```

### 22. Bisect (Find Bug-Introducing Commit)
```bash
# Start bisect
git bisect start

# Mark current commit as bad
git bisect bad

# Mark known good commit
git bisect good v1.0.0

# Git will checkout commits for you to test
# After testing each, mark as good or bad
git bisect good  # or
git bisect bad

# When found, git shows the first bad commit
# Exit bisect mode
git bisect reset
```

---

## Best Practices

### 23. Commit Frequency
- Commit early, commit often
- Each commit should be atomic (one logical change)
- Commit should not break the build
- Write commit message that explains "why"

### 24. Branch Hygiene
- Keep branches short-lived (< 1 week ideal)
- Sync with upstream frequently
- Delete branches after merging
- Don't commit directly to main/develop

### 25. Never Do These
```bash
# ❌ Force push to shared branches
git push --force origin main

# ❌ Commit sensitive data
git add .env  # Contains secrets!

# ❌ Commit large binary files
git add video.mp4  # Use Git LFS instead

# ❌ Commit node_modules
git add node_modules/  # Use .gitignore
```

---

## Quick Reference

```bash
# Status and logs
git status
git log --oneline -10
git log --graph --oneline --all

# Branches
git branch                    # List local
git branch -r                 # List remote
git branch -a                 # List all
git checkout -b new-branch    # Create and switch
git branch -d branch-name     # Delete local

# Syncing
git fetch origin
git pull origin main
git push origin branch-name

# Comparing
git diff                      # Unstaged changes
git diff --staged             # Staged changes
git diff branch1..branch2     # Between branches
git diff HEAD~3..HEAD         # Last 3 commits

# Cleanup
git gc                        # Garbage collection
git prune                     # Remove unreachable objects
```
