'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'overdue'

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
    const uniqueTypes = [...new Set(events.map(event => event.status))];
    return uniqueTypes.map(type => ({
      status: type,
      count: events.filter(event => event.status === type).length
    }));
  };

  const getEventColor = (status) => {
    const colors = {
      'Issue Date': 'bg-green-500',
      'Returning Date': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getEventDotColor = (status) => {
    const colors = {
      'Issue Date': 'bg-green-500',
      'Returning Date': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const handleViewEvent = (event) => {
    alert(`Viewing event:\nID: ${event.id}\nStatus: ${event.status}\nDate: ${event.date}`);
  };

  const handleViewOverdue = (item) => {
    alert(`Viewing overdue item:\nRequest ID: ${item.reqid}\nDue Date: ${item.duedate}`);
  };

  const formatOverdueDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const calendarDays = getCalendarDays();
  const currentMonth = currentDate.getMonth();
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Calendar Section */}
          <div className="flex-1 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                          ${isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-300 opacity-50'}
                          ${isSelected && isToday 
                            ? 'bg-blue-500 text-white shadow-md border-2 border-blue-600' 
                            : isSelected 
                            ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                            : isToday && isCurrentMonth 
                            ? 'border-2 border-blue-500 text-blue-600 font-semibold' 
                            : 'border-2 border-transparent'}
                        `}
                        onClick={() => isCurrentMonth && handleDateClick(date)}
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
                                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getEventDotColor(eventType.status)}`}
                                title={`${eventType.status}: ${eventType.count} event${eventType.count > 1 ? 's' : ''}`}
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

          {/* Events Sidebar */}
          <div className="w-full lg:w-96 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header with Toggle Buttons */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {activeTab === 'events' ? 'Upcoming Events' : 'Overdue Items'}
                </h2>
              </div>
              
              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'events'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'overdue'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overdue
                </button>
              </div>

              {activeTab === 'events' && (
                <p className="text-sm text-gray-500 mt-3">
                  {selectedDate 
                    ? formatEventDate(selectedDate)
                    : 'Select a date to view events'
                  }
                </p>
              )}
            </div>
            
            <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
              {/* Events Tab Content */}
              {activeTab === 'events' && (
                <>
                  {selectedEvents.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {selectedEvents.map((event, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                          <div className={`w-3 h-3 rounded-full mt-1 sm:mt-2 ${getEventColor(event.status)}`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {event.status}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              ID: {event.id}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-xs font-medium"
                            title="View details"
                          >
                            View More
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
                      </div>
                      <p className="text-gray-500 text-sm">No events scheduled</p>
                      <p className="text-gray-400 text-xs mt-1">for this date</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded"></div>
                      </div>
                      <p className="text-gray-500 text-sm">Select a date</p>
                      <p className="text-gray-400 text-xs mt-1">to view events</p>
                    </div>
                  )}
                </>
              )}

              {/* Overdue Tab Content */}
              {activeTab === 'overdue' && (
                <>
                  {overdueItems.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {overdueItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="w-3 h-3 rounded-full mt-1 sm:mt-2 bg-red-500" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                              {item.reqid}
                            </h3>
                            <p className="text-xs text-red-600 mt-1">
                              Due: {formatOverdueDate(item.duedate)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewOverdue(item)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-xs font-medium"
                            title="View details"
                          >
                            View More
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-300 rounded"></div>
                      </div>
                      <p className="text-gray-500 text-sm">No overdue items</p>
                      <p className="text-gray-400 text-xs mt-1">All caught up!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;