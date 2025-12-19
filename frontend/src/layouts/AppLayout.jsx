import { Outlet } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';

export function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
