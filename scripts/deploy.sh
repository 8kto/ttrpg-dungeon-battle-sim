#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.development.local ]; then
  export $(grep -v '^#' .env.development.local | xargs)
else
  echo "No .env.development.local found"
  exit 1
fi

# Now you can use the environment variables in your script
echo "DEPLOY_SSH_PORT: $DEPLOY_SSH_PORT"
echo "DEPLOY_SSH_HOST: $DEPLOY_SSH_HOST"

# Get the current git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_TIMESTAMP=$(date +%s)

# Check if current branch is 'main'
if [ "$CURRENT_BRANCH" != "main" ]; then
    DEPLOY_SSH_HOST=$DEPLOY_SSH_HOST/beta
fi

mkdir -p /tmp/snw-to-be-deployed
cp -r src/* /tmp/snw-to-be-deployed

# Find all HTML files in /tmp/snw-to-be-deployed and replace $VERSION$ with current timestamp
find /tmp/snw-to-be-deployed \( -name '*.html' -or -name '*.js' \) -exec sed -i "s/\$VERSION\\$/$CURRENT_TIMESTAMP/g" {} +

# Deploy to remote server
echo scp -P $DEPLOY_SSH_PORT -r /tmp/snw-to-be-deployed/* $DEPLOY_SSH_HOST
