set -ex

echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc
echo "@odmd-seed:registry=https://npm.pkg.github.com/" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=$github_token" >> .npmrc

ls -ltarh
cat .npmrc

npm install

PKG_NAME=$(jq -r '.name' package.json) && test "$PKG_NAME" != $ODMD_contractsLibPkgName || echo $PKG_NAME is good

npm run test && npm publish
git config user.name $GITHUB_RUN_ID
git config user.email "odmd_wfl@ondemandenv.dev"
PKG_VER=$(jq -r '.version' package.json)

git tag "v$PKG_VER" && git tag "latest" -m "odmd" && git push origin --tags --force

#${producer Id}.txt this is contract lib enver's single producer ...
echo "$GITHUB_SHA,$PKG_NAME,$PKG_VER" > "$RUNNER_TEMP/contractsLibLatest.txt"

npm dist-tag add $PKG_NAME@$PKG_VER $GITHUB_SHA --registry=https://npm.pkg.github.com

#c5