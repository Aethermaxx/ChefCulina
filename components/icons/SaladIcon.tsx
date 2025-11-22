import React from 'react';

export const SaladIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M7 21h10" />
    <path d="M12 21V8" />
    <path d="M12 8a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z" />
    <path d="M12 8a4 4 0 0 1 4 4h0a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4h0a4 4 0 0 1 4-4Z" />
  </svg>
);