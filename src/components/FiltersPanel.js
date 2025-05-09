'use client';

import React, { useState } from 'react';
import DropdownFilter from './DropdownFilter';
import { Filter, ChevronUp } from 'lucide-react';

const FiltersPanel = ({
  filters = [],
  onChange,
  onReset,
  children,
  Text = '',
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="w-full py-2 px-3 rounded-md text-sm border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="flex justify-between items-center mb-1 ml-2">
        {Text && (
          <span className="text-lg font-semibold text-gray-700">{Text}</span>
        )}

        {/* Filter Toggle Button */}
        <button
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
          <button
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
