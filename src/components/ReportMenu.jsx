import React, { useState } from 'react'
import Button from './ui/Button';
import SummaryReport from './SummaryReport';
import { CgNotes } from "react-icons/cg";
import { RiRobot2Line } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { LuHeading1 } from "react-icons/lu";
import { FaLink } from "react-icons/fa6";
import { DiCssTricks } from "react-icons/di";
import Box from './ui/Box';

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
    value: 'seoErrors',
    icon: MdErrorOutline,
  },
  {
    label: 'Heading structure',
    value: 'headingStructure',
    icon: LuHeading1,
  },
  {
    label: 'Links',
    value: 'links',
    icon: FaLink,
  },
  {
    label: 'CSS selectors',
    value: 'cssSelectors',
    icon: DiCssTricks,
  },
]
function ReportMenu() {
  const [options, setOptions] = useState(OPTIONS.map((option, index) => ({
    ...option,
    selected: index === 0,
    downloaded: false,
  })));

  const handleOptionClick = (value) => {
    setOptions(options.map((option) => ({
      ...option,
      selected: option.value === value,
    })));
  }

  const selectedOption = options.find(option => option.selected);

  return (
    <div className="space-y-6">
      <Box.Root>
        <menu className='grid grid-cols-2 gap-4'>
            {
              options.map((option) => (
                <li key={option.value}>
                  <Button
                    onClick={() => handleOptionClick(option.value)}
                    variant={option.selected ? 'primary' : 'secondary'}
                    className={ !option.selected && 'text-foreground/60' }
                  >
                    <option.icon className='text-lg' />
                    {option.label}
                  </Button>
                </li>
              ))
            }
        </menu>
      </ Box.Root>

      {/* Render the selected report component */}
      <Box.Root>  
        {selectedOption?.value === 'summary' && <SummaryReport />}
        {selectedOption?.value === 'metadata' && (
          <div className="text-center text-foreground-secondary/60 py-8">
            <p>Metadata report coming soon...</p>
          </div>
        )}
        {selectedOption?.value === 'seoErrors' && (
          <div className="text-center text-foreground-secondary/60 py-8">
            <p>SEO errors report coming soon...</p>
          </div>
        )}
        {selectedOption?.value === 'headingStructure' && (
          <div className="text-center text-foreground-secondary/60 py-8">
            <p>Heading structure report coming soon...</p>
          </div>
        )}
        {selectedOption?.value === 'links' && (
          <div className="text-center text-foreground-secondary/60 py-8">
            <p>Links report coming soon...</p>
          </div>
        )}
        {selectedOption?.value === 'cssSelectors' && (
          <div className="text-center text-foreground-secondary/60 py-8">
            <p>CSS selectors report coming soon...</p>
          </div>
        )}
      </Box.Root>
    </div>
  )
}

export default ReportMenu