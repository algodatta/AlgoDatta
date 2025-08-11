#!/usr/bin/env bash
set -euo pipefail

# ---------- CONFIG ----------
: "${AWS_REGION:=ap-south-1}"                              # e.g. ap-south-1
: "${ROOT_DOMAIN:?Set ROOT_DOMAIN (e.g. example.com)}"     # your root domain (must exist in Route53 hosted zone below)
: "${HOSTED_ZONE_ID:?Set HOSTED_ZONE_ID}"                  # Route53 Hosted Zone ID for ROOT_DOMAIN
: "${MAIL_FROM_SUBDOMAIN:=mail}"                           # subdomain for custom MAIL FROM (mail.<root>)
: "${CONFIG_SET_NAME:=algodatta-config}"                   # SES Configuration Set name
: "${DMARC_RUA:=dmarc@${ROOT_DOMAIN}}"                     # where aggregate DMARC reports go
: "${WEBHOOK_HTTPS_ENDPOINT:=}"                            # e.g. https://api.example.com/api/notifications/ses-sns (optional; can be added later)

# ---------- PRECHECKS ----------
need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' not found."; exit 1; }; }
need aws
need jq

echo "Region:           $AWS_REGION"
echo "Root domain:      $ROOT_DOMAIN (zone: $HOSTED_ZONE_ID)"
echo "MAIL FROM sub:    $MAIL_FROM_SUBDOMAIN.$ROOT_DOMAIN"
echo "Config set:       $CONFIG_SET_NAME"
echo "DMARC rua:        $DMARC_RUA"
echo "Webhook endpoint: ${WEBHOOK_HTTPS_ENDPOINT:-<none>}"

# ---------- HELPERS ----------
UPSERT_R53() {
  local NAME="$1" TYPE="$2" TTL="$3" VALUE="$4"
  cat > /tmp/r53.json <<JSON
{
  "Comment": "UPSERT by AlgoDatta SES bootstrap",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "$NAME",
      "Type": "$TYPE",
      "TTL": $TTL,
      "ResourceRecords": [ { "Value": "$VALUE" } ]
    }
  }]
}
JSON
  aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch file:///tmp/r53.json >/dev/null
  echo "UPSERT $TYPE $NAME -> $VALUE"
}

# ---------- 1) EMAIL IDENTITY (Easy DKIM) ----------
set +e
aws sesv2 get-email-identity --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN" >/dev/null 2>&1
exists=$?
set -e

if [[ $exists -ne 0 ]]; then
  echo "Creating SES email identity for $ROOT_DOMAIN ..."
  aws sesv2 create-email-identity \
    --region "$AWS_REGION" \
    --email-identity "$ROOT_DOMAIN" \
else
  echo "SES identity already exists for $ROOT_DOMAIN."
fi

# fetch DKIM tokens
echo "Fetching DKIM tokens..."
IDENT_JSON=$(aws sesv2 get-email-identity --region "$AWS_REGION" --email-identity "$ROOT_DOMAIN")
TOKENS=$(echo "$IDENT_JSON" | jq -r '.DkimAttributes.Tokens[]')
if [[ -z "$TOKENS" ]]; then
  echo "No DKIM tokens present (SES may still be provisioning). Try again in a few minutes."; exit 1
fi

# Create DKIM CNAMEs
for t in $TOKENS; do
  NAME="${t}._domainkey.${ROOT_DOMAIN}."
  VALUE="${t}.dkim.amazonses.com."
  UPSERT_R53 "$NAME" "CNAME" 300 "$VALUE"
done

# ---------- 2) CUSTOM MAIL FROM + SPF (at mail.<root>) ----------
MAIL_FROM_FQDN="${MAIL_FROM_SUBDOMAIN}.${ROOT_DOMAIN}"
echo "Configuring custom MAIL FROM: $MAIL_FROM_FQDN"

aws sesv2 put-email-identity-mail-from-attributes \
  --region "$AWS_REGION" \
  --email-identity "$ROOT_DOMAIN" \
  --mail-from-domain "$MAIL_FROM_FQDN" \
  --behavior-on-mx-failure UseDefaultValue >/dev/null || true

UPSERT_R53 "${MAIL_FROM_FQDN}." "MX" 300 "10 feedback-smtp.${AWS_REGION}.amazonses.com."
UPSERT_R53 "${MAIL_FROM_FQDN}." "TXT" 300 "\"v=spf1 include:amazonses.com -all\""

