'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Clock, Trash2, Settings, AlertCircle, CheckCircle, Info, MoreHorizontal } from 'lucide-react';

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);

  // Initialize notifications
  useEffect(() => {
    const initialNotifications = [
      { 
        id: 1, 
        message: "New component request pending approval.", 
        time: "2025-06-02T10:30:00",
        type: "info",
        details: "A component request has been submitted and is waiting for review. Please check the request details and approve or reject based on availability."
      },
      { 
        id: 2, 
        message: "Lab inventory updated successfully.", 
        time: "2025-06-02T08:15:00",
        type: "success",
        details: "Inventory records have been updated after the recent maintenance. All stock levels are now synchronized."
      },
      { 
        id: 3, 
        message: "Monthly component usage report available.", 
        time: "2025-06-01T16:45:00",
        type: "info",
        details: "The monthly usage report for May 2025 is ready. It includes request trends, inventory changes, and top-used components."
      },
      { 
        id: 4, 
        message: "Alert: Excessive requests detected.", 
        time: "2025-06-01T12:30:00",
        type: "warning",
        details: "Multiple requests have been submitted in a short period. Please verify the legitimacy of these requests."
      },
      { 
        id: 5, 
        message: "Component stock below safe threshold.", 
        time: "2025-06-01T09:15:00",
        type: "warning",
        details: "Stock levels for 'Raspberry Pi 4' have dropped below 10 units. Consider restocking to avoid shortages."
      }
    ];

    setNotifications(initialNotifications);
  }, []);

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-600" />;
      case 'info':
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getNotificationDot = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (expandedNotification?.id === notificationId) {
      setExpandedNotification(null);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setExpandedNotification(null);
    setIsOpen(false);
  };

  const expandNotification = (notification) => {
    setExpandedNotification(notification);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notifications-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (expandedNotification) {
          setExpandedNotification(null);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, expandedNotification]);

  const unreadCount = notifications.length;

  return (
    <>
      <div className="notifications-container relative">
        {/* Notification Bell Button */}
        <button 
          className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 touch-manipulation"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-xs flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* Notification Dropdown - Responsive */}
        {isOpen && (
          <>
            {/* Mobile Fullscreen Overlay */}
            <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setIsOpen(false)}></div>
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-80 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 
                          sm:max-w-none
                          max-sm:fixed max-sm:top-16 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:mt-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium touch-manipulation"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto overscroll-contain">
              {unreadCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 group touch-manipulation"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationDot(notification.type)}`}></div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs flex items-center">
                              <Clock size={10} className="mr-1" />
                              {formatTime(notification.time)}
                            </span>
                            
                            <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => expandNotification(notification)}
                                className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 touch-manipulation"
                              >
                                View
                              </button>
                              <button
                                onClick={() => clearNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600 active:text-red-700 p-1 rounded hover:bg-red-50 active:bg-red-100 transition-colors duration-150 touch-manipulation"
                                title="Remove"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
                      </div>
          </>
        )}
      </div>

      {/* Expanded Notification Modal - Mobile Optimized */}
      {expandedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getNotificationIcon(expandedNotification.type)}
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notification Details</h3>
                </div>
                <button
                  onClick={() => setExpandedNotification(null)}
                  className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 touch-manipulation"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Message</h4>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded">
                  {expandedNotification.message}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Time</h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded flex items-center">
                  <Clock size={14} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span className="break-words">
                    {formatTime(expandedNotification.time)} • {new Date(expandedNotification.time).toLocaleString()}
                  </span>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Details</h4>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded">
                  {expandedNotification.details}
                </p>
              </div>
            </div>
            
            {/* Modal Footer - Responsive buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  clearNotification(expandedNotification.id);
                  setExpandedNotification(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded transition-colors duration-150 touch-manipulation"
              >
                Remove
              </button>
              <button
                onClick={() => setExpandedNotification(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-sm font-medium rounded transition-colors duration-150 touch-manipulation"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}