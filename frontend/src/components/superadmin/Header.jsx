import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ pageName }) {
  const navigate = useNavigate();

  return (
    <header className="sa-header">
      <div>
        <p className="sa-header__kicker">Superadmin Panel</p>
        <h1 className="sa-header__title">{pageName}</h1>
      </div>
      <div className="sa-header__actions">
        <button className="sa-header__icon-btn" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="sa-header__icon-btn" title="Settings" onClick={() => navigate('/superadmin/settings')}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
