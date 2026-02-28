import React from 'react';

/**
 * Reusable Material Symbols Rounded Icon Component
 * 
 * @param {Object} props
 * @param {string} props.name - The exact name of the Material Symbol (e.g., 'home', 'restaurant', 'favorite')
 * @param {string} [props.className] - Tailwind classes for sizing and coloring (e.g., 'text-teal-600 text-2xl')
 * @param {boolean} [props.filled=false] - Whether the icon should be filled (FILL=1) or outlined (FILL=0)
 */
export const Icon = ({ name, className = '', filled = false, ...props }) => {
    return (
        <span
            className={`material-symbols-rounded leading-none select-none inline-flex items-center justify-center ${className}`}
            style={{
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                ...props.style,
            }}
            {...props}
        >
            {name}
        </span>
    );
};

export default Icon;
