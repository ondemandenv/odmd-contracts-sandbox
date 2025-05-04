set -x

echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=$github_token" >> .npmrc

ls -ltarh
cat .npmrc

npm install

PKG_NAME=$(jq -r '.name' package.json) && test "$PKG_NAME" != $ODMD_contractsLibPkgName || echo $PKG_NAME is good

#npm run test

# >>>>
PUBLISH_LOG=$(mktemp)

# Attempt to publish, teeing output to the log file AND stdout/stderr
# Note: The exit status of the pipeline is the exit status of the last command (tee),
# but PIPESTATUS[0] will hold the exit status of npm publish.
echo "Attempting to publish package..."
npm publish 2>&1 | tee "$PUBLISH_LOG"

# Capture the exit status of the 'npm publish' command (the first command in the pipe)
publish_status=${PIPESTATUS[0]}

# Check if npm publish failed (non-zero exit status)
if [ "$publish_status" -ne 0 ]; then
  # It failed. Now check if it was the E409 error.
  if grep -q "npm error code E409" "$PUBLISH_LOG"; then
    # It was the E409 error. Print a message and allow the script to continue.
    echo "INFO: npm publish failed with E409 (Conflict - version already exists). Ignoring error as requested."
    # Optional: Output the log content for information
    # cat "$PUBLISH_LOG"
  else
    # It was a different error. Print the log and exit with the original error code.
    echo "ERROR: npm publish failed with a non-E409 error (Exit Code: $publish_status):" >&2
    cat "$PUBLISH_LOG" >&2
    rm "$PUBLISH_LOG" # Clean up log file
    exit "$publish_status" # Exit the script with the actual error code
  fi
else
  # npm publish was successful (exit code 0)
  echo "INFO: npm publish successful."
  # Optional: Output the log content for information
  # cat "$PUBLISH_LOG"
fi

# Clean up the temporary log file if we haven't exited
rm "$PUBLISH_LOG"
# <<<<


git config user.name $GITHUB_RUN_ID
git config user.email "odmd_wfl@ondemandenv.dev"
PKG_VER=$(jq -r '.version' package.json)

git tag "v$PKG_VER" && git tag "latest" -m "odmd" && git push origin --tags --force

#${producer Id}.txt this is contract lib enver's single producer ...
#node_modules/@ondemandenv/contracts-lib-base/lib/repos/__contracts/odmd-build-contracts-lib.js
echo "$GITHUB_SHA,$PKG_NAME,$PKG_VER" > "$RUNNER_TEMP/contractsLibLatest.txt"

npm dist-tag add $PKG_NAME@$PKG_VER $GITHUB_SHA --registry=https://npm.pkg.github.com
