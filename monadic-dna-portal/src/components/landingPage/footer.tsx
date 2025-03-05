import React from 'react';

import Link from '@mui/material/Link';
import { lime } from '@mui/material/colors';

const Footer = () => {
  return (
    <>
        <footer
            className='w-full min-h-[122px] px-4 py-9 sm:px-8 lg:px-[173px] xl:px-[346px]'
            style={{ background: lime[50] }}
        >
            Thank you for exploring our prototype! Your interest supports our initiative to create a new pro-privacy paradigm for handling genomic data. For questions and feedback please feel free to
            {' '}
            <span>
                <Link
                    href='mailto:hello@monadicdna.com'
                    target="_blank"
                    rel="noopener noreferrer"
                    color='inherit'
                >
                    get in touch.
                </Link>
            </span>
        </footer>
    </>
  )
}

export default Footer;