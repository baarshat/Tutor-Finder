import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  const location = useLocation();

  const getPageName = (pathname) => {
    const name = pathname.split('/').pop();
    if (name === 'superadmin') return 'Dashboard';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const pageName = getPageName(location.pathname);

  return (
    <div className="sa-layout">
      <Sidebar />
      <div className="sa-layout__main">
        <Header pageName={pageName} />
        <div className="sa-layout__content">
          <main className="sa-layout__page">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
