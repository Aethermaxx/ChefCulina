import React from 'react';

export const BowlIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5c2.5 0 5 2.5 5 5v0c0 1.4-1.1 2.5-2.5 2.5H9.5C8.1 12.5 7 11.4 7 10v0c0-2.5 2.5-5 5-5Z" />
    <path d="M20.5 13.5c-1.3 1.2-3.2 2-5.5 2h-6c-2.3 0-4.2-.8-5.5-2" />
    <path d="M20.5 13.5C21.2 15.2 21 17 20 18.5" />
    <path d="M3.5 13.5C2.8 15.2 3 17 4 18.5" />
  </svg>
);