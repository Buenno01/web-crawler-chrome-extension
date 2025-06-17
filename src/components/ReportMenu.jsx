import React, { useState } from 'react'
import Button from './ui/Button';
import { CgNotes } from "react-icons/cg";
import { RiRobot2Line } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { LuHeading1 } from "react-icons/lu";
import { FaLink } from "react-icons/fa6";
import { DiCssTricks } from "react-icons/di";

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

  return (
    <menu className='box grid grid-cols-2 gap-4'>
        {
          options.map((option) => (
            <li key={option.value}>
              <Button
                onClick={() => handleOptionClick(option.value)}
                variant={option.selected ? 'primary' : 'secondary'}
                className={ !option.selected && 'text-blue-300/60' }
              >
                <option.icon className='text-lg' />
                {option.label}
              </Button>
            </li>
          ))
        }
    </menu>
  )
}

export default ReportMenu