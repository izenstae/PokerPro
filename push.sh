#!/usr/bin/env sh
# Commits everything here and pushes it to github.com/izenstae/PokerPro.
# Run from inside this folder. Needs you to be authenticated with GitHub.
set -e

git add -A
git commit -m "Poker trainer: six layers, 27 lessons, 23 drills, Kuhn and Leduc CFR"
git branch -M main
git push -u origin main

echo ""
echo "Pushed. Now turn on Pages:"
echo "  https://github.com/izenstae/PokerPro/settings/pages"
echo "  Source: Deploy from a branch -> main -> / (root) -> Save"
echo ""
echo "It will be live in about a minute at:"
echo "  https://izenstae.github.io/PokerPro/"
