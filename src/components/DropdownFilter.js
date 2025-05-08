'use client';

import { useState } from 'react';

const DropdownFilter = ({ label, options, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (value) => {
    onSelect(value); // Notify the parent of the selected value
    setIsOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700"
      >
        {label}: {selectedValue || 'All'}
      </button>
      
      {isOpen && (
        <ul className="absolute z-10 bg-white shadow-lg rounded-lg border border-gray-300 mt-2 w-full max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              {option === '' ? 'All' : option} 
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownFilter;
