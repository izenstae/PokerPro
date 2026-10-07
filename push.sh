#!/usr/bin/env sh
# Rebuilds, runs every test suite, commits everything here and pushes the current branch to
# github.com/izenstae/SkillBuilder. Pushing main deploys to GitHub Pages through the workflow.
# Run from inside this folder. Needs you to be authenticated with GitHub.
set -e

node build.js
npm test
git add -A
git commit -m "${1:-Update Skill Builder}"
branch=$(git branch --show-current)
git push -u origin "$branch"

echo ""
echo "Pushed $branch. On main, the workflow builds, tests and publishes to:"
echo "  https://izenstae.github.io/SkillBuilder/"
