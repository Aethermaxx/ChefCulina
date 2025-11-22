// FIX: The file was empty, causing a module resolution error. This adds the component implementation.
import React from 'react';

export const ChefHatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M6 13.87A4 4 0 0 1 7.43 11h9.14a4 4 0 0 1 1.43 2.87L18 21H6l-.57-7.13Z" />
    <path d="M6 12a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v0" />
    <path d="M17.5 7.5a2.5 2.5 0 0 0-5 0v0" />
    <path d="M6.5 7.5a2.5 2.5 0 0 1 5 0v0" />
  </svg>
);
