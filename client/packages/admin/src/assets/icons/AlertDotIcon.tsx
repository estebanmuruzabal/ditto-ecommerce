import React from 'react';
export const AlertDotIcon = ({
   color = 'currentColor',
   width = '10px',
   height = '10px',
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 10 10'
    >
      <g data-name='Group 2830' transform='translate(-1598 -32)'>
        <g
          data-name='Ellipse 73'
          transform='translate(1598 32)'
          fill='#ffffff'
          stroke='currentColor'
          strokeWidth='0.3'
        >
          <circle cx='5' cy='5' r='5' stroke='none' />
          <circle cx='5' cy='5' r='4.85' fill='none' />
        </g>
        <path
          data-name='Path 2700'
          d='M2,0A2,2,0,1,1,0,2,2,2,0,0,1,2,0Z'
          transform='translate(1601 35)'
          fill={color}
        />
      </g>
    </svg>
  );
};
