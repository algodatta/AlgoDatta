# Move DNS from Hostinger to Route 53 — Kit

This kit helps you:
1) Create a **public hosted zone** for your domain in Route 53.
2) **Import** your existing DNS records (from a CSV you fill).
3) **Switch nameservers** at Hostinger to Route 53.
4) Add **SES** records automatically (run the `ses_bootstrap.sh` you already have).

> Tip: To minimize downtime, reduce TTLs for critical records at Hostinger to **300** at least 30 minutes before nameserver switch.

---

## 0) Requirements
- AWS CLI v2 and `jq` installed; authenticated to the right AWS account.
- Your domain: `algodatta.com`.
- Region: we’ll use `ap-south-1` for SES; Route 53 is global.

## 1) Create the hosted zone
```bash
chmod +x create_zone.sh
AWS_PROFILE=default AWS_REGION=ap-south-1 ROOT_DOMAIN=algodatta.com ./create_zone.sh
# Output includes: HOSTED_ZONE_ID and the four NS values.
```

## 2) Fill your records
Open **records_template.csv** and fill in all **non-SES** records you currently have in Hostinger (A, AAAA, CNAME, MX, TXT, etc.).
- Keep one row per record **value** (for MX and TXT with multiple values, put them as separate rows with the same name/type).
- Examples are included and commented out with `#` in the first column; delete the `#` to enable or remove unwanted rows.
- Leave SES (DKIM/MAIL FROM/DMARC) out — the `ses_bootstrap.sh` will add those automatically.

## 3) Import records into Route 53
```bash
chmod +x apply_records.sh
AWS_PROFILE=default HOSTED_ZONE_ID=ZXXXXXXXXXXXXX ./apply_records.sh records_template.csv
```
This builds a Route 53 **ChangeBatch** from your CSV and applies it.

## 4) Switch nameservers at Hostinger
In Hostinger hPanel → **Domains → DNS / Nameservers**:
- Choose **Use custom nameservers**
- Enter the **four NS** printed by step 1 (from `create_zone.sh`).
- Save and wait for DNS propagation (usually minutes to a few hours).

Verify delegation:
```bash
# Replace with your actual hosted zone NS outputs
dig NS algodatta.com +short
# Should match the NS returned by get-hosted-zone
aws route53 get-hosted-zone --id $HOSTED_ZONE_ID --query 'DelegationSet.NameServers'
```

## 5) Add SES records
Run the SES bootstrap (DKIM, custom MAIL FROM, DMARC, Config Set, SNS):
```bash
chmod +x ../ses_bootstrap.sh
ROOT_DOMAIN=algodatta.com HOSTED_ZONE_ID=$HOSTED_ZONE_ID AWS_REGION=ap-south-1 MAIL_FROM_SUBDOMAIN=mail CONFIG_SET_NAME=algodatta-config WEBHOOK_HTTPS_ENDPOINT="https://api.algodatta.com/api/notifications/ses-sns" ../ses_bootstrap.sh
```

## 6) Final checks
- DKIM status:
  ```bash
  aws sesv2 get-email-identity --region ap-south-1 --email-identity algodatta.com     --query '[DkimAttributes.Status, VerifiedForSendingStatus]'
  ```
- Your app’s env:
  ```
  AWS_REGION=ap-south-1
  SES_FROM_EMAIL=no-reply@algodatta.com
  SES_CONFIG_SET_NAME=algodatta-config
  ```
- Send a test registration email; try SES Mailbox Simulator too.
