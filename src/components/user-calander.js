'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ events, overdueItems }) => {
  // Get today's date key consistently
  const getTodayKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Parse events and group by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      const [day, month, year] = event.date.split('/');
      const dateKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  useEffect(() => {
    const handleScroll = () => {
      setHoveredDate(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Get calendar days - only current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Calculate how many weeks we need
    const weeksNeeded = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);
    
    for (let i = 0; i < weeksNeeded * 7; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateKey);
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearSelector(false);
  };

  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthSelector(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const getEventsForDate = (date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return eventsByDate[dateKey] || [];
  };

  // Get unique event types for a date (max one dot per type)
  const getUniqueEventTypes = (date) => {
    const events = getEventsForDate(date);
    // Instead of status, use color from the first event of each type
    const uniqueTypes = [];
    const seen = new Set();
    for (const event of events) {
      if (!seen.has(event.status)) {
        uniqueTypes.push({ status: event.status, color: event.color });
        seen.add(event.status);
      }
    }
    return uniqueTypes;
  };

  // Use event.color if present, else fallback
  const getEventDotColor = (status, color) => {
    if (color) return color;
    if (status === 'Returned') return 'bg-violet-500';
    if (status === 'Overdue Return') return 'bg-red-500';
    if (status === 'Upcoming Return') return 'bg-yellow-400';
    if (status === 'Issue Date') return 'bg-green-500';
    return 'bg-gray-400';
  };

  const handleMouseEnter = (date, event) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setHoveredDate(dateKey);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const calendarDays = getCalendarDays();
  const currentMonth = currentDate.getMonth();

  const formatTooltipDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50">
      <div>
        {/* Calendar Section */}
        <div className="bg-white rounded-xl lg:rounded-2xl overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowMonthSelector(true);
                  setShowYearSelector(false);
                }}
                className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
              >
                {monthNames[currentDate.getMonth()]}
              </button>
              <button
                onClick={() => {
                  setShowYearSelector(true);
                  setShowMonthSelector(false);
                }}
                className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
              >
                {currentDate.getFullYear()}
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="p-3 sm:p-6">
            {/* Day Headers - only show when not selecting year/month */}
            {!showYearSelector && !showMonthSelector && (
              <div className="grid grid-cols-7 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-500 py-2 sm:py-3">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Year Selector */}
            {showYearSelector && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Select Year</h3>
                  <button
                    onClick={() => setShowYearSelector(false)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {generateYearOptions().map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`p-3 sm:p-4 text-center rounded-xl border-2 transition-all font-medium text-sm sm:text-base ${
                        year === currentDate.getFullYear()
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Month Selector */}
            {showMonthSelector && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Select Month</h3>
                  <button
                    onClick={() => setShowMonthSelector(false)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {monthNames.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(index)}
                      className={`p-3 sm:p-4 text-center rounded-xl border-2 transition-all font-medium text-sm sm:text-base ${
                        index === currentDate.getMonth()
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Days - only show when not selecting year/month */}
            {!showYearSelector && !showMonthSelector && (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateKey;
                  const uniqueEventTypes = getUniqueEventTypes(date);
                  
                  return (
                    <div
                      key={index}
                      className={`
                        relative h-12 sm:h-16 p-1 sm:p-2 cursor-pointer transition-all duration-200 rounded-lg flex flex-col items-center justify-center
                        ${isCurrentMonth && !isToday ? 'hover:bg-gray-50' : ''}
                        ${!isCurrentMonth ? 'text-gray-300 opacity-50' : ''}
                        ${isSelected && isToday 
                          ? 'bg-blue-500 text-white shadow-md border-2 border-blue-600' 
                          : isSelected 
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                          : isToday && isCurrentMonth 
                          ? 'border-2 border-blue-500 text-blue-600 font-semibold' 
                          : 'border-2 border-transparent'}
                      `}
                      onClick={() => isCurrentMonth && handleDateClick(date)}
                      onMouseEnter={(e) => {
                        handleMouseEnter(date, e);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className={`text-xs sm:text-sm font-medium ${
                        isSelected && isToday 
                          ? 'text-white' 
                          : isSelected 
                          ? 'text-blue-700' 
                          : isToday && isCurrentMonth 
                          ? 'text-blue-600' 
                          : isCurrentMonth 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Event Dots - Maximum one per event type */}
                      {uniqueEventTypes.length > 0 && isCurrentMonth && (
                        <div className="absolute bottom-0.5 sm:bottom-1 flex gap-0.5 sm:gap-1 justify-center items-center">
                          {uniqueEventTypes.map((eventType, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getEventDotColor(eventType.status, eventType.color)}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDate && eventsByDate[hoveredDate] && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-sm font-semibold text-gray-900 mb-2">
              {formatTooltipDate(hoveredDate)}
            </div>
            <div className="space-y-2">
              {eventsByDate[hoveredDate].map((event, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getEventDotColor(event.status, event.color)}`} />
                  <div className="text-xs text-gray-700">
                    <div className="font-medium">{event.status}</div>
                    <div className="text-gray-500">ID: {event.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;