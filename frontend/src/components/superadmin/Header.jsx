import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ pageName }) {
  const navigate = useNavigate();

  return (
    <header className="sa-header">
      <div>
        <h1 className="sa-header__title">{pageName?.toUpperCase() || 'PAGE_NAME'}</h1>
      </div>
      <div className="sa-header__actions">
        <button 
          className="sa-header__icon-btn" 
          title="Settings" 
          onClick={() => navigate('/superadmin/analytics')}
        >
          <Settings size={22} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

export default Header;
