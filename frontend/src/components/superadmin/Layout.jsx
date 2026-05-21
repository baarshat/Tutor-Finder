import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="sa-layout">
      <Sidebar />
      <div className="sa-layout__main">
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
