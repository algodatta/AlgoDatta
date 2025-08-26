import dynamic from 'next/dynamic';
const BrokerConnect = dynamic(() => import('@/components/BrokerConnect'), { ssr:false });
export default function Page(){ return <div className="grid"><div className="card"><h2 style={{fontSize:20,fontWeight:700}}>Broker</h2><p>Connect your broker account.</p></div><BrokerConnect/></div>; }
