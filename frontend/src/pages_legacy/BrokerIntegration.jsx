import { useEffect, useState } from "react";
import { api, authHeaders } from '../lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BrokerIntegration() {
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [status, setStatus] = useState("Checking...");
  const [account, setAccount] = useState(null);

  const fetchAccountInfo = async () => {
    try {
      const res = await api.get("/api/broker/account-info");
      setAccount(res.data);
      setStatus("Connected ✅");
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      setAccount(null);
      setStatus("Not Connected ❌");
    }
  };

  useEffect(() => {
    fetchAccountInfo(); // Initial fetch
    const interval = setInterval(fetchAccountInfo, 30000); // Refresh every 30s
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const handleConnect = async () => {
    try {
      await api.post("/api/broker/connect", {
        clientId,
        apiKey,
        apiSecret,
      });
      await fetchAccountInfo(); // Refresh immediately after connect
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus("Failed to Connect ❌");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">DhanHQ Broker Integration</h2>
          <Input placeholder="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <Input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Input placeholder="API Secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
          <Button onClick={handleConnect}>Connect to Dhan</Button>
          <div>Status: <strong>{status}</strong></div>
          {account && (
            <div className="mt-4 p-4 bg-gray-100 rounded shadow text-sm space-y-1">
              <div><strong>Client ID:</strong> {account.clientId}</div>
              <div><strong>Name:</strong> {account.clientName}</div>
              <div><strong>Email:</strong> {account.email}</div>
              <div><strong>Balance:</strong> ₹{account.availableBalance}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