# ---------- 3) DMARC (at _dmarc.<root>) ----------
UPSERT_R53 "_dmarc.${ROOT_DOMAIN}." "TXT" 300 "\"v=DMARC1; p=quarantine; rua=mailto:${DMARC_RUA}; fo=1\""

# ---------- 4) CONFIGURATION SET + SNS ----------
set +e
aws sesv2 create-configuration-set \
  --region "$AWS_REGION" \
  --configuration-set-name "$CONFIG_SET_NAME" >/dev/null 2>&1
if [[ $? -eq 0 ]]; then
  echo "Created config set: $CONFIG_SET_NAME"
else
  echo "Config set exists or create failed (continuing): $CONFIG_SET_NAME"
fi
set -e

# SNS topics
BOUNCE_ARN=$(aws sns create-topic --name "${CONFIG_SET_NAME}-bounces" --query TopicArn --output text)
COMPLAINT_ARN=$(aws sns create-topic --name "${CONFIG_SET_NAME}-complaints" --query TopicArn --output text)
echo "SNS bounce topic:     $BOUNCE_ARN"
echo "SNS complaint topic:  $COMPLAINT_ARN"

# Event destinations (create or update idempotently)
mk_event() {
  local NAME="$1" TOPIC="$2" TYPE="$3"
  cat > /tmp/event.json <<JSON
{
  "EventDestinationName": "$NAME",
  "Enabled": true,
  "MatchingEventTypes": ["$TYPE"],
  "SnsDestination": { "TopicArn": "$TOPIC" }
}
JSON

  if aws sesv2 create-configuration-set-event-destination \
      --region "$AWS_REGION" \
      --configuration-set-name "$CONFIG_SET_NAME" \
      --event-destination file:///tmp/event.json >/dev/null 2>&1; then
    echo "Created event destination: $NAME ($TYPE)"
  else
    aws sesv2 update-configuration-set-event-destination \
      --region "$AWS_REGION" \
      --configuration-set-name "$CONFIG_SET_NAME" \
      --event-destination-name "$NAME" \
      --event-destination file:///tmp/event.json >/dev/null
    echo "Updated event destination: $NAME ($TYPE)"
  fi
}

mk_event "to-sns-bounce" "$BOUNCE_ARN" "BOUNCE"
mk_event "to-sns-complaint" "$COMPLAINT_ARN" "COMPLAINT"

# Subscriptions (optional now; can be done later)
if [[ -n "${WEBHOOK_HTTPS_ENDPOINT}" ]]; then
  aws sns subscribe --topic-arn "$BOUNCE_ARN" --protocol https --notification-endpoint "$WEBHOOK_HTTPS_ENDPOINT" >/dev/null || true
  aws sns subscribe --topic-arn "$COMPLAINT_ARN" --protocol https --notification-endpoint "$WEBHOOK_HTTPS_ENDPOINT" >/dev/null || true
  echo "Subscribed webhook endpoint to SNS topics (check for SubscriptionConfirmation logs)."
fi

# ---------- 5) ATTACH CONFIG SET TO IDENTITY ----------
aws sesv2 put-email-identity-configuration-set-attributes \
  --region "$AWS_REGION" \
  --email-identity "$ROOT_DOMAIN" \
  --configuration-set-name "$CONFIG_SET_NAME" >/dev/null || true
echo "Attached config set '$CONFIG_SET_NAME' to identity '$ROOT_DOMAIN'."

# ---------- SUMMARY ----------
cat <<EOF

✅ SES bootstrap complete (initial DNS may take time to propagate).

Next steps:
1) Wait for DKIM to show as 'SUCCESS' on the identity:
   aws sesv2 get-email-identity --region $AWS_REGION --email-identity $ROOT_DOMAIN | jq '.DkimAttributes.SigningAttributesOrigin, .DkimAttributes.Status'
2) If SES account is still in *sandbox*, request production access in the console.
3) Configure your app (backend/.env):
   AWS_REGION=$AWS_REGION
   SES_FROM_EMAIL=no-reply@$ROOT_DOMAIN
   SES_CONFIG_SET_NAME=$CONFIG_SET_NAME
4) Test with SES Mailbox Simulator:
   - success@simulator.amazonses.com (deliver)
   - bounce@simulator.amazonses.com (bounce → suppression)
   - complaint@simulator.amazonses.com (complaint → suppression)

EOF
