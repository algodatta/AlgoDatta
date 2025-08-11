#!/usr/bin/env python3
import sys, csv, json

# CSV format (header required):
# name,type,ttl,value,priority
# - name: relative or FQDN; if relative, the Route 53 API still accepts it (zone context)
# - type: A, AAAA, CNAME, MX, TXT
# - ttl: integer (ignored for ALIAS; not supported here)
# - value: for MX/TXT/CNAME use standard forms; TXT values should include quotes if they contain spaces
# - priority: only for MX (integer)

def row_to_rrs(row):
    name = row['name'].strip()
    rtype = row['type'].strip().upper()
    ttl = int(row['ttl'].strip()) if row.get('ttl') else 300
    value = row['value'].strip()
    priority = row.get('priority', '').strip()

    if rtype == 'MX':
        if not priority:
            raise ValueError(f"MX record missing priority for name={name}")
        rr = f"{int(priority)} {value}"
        records = [{"Value": rr}]
    elif rtype == 'TXT':
        # Ensure value is quoted for TXT
        v = value
        if not (v.startswith('"') and v.endswith('"')):
            v = json.dumps(value)  # will add quotes and escape as needed
        records = [{"Value": v}]
    else:
        records = [{"Value": value}]

    return {
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": name,
            "Type": rtype,
            "TTL": ttl,
            "ResourceRecords": records
        }
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: r53_import_from_csv.py records.csv", file=sys.stderr)
        sys.exit(1)
    path = sys.argv[1]
    changes = []
    with open(path, newline='', encoding='utf-8') as f:
        rdr = csv.DictReader((row for row in f if not row.lstrip().startswith('#')))
        for row in rdr:
            if not row.get('name') or not row.get('type') or not row.get('value'):
                continue
            changes.append(row_to_rrs(row))
    batch = {"Comment": "Bulk UPSERT by migration kit", "Changes": changes}
    print(json.dumps(batch, indent=2))

if __name__ == "__main__":
    main()
