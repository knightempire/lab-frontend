import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const TimePicker = ({ 
  value, 
  onChange, 
  disabled = false, 
  min, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const [mode, setMode] = useState('hour'); // 'hour' or 'minute'
  const [isEditing, setIsEditing] = useState(false);
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const clockRef = useRef(null);
  const containerRef = useRef(null);
  const hourInputRef = useRef(null);
  const minuteInputRef = useRef(null);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setIsPM(hours >= 12);
      setEditHour(hour12.toString());
      setEditMinute(minutes.toString().padStart(2, '0'));
    }
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setMode('hour');
        setIsEditing(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatTime = (hour, minute, pm) => {
    const hour24 = pm ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const displayTime = () => {
    if (!value) return '';
    const [hours, minutes] = value.split(':').map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getPositionFromAngle = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian)
    };
  };

  const getAngleFromPosition = (x, y) => {
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
    return angle;
  };

  const handleClockClick = (e) => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const angle = getAngleFromPosition(x, y);
    
    if (mode === 'hour') {
      const hour = Math.round(angle / 30) || 12;
      setSelectedHour(hour);
      setEditHour(hour.toString());
    } else {
      const minute = Math.round(angle / 6) % 60;
      setSelectedMinute(minute);
      setEditMinute(minute.toString().padStart(2, '0'));
    }
  };

  const handleEditTimeDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (hourInputRef.current) {
        hourInputRef.current.focus();
        hourInputRef.current.select();
      }
    }, 50);
  };

  const handleEditMinuteDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      if (minuteInputRef.current) {
        minuteInputRef.current.focus();
        minuteInputRef.current.select();
      }
    }, 50);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to current values
      setEditHour(selectedHour.toString());
      setEditMinute(selectedMinute.toString().padStart(2, '0'));
    }
  };

  const handleEditSubmit = () => {
    const hour = parseInt(editHour) || 12;
    const minute = parseInt(editMinute) || 0;
    
    // Validate hour (1-12)
    const validHour = Math.max(1, Math.min(12, hour));
    // Validate minute (0-59)
    const validMinute = Math.max(0, Math.min(59, minute));
    
    setSelectedHour(validHour);
    setSelectedMinute(validMinute);
    setEditHour(validHour.toString());
    setEditMinute(validMinute.toString().padStart(2, '0'));
    setIsEditing(false);
  };

  const handleHourChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 2) {
      setEditHour(value);
    }
  };

  const handleMinuteChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 2) {
      setEditMinute(value);
    }
  };

  const handleOK = () => {
    const timeString = formatTime(selectedHour, selectedMinute, isPM);
    onChange({ target: { value: timeString } });
    setIsOpen(false);
    setMode('hour');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setMode('hour');
    setIsEditing(false);
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setIsPM(hours >= 12);
      setEditHour(hour12.toString());
      setEditMinute(minutes.toString().padStart(2, '0'));
    }
  };

  const renderHourNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30;
      const position = getPositionFromAngle(angle, 85);
      
      numbers.push(
        <div
          key={i}
          className={`absolute w-8 h-8 flex items-center justify-center font-medium cursor-pointer rounded-full transition-all duration-200
            ${selectedHour === i 
              ? 'bg-indigo-500 text-white scale-110 shadow-lg' 
              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-500'
            }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            left: '50%',
            top: '50%',
            marginLeft: '-16px',
            marginTop: '-16px'
          }}
          onClick={() => {
            setSelectedHour(i);
            setEditHour(i.toString());
          }}
        >
          {i}
        </div>
      );
    }
    return numbers;
  };

  const renderMinuteNumbers = () => {
    const numbers = [];
    for (let i = 0; i < 60; i += 5) {
      const angle = i * 6;
      const position = getPositionFromAngle(angle, 85);
      
      numbers.push(
        <div
          key={i}
          className={`absolute w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded-full transition-all duration-200
            ${selectedMinute === i 
              ? 'bg-indigo-500 text-white scale-110 shadow-lg' 
              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-500'
            }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            left: '50%',
            top: '50%',
            marginLeft: '-16px',
            marginTop: '-16px'
          }}
          onClick={() => {
            setSelectedMinute(i);
            setEditMinute(i.toString().padStart(2, '0'));
          }}
        >
          {i.toString().padStart(2, '0')}
        </div>
      );
    }
    return numbers;
  };

  const renderClockHand = () => {
    const value = mode === 'hour' ? selectedHour : selectedMinute;
    const angle = mode === 'hour' ? value * 30 : value * 6;
    const length = mode === 'hour' ? 60 : 80;
    const position = getPositionFromAngle(angle, length);
    
    return (
      <>
        <div
          className="absolute bg-indigo-500 origin-center z-10"
          style={{
            width: '2px',
            height: `${length}px`,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            left: '50%',
            top: '50%',
            transformOrigin: 'center bottom'
          }}
        />
        <div
          className="absolute w-4 h-4 bg-indigo-500 rounded-full z-20 border-2 border-white"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            left: '50%',
            top: '50%',
            marginLeft: '-8px',
            marginTop: '-8px'
          }}
        />
      </>
    );
  };

  const openPicker = () => {
    if (!disabled) {
      setIsOpen(true);
      setMode('hour');
      setIsEditing(false);
    }
  };

  return (
    <div className="relative time-picker-container w-full" ref={containerRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-80">
            
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="text-center">
                <div className="text-gray-800 text-4xl font-light tracking-wide mb-3">
                  {isEditing ? (
                    <div className="flex items-center justify-center space-x-1">
                      <input
                        ref={hourInputRef}
                        type="text"
                        value={editHour}
                        onChange={handleHourChange}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditSubmit}
                        className="w-12 text-center bg-indigo-50 border border-indigo-200 rounded px-1 py-0.5 text-3xl font-light focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="12"
                      />
                      <span className="mx-1">:</span>
                      <input
                        ref={minuteInputRef}
                        type="text"
                        value={editMinute}
                        onChange={handleMinuteChange}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditSubmit}
                        className="w-16 text-center bg-indigo-50 border border-indigo-200 rounded px-1 py-0.5 text-3xl font-light focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="00"
                      />
                    </div>
                  ) : (
                    <div className="cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors duration-200">
                      <span 
                        className={`cursor-pointer px-2 py-1 rounded-lg transition-colors duration-200 ${
                          mode === 'hour' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode('hour');
                        }}
                        onDoubleClick={handleEditTimeDoubleClick}
                        title="Double-click to edit hours"
                      >
                        {selectedHour}
                      </span>
                      <span className="mx-1">:</span>
                      <span 
                        className={`cursor-pointer px-2 py-1 rounded-lg transition-colors duration-200 ${
                          mode === 'minute' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode('minute');
                        }}
                        onDoubleClick={handleEditMinuteDoubleClick}
                        title="Double-click to edit minutes"
                      >
                        {selectedMinute.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isPM ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-300'
                    }`}
                    onClick={() => setIsPM(false)}
                  >
                    AM
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      isPM ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-300'
                    }`}
                    onClick={() => setIsPM(true)}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div 
                ref={clockRef}
                className="relative w-64 h-64 bg-gray-50 border border-gray-200 rounded-full mx-auto cursor-pointer transition-all duration-300"
                onClick={handleClockClick}
              >
                {mode === 'hour' ? renderHourNumbers() : renderMinuteNumbers()}
                {renderClockHand()}
                
                <div className="absolute w-3 h-3 bg-indigo-500 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 border-2 border-white shadow-md" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 px-4 pb-4 border-t border-gray-100 pt-3">
              <button
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200 text-sm font-medium"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 bg-indigo-500 text-white hover:bg-indigo-700 rounded-md transition-all duration-200 text-sm font-medium shadow-md"
                onClick={handleOK}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          className={`w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer ${className}`}
          value={displayTime()}
          onClick={openPicker}
          placeholder="Select time"
          disabled={disabled}
        />
        
        <div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
          onClick={openPicker}
        >
          <ChevronUp className="w-4 h-4 rotate-180" />
        </div>
      </div>
    </div>
  );
};
export default TimePicker;