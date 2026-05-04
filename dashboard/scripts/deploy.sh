#!/bin/bash
set -e

# Build the project
cd "$(dirname "$0")/.."
npm run build

# Deploy to gh-pages branch
cd ..

# Create a temp directory
TMP_DIR=$(mktemp -d)
cp -r dashboard/dist/* "$TMP_DIR/"

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git branch -D gh-pages
fi

# Create orphan branch
git checkout --orphan gh-pages

# Remove all tracked and untracked files
git rm -rf .
git clean -fdx

# Copy dist contents
cp -r "$TMP_DIR"/* .

# Add and commit
git add .
git commit -m "Deploy dashboard to GitHub Pages"

# Push to remote
git push origin gh-pages --force

# Go back to main
git checkout main

# Cleanup
rm -rf "$TMP_DIR"

echo "Deployed to https://avanish-gupta-cse.github.io/weightloss-coach-journal/"
