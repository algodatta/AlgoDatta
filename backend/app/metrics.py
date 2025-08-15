from prometheus_client import Counter, Histogram

webhook_requests = Counter(
    "algodatta_webhook_requests_total",
    "Total webhook requests received",
    ["strategy_id"]
)
webhook_deduped = Counter(
    "algodatta_webhook_deduped_total",
    "Total webhook requests deduplicated",
    ["strategy_id"]
)
executions_total = Counter(
    "algodatta_executions_total",
    "Executions by status",
    ["status"]
)
execution_latency = Histogram(
    "algodatta_execution_seconds",
    "Time spent executing a signal",
    buckets=(0.05,0.1,0.2,0.5,1,2,5,10)
)
