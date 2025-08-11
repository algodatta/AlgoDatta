#!/usr/bin/env bash
set -euo pipefail

: "${ROOT_DOMAIN:?Set ROOT_DOMAIN (e.g. algodatta.com)}"

# Create (or find) a public hosted zone
HZ_ID=$(aws route53 list-hosted-zones-by-name   --dns-name "$ROOT_DOMAIN"   --query 'HostedZones[?Name==`'"$ROOT_DOMAIN"'.` && PrivateZone==`false`][0].Id'   --output text 2>/dev/null | sed 's|/hostedzone/||' || true)

if [[ -z "${HZ_ID}" || "${HZ_ID}" == "None" ]]; then
  echo "Creating new public hosted zone for $ROOT_DOMAIN ..."
  HZ_ID=$(aws route53 create-hosted-zone     --name "$ROOT_DOMAIN"     --caller-reference "migrate-$(date +%s)"     --hosted-zone-config Comment="Public hosted zone for $ROOT_DOMAIN",PrivateZone=false     --query 'HostedZone.Id' --output text | sed 's|/hostedzone/||')
else
  echo "Using existing public hosted zone for $ROOT_DOMAIN"
fi

echo "HOSTED_ZONE_ID=$HZ_ID"

echo "Name servers for $ROOT_DOMAIN:"
aws route53 get-hosted-zone --id "$HZ_ID" --query 'DelegationSet.NameServers'

echo "Note: Set these four NS at your registrar (Hostinger) for $ROOT_DOMAIN."
