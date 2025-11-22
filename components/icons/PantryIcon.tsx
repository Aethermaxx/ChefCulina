import React from 'react';

export const PantryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 21v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" />
    <path d="M4 15V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
    <path d="M15 7H9" />
    <path d="M15 11H9" />
  </svg>
);
