#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
# echo 'froglu.top' > CNAME

git init
git add -A

git commit -m ":frog: deploy $(date +%Y/%m/%d)"

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:FrogLu/FrogLu.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

# 如果使用 travis 持续集成
git push -f https://${access_token}@github.com/FrogLu/FrogLu.github.io.git master
cd -