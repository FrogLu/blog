#!/usr/bin/env sh

# abort on errors
set -e

# build
sudo npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A

git commit -m 'Add ga ID in config.js'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:FrogLu/FrogLu.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

# 如果使用 travis 持续集成
# git push -f https://53df9af28eac1a700dec4fb4d9c336a7edc8074f@github.com/FrogLu/FrogLu.github.io.git master
cd -