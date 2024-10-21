
set -ex

echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc
echo "@odmd-seed:registry=https://npm.pkg.github.com/" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=$github_token" >> .npmrc

ls -ltarh
cat .npmrc

npm install