#!/usr/bin/env bash
set -euo pipefail

aws_cmd() {
  if command -v aws >/dev/null 2>&1; then
    aws "$@"
  elif [ -x "/c/Program Files/Amazon/AWSCLIV2/aws.exe" ]; then
    "/c/Program Files/Amazon/AWSCLIV2/aws.exe" "$@"
  elif [ -x "/c/Program Files (x86)/Amazon/AWSCLIV2/aws.exe" ]; then
    "/c/Program Files (x86)/Amazon/AWSCLIV2/aws.exe" "$@"
  else
    echo "ERROR: AWS CLI v2 not found." >&2; exit 1
  fi
}

: "${AWS_REGION:=ap-south-1}"
: "${ROOT_DOMAIN:?Set ROOT_DOMAIN (e.g. algodatta.com)}"
: "${HOSTED_ZONE_ID:?Set HOSTED_ZONE_ID}"
: "${MAIL_FROM_SUBDOMAIN:=mail}"
: "${CONFIG_SET_NAME:=algodatta-config}"
: "${DMARC_RUA:=dmarc@${ROOT_DOMAIN}}"
: "${WEBHOOK_HTTPS_ENDPOINT:=}"

UPSERT_R53() {
  local NAME="$1" TYPE="$2" TTL="$3" VALUE="$4"
  local RRVAL
  if [ "$TYPE" = "TXT" ]; then
    RRVAL=\"$VALUE\"
  else
    RRVAL=$VALUE
  fi
  local CHANGE
  CHANGE=$(cat <<JSON
{"Comment":"UPSERT by SES bootstrap","Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":"$NAME","Type":"$TYPE","TTL":$TTL,"ResourceRecords":[{"Value":"$RRVAL"}]}}]}
JSON
)
  aws_cmd route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "$CHANGE" >/dev/null
  echo "UPSERT $TYPE $NAME -> $VALUE"
}

# Ensure identity (no DKIM flags)
if ! aws_cmd sesv2 get-email-identity --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" >/dev/null 2>&1; then
  aws_cmd sesv2 create-email-identity --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" >/dev/null
fi

TOKENS=$(aws_cmd sesv2 get-email-identity --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" --query 'DkimAttributes.Tokens[]' --output text || true)
if [[ -z "${TOKENS:-}" ]]; then
  echo "No DKIM tokens yet. Re-run later." >&2; exit 1
fi

for t in $TOKENS; do
  UPSERT_R53 "${t}._domainkey.${ROOT_DOMAIN}." "CNAME" 300 "${t}.dkim.amazonses.com."
done

aws_cmd sesv2 put-email-identity-mail-from-attributes --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" --mail-from-domain "${MAIL_FROM_SUBDOMAIN}.${ROOT_DOMAIN}" --behavior-on-mx-failure USE_DEFAULT_VALUE >/dev/null || true
UPSERT_R53 "${MAIL_FROM_SUBDOMAIN}.${ROOT_DOMAIN}." "MX" 300 "10 feedback-smtp.${AWS_REGION}.amazonses.com."
UPSERT_R53 "${MAIL_FROM_SUBDOMAIN}.${ROOT_DOMAIN}." "TXT" 300 "v=spf1 include:amazonses.com -all"

UPSERT_R53 "_dmarc.${ROOT_DOMAIN}." "TXT" 300 "v=DMARC1; p=quarantine; rua=mailto:${DMARC_RUA}; fo=1"

aws_cmd sesv2 create-configuration-set --region "$AWS_REGION" --configuration-set-name "$CONFIG_SET_NAME" >/dev/null 2>&1 || true
BOUNCE_ARN=$(aws_cmd sns create-topic --name "${CONFIG_SET_NAME}-bounces" --query TopicArn --output text)
COMPLAINT_ARN=$(aws_cmd sns create-topic --name "${CONFIG_SET_NAME}-complaints" --query TopicArn --output text)

aws_cmd sesv2 create-configuration-set-event-destination --region "$AWS_REGION" --configuration-set-name "$CONFIG_SET_NAME" --event-destination-name to-sns-bounce --event-destination '{"Enabled":true,"MatchingEventTypes":["BOUNCE"],"SnsDestination":{"TopicArn":"'"$BOUNCE_ARN"'"}}' >/dev/null 2>&1 || aws_cmd sesv2 update-configuration-set-event-destination --region "$AWS_REGION" --configuration-set-name "$CONFIG_SET_NAME" --event-destination-name to-sns-bounce --event-destination '{"Enabled":true,"MatchingEventTypes":["BOUNCE"],"SnsDestination":{"TopicArn":"'"$BOUNCE_ARN"'"}}' >/dev/null

aws_cmd sesv2 create-configuration-set-event-destination --region "$AWS_REGION" --configuration-set-name "$CONFIG_SET_NAME" --event-destination-name to-sns-complaint --event-destination '{"Enabled":true,"MatchingEventTypes":["COMPLAINT"],"SnsDestination":{"TopicArn":"'"$COMPLAINT_ARN"'"}}' >/dev/null 2>&1 || aws_cmd sesv2 update-configuration-set-event-destination --region "$AWS_REGION" --configuration-set-name "$CONFIG_SET_NAME" --event-destination-name to-sns-complaint --event-destination '{"Enabled":true,"MatchingEventTypes":["COMPLAINT"],"SnsDestination":{"TopicArn":"'"$COMPLAINT_ARN"'"}}' >/dev/null

aws_cmd sesv2 put-email-identity-configuration-set-attributes --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" --configuration-set-name "$CONFIG_SET_NAME" >/dev/null || true

echo "Done. Check DKIM later: aws sesv2 get-email-identity --region $AWS_REGION --email-identity $ROOT_DOMAIN --query '[DkimAttributes.Status, VerifiedForSendingStatus]'"
