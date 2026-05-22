#!/bin/bash

WEBSITES_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 983458256550.dkr.ecr.us-west-2.amazonaws.com
DOCKER_BUILDKIT=1 NEXT_TELEMETRY_DISABLED=1 docker build --no-cache -t stuporbowl/stuporbowlwww "$WEBSITES_ROOT"
docker tag stuporbowl/stuporbowlwww:latest 983458256550.dkr.ecr.us-west-2.amazonaws.com/stuporbowl/stuporbowlwww:latest
docker push 983458256550.dkr.ecr.us-west-2.amazonaws.com/stuporbowl/stuporbowlwww:latest