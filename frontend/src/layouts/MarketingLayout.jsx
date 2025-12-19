import { Outlet } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';
import { Footer } from '../components/Footer';

export function MarketingLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
