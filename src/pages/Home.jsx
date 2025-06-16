import React from 'react';
import { BsBoxArrowRight } from "react-icons/bs";
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import Button from '../components/ui/Button';

function Home() {
  const { values } = useCssSelectorsContext();
  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>Web Crawler</h1>
      <div className='flex flex-col gap-2 mb-4 text-sm italic text-gray-700 dark:text-gray-300'>
        <p>
          <strong>Atention:</strong> When you start the extraction, if there's no path filters set, the extraction will
          map all internal links it can find in the website and pages it can find. It may take a while to complete.
        </p>
        <p>
          If you want to filter the links, you can set the path filters in the settings page.
        </p>
      </div>

      <Button>
        <BsBoxArrowRight className='text-lg' />
        Start Extraction
      </Button>
      <p className='text-sm text-gray-700 dark:text-gray-300 mt-4 flex items-center justify-center gap-2 flex-wrap w-full'>
        <span>CSS Selectors: <strong className='aspect-square inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-500 text-white text-center'>{values.length}</strong></span>
      </p>
    </>
  )
}

export default Home;