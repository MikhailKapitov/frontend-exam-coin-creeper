import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDataState } from '../context/DataContext';

export default function Header() {
  const { token, logout } = useDataState();
  const nav = useNavigate();

  return (
    <header id="header">
      <div id="navbar-wrapper">
        <img src="/src/images/Chicken Jockey.png" alt="logo" style={{ width: '4rem', height: 'auto' }} />
        <div className="nav-buttons">
          {token && (
            <>
              <NavLink to="/dashboard"><button>Dashboard</button></NavLink>
              <NavLink to="/stats"><button>Stats</button></NavLink>
              <NavLink to="/settings"><button>Settings</button></NavLink>
            </>
          )}
          {token ? (
            <button onClick={() => {
              const isConfirmed = window.confirm("Are you sure you want to log out?");
              if (isConfirmed) {
                logout();
                nav('/login');
              }
            }}>Log Out</button>
          ) : (
            <NavLink to="/login"><button>Log in</button></NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
