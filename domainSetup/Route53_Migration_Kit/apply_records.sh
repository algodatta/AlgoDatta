#!/usr/bin/env bash
set -euo pipefail

: "${HOSTED_ZONE_ID:?Set HOSTED_ZONE_ID}"
CSV_FILE="${1:-records_template.csv}"

if [[ ! -f "$CSV_FILE" ]]; then
  echo "CSV file not found: $CSV_FILE"; exit 1
fi

TMP_JSON=$(mktemp)
python3 r53_import_from_csv.py "$CSV_FILE" > "$TMP_JSON"

echo "Applying changes from $CSV_FILE to hosted zone $HOSTED_ZONE_ID ..."
aws route53 change-resource-record-sets   --hosted-zone-id "$HOSTED_ZONE_ID"   --change-batch "file://$TMP_JSON"

echo "Submitted change batch. Route 53 may take a minute to propagate locally."
