import React from 'react';

export const SeniorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M18 20a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Z" />
    <path d="M14 14v6" />
    <path d="M10 12.5a2.5 2.5 0 1 0-5 0" />
    <path d="M10 12.5v7.5" />
    <path d="M5 12.5v7.5" />
    <path d="M10 20h.5" />
    <path d="M5 20h-.5" />
    <circle cx="7.5" cy="5.5" r="2.5" />
  </svg>
);
