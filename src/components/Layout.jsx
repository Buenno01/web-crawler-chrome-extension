import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoMdSettings } from "react-icons/io";
import { MdHome } from "react-icons/md";

function Layout() {
  const location = useLocation();
  const links = [
    {
      to: '/',
      label: 'Home',
      icon: MdHome,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: IoMdSettings,
    },
  ];
  return (
    <div className='p-4 bg-gray-50 text-gray-950 min-h-96 w-[500px] dark:bg-gray-900 dark:text-gray-50 text-md'>      
      <header className='mb-4'>
        <nav>
          <ul className='flex gap-0 border font-semibold border-blue-500 w-fit rounded-sm overflow-hidden divide-blue-500 divide-solid divide-x-[1px]'>
            {
              links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`
                      text-gray-950 bg-gray-950/10 flex items-end gap-1
                      dark:text-gray-50 px-2 py-1
                      ${location.pathname === link.to ? 'bg-black/20 dark:bg-gray-50/20 font-bold' : ''}`}
                  >
                    <link.icon className='text-lg' />
                    {link.label}
                  </Link>
                </li>
              ))
            }
          </ul>
        </nav>
      </header>
      <main className=''>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout;