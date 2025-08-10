#!/usr/bin/env python3
import argparse, dns.resolver
def fetch_txt(n): 
    try: return [''.join([p.decode() for p in r.strings]) for r in dns.resolver.resolve(n,'TXT')]
    except Exception: return []
def main():
    p=argparse.ArgumentParser(); p.add_argument('--domain',required=True); p.add_argument('--mail-from',default=''); args=p.parse_args()
    print('SPF on', args.mail_from or args.domain, fetch_txt(args.mail_from or args.domain))
    print('DMARC', fetch_txt(f"_dmarc.{args.domain}"))
if __name__=='__main__': main()
