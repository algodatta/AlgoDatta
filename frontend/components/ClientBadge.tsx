import React from 'react';
import { api, authHeaders } from '../lib/api';

export default function ClientBadge(){
  const [cid, setCid] = React.useState<string>('');
  React.useEffect(()=>{
    (async()=>{
      try{
        const res = await api.get('/api/notifications', { headers: authHeaders() });
        const items = (res.data || res) as any[];
        const id = items.find(i=>i.broker_client_id)?.broker_client_id || items[0]?.broker_client_id || '';
        setCid(id || '');
      }catch{}
    })();
  }, []);
  if(!cid) return null;
  return <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Client: {cid}</span>;
}
