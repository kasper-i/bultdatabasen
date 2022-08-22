#!/bin/bash -e

# Access tokens require repo scope for private repositories and public_repo scope for public repositories.
ACCESS_TOKEN="ghp_"

ARTIFACT_URL=$1
ARCHIVE_URL=$(curl -s $ARTIFACT_URL | jq -r '.artifacts[0].archive_download_url')
URL=$(curl -sI -H "Authorization: token $ACCESS_TOKEN" $ARCHIVE_URL | awk 'BEGIN {FS=": "}/^location/{print $2}')
wget "$URL" -qO /tmp/artifact.zip
DEB=$(zipinfo -1 /tmp/artifact.zip)
unzip -oq /tmp/artifact.zip -d /tmp
apt install "/tmp/$DEB"
rm /tmp/artifact.zip "/tmp/$DEB"
systemctl daemon-reload
systemctl restart bultdatabasen