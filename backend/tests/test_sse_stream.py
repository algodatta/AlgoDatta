def test_sse_endpoint_headers(client):
    r = client.get("/api/executions/stream")
    assert r.status_code == 200
    assert r.headers.get("content-type","").startswith("text/event-stream")