import FeatureGrid from '../components/FeatureGrid';

export default function HomePage() {
  return (
    <>
      <h1 className="header-title">Welcome to AlgoDatta</h1>
      <p className="description">Choose a section to get started.</p>
      <FeatureGrid />
    </>
  );
}
