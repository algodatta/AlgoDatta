import BrokerConnect from '@/components/BrokerConnect';

export const metadata = { title: 'Broker • AlgoDatta' };

export default function BrokerPage() {
  return (
    <div className="section">
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:12}}>
        <h1 style={{fontSize:22,fontWeight:600,margin:'16px 0'}}>Broker</h1>
        <span style={{color:'#6b7280'}}>Manage broker connection</span>
      </div>
      <BrokerConnect />
    </div>
  );
}
