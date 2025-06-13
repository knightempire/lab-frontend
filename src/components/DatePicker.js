'use client';

import { useEffect, useRef, useState } from "react";

export default function SingleDatePicker({ 
  value, 
  onChange, 
  minDate, 
  disabled = false, 
  className = "",
  placeholder = "Pick a date" 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value || null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const daysContainerRef = useRef(null);
  const datepickerContainerRef = useRef(null);
  const componentRef = useRef(null); // Add ref for the entire component

  // Update selectedDate when value prop changes
  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  useEffect(() => {
    if (daysContainerRef.current && isCalendarOpen && !showYearPicker && !showMonthPicker) {
      renderCalendar();
    }
  }, [currentDate, isCalendarOpen, minDate, showYearPicker, showMonthPicker]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
        setShowYearPicker(false);
        setShowMonthPicker(false);
      }
    };

    // Add event listener when calendar is open
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Helper function to check if a date is disabled
  const isDateDisabled = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison
    
    // Only disable dates before today (allow today and future dates)
    if (dateToCheck < today) {
      return true;
    }
    
    // Also check minDate if provided
    if (minDate) {
      const minDateObj = new Date(minDate);
      minDateObj.setHours(0, 0, 0, 0); // Ensure minDate is also at start of day
      return dateToCheck < minDateObj;
    }
    
    return false;
  };

  // Helper function to format date as YYYY-MM-DD (same as input type="date")
  const formatDateForInput = (year, month, day) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysContainer = daysContainerRef.current;
    if (!daysContainer) return;

    daysContainer.innerHTML = "";

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDiv = document.createElement("div");
      daysContainer.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement("div");
      const isDisabled = isDateDisabled(year, month, i);
      const dateValue = formatDateForInput(year, month, i);
      const isSelected = selectedDate === dateValue;
      const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
      
      let dayClassName = "flex items-center justify-center cursor-pointer w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105";
      
      if (isDisabled) {
        dayClassName = "flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-400 rounded-lg cursor-not-allowed bg-gray-100 opacity-50";
      } else if (isSelected) {
        dayClassName = "flex items-center justify-center cursor-pointer w-10 h-10 text-sm font-medium text-white rounded-lg bg-indigo-500 shadow-lg transform scale-105";
      } else if (isToday) {
        dayClassName += " text-indigo-600 border-2 border-indigo-200 font-semibold";
      }else {
        dayClassName += " text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";
      }
      
      dayDiv.className = dayClassName;
      dayDiv.textContent = i.toString();
      
      if (!isDisabled) {
        dayDiv.addEventListener("click", () => {
          const selectedDateValue = formatDateForInput(year, month, i);
          setSelectedDate(selectedDateValue);
          
          // Call onChange callback with the new value
          if (onChange) {
            onChange({ target: { value: selectedDateValue } });
          }
          
          if (daysContainer) {
            daysContainer
              .querySelectorAll("div")
              .forEach((d) => {
                d.classList.remove("bg-indigo-500", "text-white", "shadow-lg", "scale-105");
                d.classList.add("text-gray-700");
              });
            dayDiv.classList.add("bg-indigo-500", "text-white", "shadow-lg", "scale-105");
            dayDiv.classList.remove("text-gray-700");
          }
        });
      }
      
      daysContainer.appendChild(dayDiv);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1))
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1))
    );
  };

  const handleApply = () => {
    setIsCalendarOpen(false);
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };

  const handleCancel = () => {
    setIsCalendarOpen(false);
    setShowYearPicker(false);
    setShowMonthPicker(false);
  };

  const handleToggleCalendar = () => {
    if (!disabled) {
      setIsCalendarOpen(!isCalendarOpen);
      setShowYearPicker(false);
      setShowMonthPicker(false);
    }
  };

  const handleYearClick = () => {
    setShowYearPicker(!showYearPicker);
    setShowMonthPicker(false);
  };

  const handleMonthClick = () => {
    setShowMonthPicker(!showMonthPicker);
    setShowYearPicker(false);
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  // Generate year options (current year ± 50 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Format display value for the input
  const displayValue = selectedDate ? 
    new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';

  const inputClassName = `w-full rounded-xl border-2 border-gray-200 bg-white py-2 pl-12 pr-12 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:shadow-lg ${
    disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:border-gray-300'
  } ${className}`;

  return (
    <div className="w-full" ref={componentRef}>
      <div className="mb-6">
        <div className="relative">
          <div className="relative flex items-center">
            <span className="absolute left-0 pl-4 text-gray-400 z-10">
              <svg
                className="fill-current w-5 h-5"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 3.3125H15.8125V2.625C15.8125 2.25 15.5 1.90625 15.0937 1.90625C14.6875 1.90625 14.375 2.21875 14.375 2.625V3.28125H5.59375V2.625C5.59375 2.25 5.28125 1.90625 4.875 1.90625C4.46875 1.90625 4.15625 2.21875 4.15625 2.625V3.28125H2.5C1.4375 3.28125 0.53125 4.15625 0.53125 5.25V16.125C0.53125 17.1875 1.40625 18.0937 2.5 18.0937H17.5C18.5625 18.0937 19.4687 17.2187 19.4687 16.125V5.25C19.4687 4.1875 18.5625 3.3125 17.5 3.3125ZM2.5 4.71875H4.1875V5.34375C4.1875 5.71875 4.5 6.0625 4.90625 6.0625C5.3125 6.0625 5.625 5.75 5.625 5.34375V4.71875H14.4687V5.34375C14.4687 5.71875 14.7812 6.0625 15.1875 6.0625C15.5937 6.0625 15.9062 5.75 15.9062 5.34375V4.71875H17.5C17.8125 4.71875 18.0625 4.96875 18.0625 5.28125V7.34375H1.96875V5.28125C1.96875 4.9375 2.1875 4.71875 2.5 4.71875ZM17.5 16.6562H2.5C2.1875 16.6562 1.9375 16.4062 1.9375 16.0937V8.71875H18.0312V16.125C18.0625 16.4375 17.8125 16.6562 17.5 16.6562Z"
                  fill=""
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder={placeholder}
              className={inputClassName}
              value={displayValue}
              readOnly
              disabled={disabled}
              onClick={handleToggleCalendar}
            />

            <span
              className={`absolute right-0 pr-4 text-gray-400 z-10 ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600'
              }`}
              onClick={handleToggleCalendar}
            >
              <svg
                className={`fill-current transition-all duration-300 w-5 h-5 ${
                  isCalendarOpen ? "rotate-180 text-indigo-500" : ""
                }`}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.29635 5.15354L2.29632 5.15357L2.30055 5.1577L7.65055 10.3827L8.00157 10.7255L8.35095 10.381L13.701 5.10603L13.701 5.10604L13.7035 5.10354C13.722 5.08499 13.7385 5.08124 13.7499 5.08124C13.7613 5.08124 13.7778 5.08499 13.7963 5.10354C13.8149 5.12209 13.8187 5.13859 13.8187 5.14999C13.8187 5.1612 13.815 5.17734 13.7973 5.19552L8.04946 10.8433L8.04945 10.8433L8.04635 10.8464C8.01594 10.8768 7.99586 10.8921 7.98509 10.8992C7.97746 10.8983 7.97257 10.8968 7.96852 10.8952C7.96226 10.8929 7.94944 10.887 7.92872 10.8721L2.20253 5.2455C2.18478 5.22733 2.18115 5.2112 2.18115 5.19999C2.18115 5.18859 2.18491 5.17209 2.20346 5.15354C2.222 5.13499 2.2385 5.13124 2.2499 5.13124C2.2613 5.13124 2.2778 5.13499 2.29635 5.15354Z"
                  fill=""
                />
              </svg>
            </span>
          </div>

          {isCalendarOpen && !disabled && (
            <div
              ref={datepickerContainerRef}
              className="absolute bottom-full mb-3 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 w-full backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 transform hover:scale-110"
                    onClick={handlePrevMonth}
                  >
                    <svg className="fill-current w-5 h-5" viewBox="0 0 20 20">
                      <path d="M13.5312 17.9062C13.3437 17.9062 13.1562 17.8438 13.0312 17.6875L5.96875 10.5C5.6875 10.2187 5.6875 9.78125 5.96875 9.5L13.0312 2.3125C13.3125 2.03125 13.75 2.03125 14.0312 2.3125C14.3125 2.59375 14.3125 3.03125 14.0312 3.3125L7.46875 10L14.0625 16.6875C14.3438 16.9688 14.3438 17.4062 14.0625 17.6875C13.875 17.8125 13.7187 17.9062 13.5312 17.9062Z" />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-indigo-50"
                      onClick={handleMonthClick}
                    >
                      {currentDate.toLocaleDateString("en-US", { month: "long" })}
                    </button>
                    <button
                      className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-indigo-50"
                      onClick={handleYearClick}
                    >
                      {currentDate.getFullYear()}
                    </button>
                  </div>

                  <button
                    className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 transform hover:scale-110"
                    onClick={handleNextMonth}
                  >
                    <svg className="fill-current w-5 h-5" viewBox="0 0 20 20">
                      <path d="M6.46875 17.9063C6.28125 17.9063 6.125 17.8438 5.96875 17.7188C5.6875 17.4375 5.6875 17 5.96875 16.7188L12.5312 10L5.96875 3.3125C5.6875 3.03125 5.6875 2.59375 5.96875 2.3125C6.25 2.03125 6.6875 2.03125 6.96875 2.3125L14.0313 9.5C14.3125 9.78125 14.3125 10.2187 14.0313 10.5L6.96875 17.6875C6.84375 17.8125 6.65625 17.9063 6.46875 17.9063Z" />
                    </svg>
                  </button>
                </div>

                {showYearPicker && (
                  <div className="mb-4 max-h-64 overflow-y-auto rounded-xl bg-gray-50 p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {generateYearOptions().map((year) => (
                        <button
                          key={year}
                          className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            year === currentDate.getFullYear()
                              ? 'bg-indigo-500 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                          }`}
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showMonthPicker && (
                  <div className="mb-4 rounded-xl bg-gray-50 p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {months.map((month, index) => (
                        <button
                          key={month}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            index === currentDate.getMonth()
                              ? 'bg-indigo-500 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                          }`}
                          onClick={() => handleMonthSelect(index)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!showYearPicker && !showMonthPicker && (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-wide">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div
                      ref={daysContainerRef}
                      className="grid grid-cols-7 gap-1 mb-6"
                    >
                      {/* Days will be rendered here */}
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                  <button
                    className="rounded-xl border-2 border-gray-300 px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-indigo-500 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    onClick={handleApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}