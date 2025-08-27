#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./merge_algodatta_tar_into_repo.sh /path/to/local/AlgoDatta_repo /path/to/optimized_tar_tree
#
# Example:
#   ./merge_algodatta_tar_into_repo.sh ~/work/AlgoDatta /tmp/algo_tar_optimized

REPO_DIR="${1:-}"
OPT_DIR="${2:-}"

if [[ -z "${REPO_DIR}" || -z "${OPT_DIR}" ]]; then
  echo "Usage: $0 <repo_dir> <optimized_tree_dir>"
  exit 1
fi

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Error: $REPO_DIR is not a git repository."
  exit 2
fi

branch="merge-algodatta-tar-$(date +%Y%m%d_%H%M%S)"
cd "$REPO_DIR"
git checkout -b "$branch"

# Dry-run preview
echo "===== DRY RUN (preview) ====="
rsync -av --dry-run   --exclude '.git/'   --exclude 'node_modules/' --exclude '**/node_modules/'   --exclude '.next/'   --exclude '__pycache__/'   --exclude 'venv/' --exclude '.venv/'   --exclude '.env' --exclude '.env.*'   --exclude 'dist/' --exclude 'build/'   "$OPT_DIR"/ "$REPO_DIR"/

read -p "Proceed with merge? (y/N) " ans
if [[ "${ans,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

# Real merge
rsync -av   --exclude '.git/'   --exclude 'node_modules/' --exclude '**/node_modules/'   --exclude '.next/'   --exclude '__pycache__/'   --exclude 'venv/' --exclude '.venv/'   --exclude '.env' --exclude '.env.*'   --exclude 'dist/' --exclude 'build/'   "$OPT_DIR"/ "$REPO_DIR"/

# Optional: run Next.js conflict fixer if present
if [[ -f "$REPO_DIR/tools/fix_next_conflicts.sh" ]]; then
  bash "$REPO_DIR/tools/fix_next_conflicts.sh" "$REPO_DIR"
fi

git add -A
git commit -m "Merge optimized tarball contents into repo (via merge kit)"
echo "Done. You are on branch: $branch"
