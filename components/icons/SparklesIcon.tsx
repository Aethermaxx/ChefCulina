
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m12 3-1.5 3L7 7.5l3 1.5L12 12l1.5-3L17 7.5l-3-1.5z" />
    <path d="M5 12.5 3 14l1.5 2 1.5 2 2-1.5 2-1.5-2-2z" />
    <path d="m19 12.5 2 1.5-1.5 2-1.5 2-2-1.5-2-1.5 2-2z" />
  </svg>
);
