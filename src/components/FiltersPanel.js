'use client';

import React, { useState, useEffect, useRef } from 'react';
import DropdownFilter from './DropdownFilter';
import { Filter, ChevronUp, X } from 'lucide-react';

const CheckboxDropdown = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(item => item !== value)
      : [...selectedValues, value];
    
    onChange(newSelectedValues);
  };

  const removeProduct = (product, event) => {
    event.stopPropagation(); // Prevent dropdown from toggling
    const newSelectedValues = selectedValues.filter(item => item !== product);
    onChange(newSelectedValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-80 px-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 min-h-10"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
         
          {selectedValues.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto flex-1 min-w-0" 
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#cbd5e1 #f1f5f9'
                 }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  height: 3px;
                }
                div::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 2px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 2px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              `}</style>
              {selectedValues.map(product => (
                <div 
                  key={product}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs whitespace-nowrap flex-shrink-0"
                >
                  <span>{product}</span>
                  <span 
                    onClick={(e) => removeProduct(product, e)}
                    className="text-blue-700 hover:text-blue-900 cursor-pointer flex items-center"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeProduct(product, e);
                      }
                    }}
                  >
                    <X size={12} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">Select products...</span>
          )}
        </div>
        
        <ChevronUp
          size={14}
          className={`${isOpen ? 'rotate-0' : 'rotate-180'} transition-transform flex-shrink-0 ml-1`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 max-h-60 overflow-auto">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FiltersPanel = ({
  filters = [],
  onChange,
  onReset,
  children,
  Text = '',
  products = [],
  selectedProducts = [],
  onProductsChange,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleProductChange = (newSelectedProducts) => {
    if (onProductsChange) {
      onProductsChange(newSelectedProducts);
    }
  };

  return (
    <div className="w-full py-2 px-3 rounded-md text-sm border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="flex justify-between items-center mb-1 ml-2">
        {Text && (
          <span className="text-lg font-semibold text-gray-700">{Text}</span>
        )}

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 text-sm font-medium ${
            filtersOpen ? 'text-blue-600' : 'text-gray-700'
          } py-2 px-3 rounded-md transition-all hover:text-blue-500`}
        >
          <Filter size={18} />
          <span>Filters</span>
          <ChevronUp
            size={14}
            className={`${filtersOpen ? 'rotate-180' : ''} transition-transform`}
          />
        </button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col md:flex-row md:items-center gap-4 ml-2 p-2">
          {filters.map((filter) => (
            <DropdownFilter
              key={filter.key}
              label={filter.label}
              options={filter.options}
              selectedValue={filter.value}
              onSelect={(val) => onChange(filter.key, val)}
            />
          ))}
          
          {/* Product Filter with Checkboxes */}
          {products && products.length > 0 && (
            <CheckboxDropdown
              label="Products"
              options={products}
              selectedValues={selectedProducts || []}
              onChange={handleProductChange}
            />
          )}
          
          <button
            type="button"
            onClick={onReset}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all"
          >
            Reset
          </button>
        </div>
      )}

      {children}
    </div>
  );
};

export default FiltersPanel;