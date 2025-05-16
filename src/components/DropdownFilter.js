'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownFilter = ({ label, options, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0) handleSelect(options[focusedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-48" onKeyDown={handleKeyDown} tabIndex={0}>
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 flex items-center justify-between"
      >
        <span>{label}: {selectedValue || 'All'}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto transition-all duration-200 ease-out">
          {options.map((option, index) => (
            <li
              key={option}
              className={`px-4 py-2 text-sm cursor-pointer ${
                focusedIndex === index ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setFocusedIndex(index)}
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
