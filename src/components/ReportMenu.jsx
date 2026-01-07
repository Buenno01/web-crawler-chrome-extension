import React, { useState } from 'react'
import Button from './ui/Button';
import SummaryReport from '../pages/Reports/SummaryReport';
import { CgNotes } from "react-icons/cg";
import { RiRobot2Line } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { LuHeading1 } from "react-icons/lu";
import { FaLink } from "react-icons/fa6";
import { DiCssTricks } from "react-icons/di";
import Box from './ui/Box';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const OPTIONS = [
  {
    label: 'Summary',
    value: 'summary',
    icon: CgNotes,
  },
  {
    label: 'Metadata',
    value: 'metadata',
    icon: RiRobot2Line,
  },
  {
    label: 'SEO errors',
    value: 'seo',
    icon: MdErrorOutline,
  },
  {
    label: 'Heading structure',
    value: 'headings',
    icon: LuHeading1,
  },
  {
    label: 'Links',
    value: 'links',
    icon: FaLink,
  },
  {
    label: 'CSS selectors',
    value: 'css-selectors',
    icon: DiCssTricks,
  },
]
function ReportMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOption = location.pathname.split('/reports')[1] || 'summary';

  return (
    <div className="space-y-6">
      <Box.Root>
        <nav>
          <ul className='grid grid-cols-2 gap-4 list-none'>
            {
              OPTIONS.map((option) => (
                <li key={option.value}>
                  <Button
                    onClick={() => navigate(`/reports/${option.value}`)}
                    variant="info"
                    className={ !selectedOption.includes(option.value) && 'text-foreground/60 bg-accent-muted hover:bg-accent-muted hover:text-foreground' }
                  >
                    <option.icon className='text-lg' />
                    {option.label}
                  </Button>
                </li>
              ))
            }
          </ul>
        </nav>
      </ Box.Root>

      <Box.Root>
        <Outlet />
      </Box.Root>
    </div>
  )
}

export default ReportMenu