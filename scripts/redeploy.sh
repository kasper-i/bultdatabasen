#!/bin/bash -e
ARTIFACT_URL=$1
ARCHIVE_URL=$(curl -s $ARTIFACT_URL | jq -r '.artifacts[0].archive_download_url')
URL=$(curl -sI -H "Authorization: token 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" $ARCHIVE_URL | awk 'BEGIN {FS=": "}/^location/{print $2}')
wget "$URL" -qO /tmp/artifact.zip
DEB=$(zipinfo -1 /tmp/artifact.zip)
unzip -oq /tmp/artifact.zip -d /tmp
dpkg -i --force-confdef --force-confold "/tmp/$DEB"
rm /tmp/artifact.zip "/tmp/$DEB"
systemctl daemon-reload
systemctl restart bultdatabasen