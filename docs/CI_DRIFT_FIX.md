# CI Drift Fix Guide

**Problem**: The failing job is caused by uncommitted changes detected in `README.md` or `skills_index.json` after the update scripts run.

**Error**:

```
❌ Detected uncommitted changes in README.md or skills_index.json. Please run scripts locally and commit.
```

**Cause**:
Scripts like `scripts/generate_index.py` and `scripts/update_readme.py` modify `README.md` and `skills_index.json`, but the workflow expects these files to have no changes after the scripts are run. Any differences mean the committed repo is out-of-sync with what the generation scripts produce.

**How to Fix (DO THIS EVERY TIME):**

1. Run the scripts locally to regenerate README.md and skills_index.json:

   ```bash
   python3 scripts/generate_index.py
   python3 scripts/update_readme.py
   ```

2. Check for changes:

   ```bash
   git status
   git diff
   ```

3. Commit and push any updates:
   ```bash
   git add README.md skills_index.json
   git commit -m "Update README and skills index to resolve CI drift"
   git push
   ```

**Summary**:
Always commit and push all changes produced by the registry or readme update scripts. This keeps the CI workflow passing by ensuring the repository and generated files are synced.
