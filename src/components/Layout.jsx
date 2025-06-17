import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoMdSettings } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { useTranslation } from '../hooks/useTranslation';
import { MdAutoGraph } from "react-icons/md";
import { FaDatabase } from "react-icons/fa6";

function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const links = [
    {
      to: '/',
      label: t('navigationHome'),
      icon: MdHome,
    },
    {
      to: '/settings',
      label: t('navigationSettings'),
      icon: IoMdSettings,
    },
    {
      to: '/reports',
      label: t('navigationReports'),
      icon: MdAutoGraph,
    },
    {
      to: '/storage',
      label: t('navigationStorage'),
      icon: FaDatabase,
    }
  ];
  
  return (
    <div className="layout">      
      <header className="layout__header">
        <nav className="nav">
          <ul className="nav__list">
            {
              links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`nav__link ${location.pathname === link.to ? 'nav__link--active' : ''}`}
                  >
                    <link.icon className="nav__icon" />
                    {link.label}
                  </Link>
                </li>
              ))
            }
          </ul>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout;