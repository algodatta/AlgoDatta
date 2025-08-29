Nginx Upstream Fix (api.algodatta.com -> 127.0.0.1:18080)
=========================================================

This script updates your nginx server block for api.algodatta.com to proxy
to the backend that is listening on localhost:18080 (as per your compose).

Usage (on the server):
----------------------
sudo bash scripts/apply_nginx_api_fix.sh api.algodatta.com 18080

Then validate:
  curl -i https://api.algodatta.com/healthz   # should return 200
