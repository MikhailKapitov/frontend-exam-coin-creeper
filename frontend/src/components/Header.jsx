import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDataState } from '../context/DataContext';

export default function Header() {
  const { token, logout } = useDataState();
  const nav = useNavigate();

  return (
    <header id="header">
      <div id="navbar-wrapper">
        <img src="/src/images/creeper_favicon.ico" alt="logo" />
        {token && (
          <>
            <NavLink to="/dashboard"><button>Dashboard</button></NavLink>
            <NavLink to="/stats"><button>Stats</button></NavLink>
            <NavLink to="/settings"><button>Settings</button></NavLink>
          </>
        )}
        {token ? (
          <button onClick={() => { logout(); nav('/login'); }}>
            Log out
          </button>
        ) : (
          <NavLink to="/login"><button>Log in</button></NavLink>
        )}
      </div>
    </header>
  );
}
