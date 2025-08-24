import FeatureGrid from '../../components/FeatureGrid';

export default function DashboardPage() {
  return (
    <>
      <h1 className="header-title">Dashboard</h1>
      <p className="description">Quick access to platform features</p>
      <FeatureGrid />
    </>
  );
}
