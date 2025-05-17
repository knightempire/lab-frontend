'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/table';
import { Flag, CheckCircle, RefreshCw, FileText, Plus, Minus, CalendarDays, Clock, ArrowLeft, AlertTriangle, Check, ExternalLink, X } from 'lucide-react';

const simplifiedProducts = [
  { name: "Widget A", inStock: 90 },
  { name: "Widget B", inStock: 45 },
  { name: "Widget C", inStock: 65 },
  { name: "Widget Z", inStock: 85 }
];

const AdminRequestView = () => {
  const router = useRouter();
  const [requestData, setRequestData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop size
  
  const [userDamagedCount, setUserDamagedCount] = useState(0);
  const [notUserDamagedCount, setNotUserDamagedCount] = useState(0);
  const [replacingCount, setReplacingCount] = useState(0);


  //State for Request
  const [requestStatus, setRequestStatus] = useState('Open');

  // State for admin issue table (editable)
  const [adminIssueComponents, setAdminIssueComponents] = useState([]);
  
  // State for component return tracking
  const [returnTrackingComponents, setReturnTrackingComponents] = useState([]);
  
  // State for return history
  const [returnHistory, setReturnHistory] = useState([]);

  // State for tracking damage
  const [hasDamage, setHasDamage] = useState({});
  const [damageCount, setDamageCount] = useState({});
  
  // Pagination states
  const [requestedPage, setRequestedPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [returnTrackingPage, setReturnTrackingPage] = useState(1);
  const [returnHistoryPage, setReturnHistoryPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Add this to your state declarations at the top
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
  const [damageDescription, setDamageDescription] = useState('');
  const [isUserDamaged, setIsUserDamaged] = useState(false);
  const [damageAction, setDamageAction] = useState('return'); // 'return' or 'replace'

  // Add new state for the damage details modal
  const [showDamageDetailsModal, setShowDamageDetailsModal] = useState(false);
  const [selectedDamageDetails, setSelectedDamageDetails] = useState(null);

  const [replacements, setReplacements] = useState({});

  useEffect(() => {
    // Check if all components have been returned
    const allReturned = returnTrackingComponents.length === 0 || 
      returnTrackingComponents.every(component => component.remaining === 0);
    
    // Update the status accordingly
    setRequestStatus(allReturned ? 'Done' : 'Open');
  }, [returnTrackingComponents]);

  useEffect(() => {
    // Handle window resize for responsive layout
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Set initial size
    handleResize();
    
    // Get request data from sessionStorage that was set in the requests page
    const storedData = sessionStorage.getItem('requestData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setRequestData(parsedData);
      // Initialize admin issue components with requested components
      setAdminIssueComponents([...parsedData.components]);
      
      // Initialize return tracking components
      const returnTracking = parsedData.components.map(component => ({
        ...component,
        totalIssued: component.quantity,
        returned: 0,
        remaining: component.quantity
      }));
      setReturnTrackingComponents(returnTracking);
      
      // Initialize empty return history
      setReturnHistory([]);

      // Initialize damage tracking states
      const initialDamageState = {};
      const initialDamageCount = {};
      parsedData.components.forEach((component, index) => {
        initialDamageState[index] = false;
        initialDamageCount[index] = 0;
      });
      setHasDamage(initialDamageState);
      setDamageCount(initialDamageCount);
    } else {
      // If no data is found, redirect back to the requests page
      router.push('/admin/requests');
    }
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle return quantity change
  const handleReturnQtyChange = (index, value) => {
    const newValue = parseInt(value) || 0;
    const updatedComponents = [...returnTrackingComponents];
    const component = updatedComponents[index];
    
    // Ensure return value doesn't exceed remaining quantity
    // FIX #1 & #2: Make sure return qty doesn't exceed remaining amount
    const validValue = Math.min(newValue, component.remaining);
    
    updatedComponents[index] = {
      ...component,
      returned: validValue,
      // Keep the remaining value unchanged here, since we're just setting the "returning" value
    };
    
    setReturnTrackingComponents(updatedComponents);

    // If damage count is more than return quantity, adjust it
    if (hasDamage[index] && damageCount[index] > validValue) {
      setDamageCount({ ...damageCount, [index]: validValue });
    }
  };

  // Handle damage checkbox change
  const handleDamageModalSubmit = () => {
    const totalDamaged = userDamagedCount + notUserDamagedCount;
    setDamageCount({ ...damageCount, [selectedComponentIndex]: totalDamaged });
    setShowDamageModal(false);
  };


  // Handle damage count change
  const handleDamageCountChange = (index, value) => {
    const newValue = parseInt(value) || 0;
    const returnQty = returnTrackingComponents[index].returned;
    
    // Ensure damage count doesn't exceed return quantity
    const validValue = Math.min(newValue, returnQty);
    if (validValue<0){
      validValue=0;
    }
    setDamageCount({ ...damageCount, [index]: validValue });
  };
  
  // New functions for incrementing and decrementing values
  const incrementReturnQty = (index) => {
    const component = returnTrackingComponents[index];
    // FIX #2: Check against remaining instead of totalIssued
    if (component.returned < component.remaining) {
      handleReturnQtyChange(index, component.returned + 1);
    }
  };
  
  const decrementReturnQty = (index) => {
    const component = returnTrackingComponents[index];
    if (component.returned > 0) {
      handleReturnQtyChange(index, component.returned - 1);
    }
  };
  
  const incrementDamageCount = (index) => {
    const currentCount = damageCount[index] || 0;
    const returnQty = returnTrackingComponents[index].returned;
    if (currentCount < returnQty) {
      handleDamageCountChange(index, currentCount + 1);
    }
  };
  
  const decrementDamageCount = (index) => {
    const currentCount = damageCount[index] || 0;
    if (currentCount > 0) {
      handleDamageCountChange(index, currentCount - 1);
    }
  };

  const incrementUserDamagedCount = () => {
  const returnQty = returnTrackingComponents[selectedComponentIndex].returned;
  const currentTotal = userDamagedCount + notUserDamagedCount;
  if (currentTotal < returnQty) {
    setUserDamagedCount(userDamagedCount + 1);
  }
};

const decrementUserDamagedCount = () => {
  if (userDamagedCount > 0) {
    setUserDamagedCount(userDamagedCount - 1);
    // Ensure replacing count doesn't exceed total damaged count
    if (replacingCount > userDamagedCount + notUserDamagedCount - 1) {
      setReplacingCount(userDamagedCount + notUserDamagedCount - 1);
    }
  }
};

const incrementNotUserDamagedCount = () => {
  const returnQty = returnTrackingComponents[selectedComponentIndex].returned;
  const currentTotal = userDamagedCount + notUserDamagedCount;
  if (currentTotal < returnQty) {
    setNotUserDamagedCount(notUserDamagedCount + 1);
  }
};

const decrementNotUserDamagedCount = () => {
  if (notUserDamagedCount > 0) {
    setNotUserDamagedCount(notUserDamagedCount - 1);
    // Ensure replacing count doesn't exceed total damaged count
    if (replacingCount > userDamagedCount + notUserDamagedCount - 1) {
      setReplacingCount(userDamagedCount + notUserDamagedCount - 1);
    }
  }
};

const incrementReplacingCount = () => {
  const totalDamaged = userDamagedCount + notUserDamagedCount;
  if (replacingCount < totalDamaged) {
    setReplacingCount(replacingCount + 1);
  }
};

const decrementReplacingCount = () => {
  if (replacingCount > 0) {
    setReplacingCount(replacingCount - 1);
  }
};

// New function to handle viewing damage details
const viewDamageDetails = (item) => {
  setSelectedDamageDetails(item);
  setShowDamageDetailsModal(true);
};

// Handle component return submission
const handleReturnSubmit = (componentIndex) => {
  const component = returnTrackingComponents[componentIndex];
  
  // Only process if there's something to return
  if (component.returned > 0) {
    const newReturnHistory = [];
    let historyCounter = returnHistory.length + 1;
    
    // Calculate how many of each type to replace
    const userDamagedToReplace = Math.min(userDamagedCount, replacingCount);
    const notUserDamagedToReplace = Math.min(notUserDamagedCount, replacingCount - userDamagedToReplace);
    
    // Calculate remainders for returning (not replacing)
    const userDamagedToReturn = userDamagedCount - userDamagedToReplace;
    const notUserDamagedToReturn = notUserDamagedCount - notUserDamagedToReplace;
    
    // 1. Create entry for REPLACED user damaged components
    if (userDamagedToReplace > 0) {
      const userDamagedReplaceEntry = {
        id: historyCounter++,
        name: component.name,
        qtyReturned: userDamagedToReplace,
        damagedCount: userDamagedToReplace,
        dateReturned: new Date().toISOString(),
        damageDescription: damageDescription,
        isUserDamaged: true,
        actionType: 'replace'
      };
      newReturnHistory.push(userDamagedReplaceEntry);
    }
    
    // 2. Create entry for REPLACED non-user damaged components
    if (notUserDamagedToReplace > 0) {
      const notUserDamagedReplaceEntry = {
        id: historyCounter++,
        name: component.name,
        qtyReturned: notUserDamagedToReplace,
        damagedCount: notUserDamagedToReplace,
        dateReturned: new Date().toISOString(),
        damageDescription: damageDescription,
        isUserDamaged: false,
        actionType: 'replace'
      };
      newReturnHistory.push(notUserDamagedReplaceEntry);
    }
    
    // 3. Create entry for RETURNED user damaged components (no replacement)
    if (userDamagedToReturn > 0) {
      const userDamagedReturnEntry = {
        id: historyCounter++,
        name: component.name,
        qtyReturned: userDamagedToReturn,
        damagedCount: userDamagedToReturn,
        dateReturned: new Date().toISOString(),
        damageDescription: damageDescription,
        isUserDamaged: true,
        actionType: 'return'
      };
      newReturnHistory.push(userDamagedReturnEntry);
    }
    
    // 4. Create entry for RETURNED non-user damaged components (no replacement)
    if (notUserDamagedToReturn > 0) {
      const notUserDamagedReturnEntry = {
        id: historyCounter++,
        name: component.name,
        qtyReturned: notUserDamagedToReturn,
        damagedCount: notUserDamagedToReturn,
        dateReturned: new Date().toISOString(),
        damageDescription: damageDescription,
        isUserDamaged: false,
        actionType: 'return'
      };
      newReturnHistory.push(notUserDamagedReturnEntry);
    }
    
    // 5. If there are undamaged components to return
    const undamagedCount = component.returned - (userDamagedCount + notUserDamagedCount);
    if (undamagedCount > 0) {
      const undamagedEntry = {
        id: historyCounter++,
        name: component.name,
        qtyReturned: undamagedCount,
        damagedCount: 0,
        dateReturned: new Date().toISOString(),
        damageDescription: '',
        isUserDamaged: false,
        actionType: 'return'
      };
      newReturnHistory.push(undamagedEntry);
    }
    
    // Add new history entries to state
    setReturnHistory([...newReturnHistory, ...returnHistory]);
    
    // Update component in the tracking list
    const updatedComponents = [...returnTrackingComponents];
    updatedComponents[componentIndex] = {
      ...component,
      returned: 0,
      // Increment totalIssued if we're replacing damaged items
      totalIssued: replacingCount > 0 
        ? component.totalIssued + replacingCount
        : component.totalIssued,
      // Reduce the remaining count by the returned amount minus replacing amount
      remaining: component.remaining - (component.returned - replacingCount)
    };
    
    // Track replacements if there are any
    if (replacingCount > 0) {
      const currentReplacements = replacements[component.name] || 0;
      setReplacements({
        ...replacements,
        [component.name]: currentReplacements + replacingCount
      });
    }
    
    // Filter out components with no items remaining
    const filteredComponents = updatedComponents.filter((comp, idx) => {
      return idx !== componentIndex || (idx === componentIndex && updatedComponents[idx].remaining > 0);
    });
    
    setReturnTrackingComponents(filteredComponents);
    
    // Reset damage states
    setDamageCount({ ...damageCount, [componentIndex]: 0 });
    setDamageDescription('');
    setUserDamagedCount(0);
    setNotUserDamagedCount(0);
    setReplacingCount(0);
  }
};
  
  if (!requestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we should use large screen layout
  const isLargeScreen = windowWidth >= 1024;

  // Table configurations
  const requestedComponentsColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ];

  const requestedComponentsRows = requestData.components.map(component => ({
    ...component,
    name: component.name,
    quantity: component.quantity,
    description: component.description || '-'
  }));

  const adminComponentsColumns = [
  { key: 'name', label: 'Component Name' },
  { key: 'quantity', label: 'Quantity', className: 'text-center' },
];

const adminComponentsRows = requestData.components.map(component => {
  const replacedCount = replacements[component.name] || 0;
  
  return {
    ...component,
    name: component.name,
    quantity: (
      <div className="flex items-center justify-center">
        <span>{component.quantity}</span>
        {replacedCount > 0 && (
          <span className="ml-1 text-red-600 font-medium">+{replacedCount}</span>
        )}
      </div>
    ),
    description: component.description || '-'
  };
});
  
  // Return tracking table configuration
  const returnTrackingColumns = [
    { key: 'name', label: 'Component Name', className: 'text-center' },
    { key: 'totalIssued', label: 'Total Issued', className: 'text-center' },
    { key: 'returned', label: 'Returning', className: 'text-center' },
    { key: 'remaining', label: 'Remaining', className: 'text-center' },
    { key: 'damage', label: 'Damage', className: 'text-center' },
    { key: 'actions', label: 'Actions', className: 'text-center' }
  ];
  
  const returnTrackingRows = returnTrackingComponents.map((component, index) => ({
    ...component,
    name: <div className="text-center">{component.name}</div>,
    totalIssued: <div className="text-center">{component.totalIssued}</div>,
    remaining: <div className="text-center">{component.remaining}</div>,
    returned: (
      <div className="flex items-center justify-center">
        <button 
          onClick={() => decrementReturnQty(index)}
          disabled={component.returned <= 0}
          className={`p-1 rounded ${component.returned <= 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          min="0"
          max={component.remaining}
          value={component.returned}
          onChange={(e) => handleReturnQtyChange(index, e.target.value)}
          className="w-16 p-1 mx-1 border border-gray-300 rounded text-center"
        />
        <button 
          onClick={() => incrementReturnQty(index)}
          disabled={component.returned >= component.remaining}
          className={`p-1 rounded ${component.returned >= component.remaining ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
        >
          <Plus size={16} />
        </button>
      </div>
    ),
    damage: (
      <div className="flex items-center justify-center">
        <button
          onClick={() => {
            setSelectedComponentIndex(index);
            setDamageCount({ ...damageCount, [index]: 0 });
            setDamageDescription('');
            setIsUserDamaged(false);
            setDamageAction('return');
            setShowDamageModal(true);
          }}
          disabled={component.returned <= 0}
          className={`px-3 py-1 rounded-md ${
            component.returned > 0 
              ? 'bg-amber-500 hover:bg-amber-600 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Report Damage
        </button>
      </div>
    ),
    actions: (
      <div className="text-center">
        <button
          onClick={() => handleReturnSubmit(index)}
          disabled={component.returned <= 0}
          className={`px-3 py-1 rounded-md ${
            component.returned > 0 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Return
        </button>
      </div>
    )
  }));
  
  // Return history table configuration
  const returnHistoryColumns = [
    { key: 'name', label: 'Component Name', className: 'text-center' },
    { key: 'qtyReturned', label: 'Qty Returned', className: 'text-center' },
    { key: 'damagedCount', label: 'Damaged Count', className: 'text-center' },
    { key: 'actionType', label: 'Action', className: 'text-center' },
    { key: 'isUserDamaged', label: 'User Damaged', className: 'text-center' },
    { key: 'dateReturned', label: 'Date Returned', className: 'text-center' }
  ];
  
  const returnHistoryRows = returnHistory.map(item => ({
    ...item,
    name: (
      <div className="text-center flex items-center justify-center">
        {item.name}
      </div>
    ),
    qtyReturned: <div className="text-center">{item.qtyReturned}</div>,
    damagedCount: (
      <div className="flex items-center justify-center">
        {item.damagedCount > 0 ? (
          <div className="flex items-center text-amber-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>{item.damagedCount}</span>
          </div>
        ) : (
          <span className="text-green-600">0</span>
        )}
        {item.damagedCount > 0 && (
          <button
            onClick={() => viewDamageDetails(item)}
            className="ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
            title="View damage details"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>
    ),
    actionType: (
      <div className="text-center">
        {item.damagedCount > 0 ? (
          <span className={item.actionType === 'replace' ? 'text-blue-600' : 'text-amber-600'}>
            {item.actionType === 'replace' ? 'Replaced' : 'Returned'}
          </span>
        ) : (
          <span className="text-green-600">Returned</span>
        )}
      </div>
    ),
    isUserDamaged: (
      <div className="text-center">
        {item.damagedCount > 0 ? (
          <span className={item.isUserDamaged ? 'text-red-600 rounded-full bg-red-100 px-3 py-1' : 'text-green-600 rounded-full bg-green-100 px-3 py-1'}>
            {item.isUserDamaged ? 'Yes' : 'No'}
          </span>
        ) : (
          <span>-</span>
        )}
      </div>
    ),
    dateReturned: <div className="text-center">{formatDate(item.dateReturned)}</div>
  }));



  return (
    <div className="bg-gray-50">
      <div className="mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Issued Details</h1>
          </div>
        </div>
        
        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Request header */}
          <div className="bg-green-50 p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Request #{requestData.id}</h2>
                <p className="text-gray-600">Approved on {formatDate(requestData.requestedDate)}</p>
                <p className="text-gray-600">Submitted on {formatDate(requestData.requestedDate)}</p>

              </div>
              <div className="mt-4 md:mt-0 flex flex-col gap-4">
                {/* Request Type Box */}
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-800">
                    {requestData.isFaculty ? 'Faculty' : 'Student'} Request
                  </span>
                </div>

                {/* Request Status Box */}
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm border 
                ${requestStatus === 'Done' 
                  ? 'bg-green-500 border-green-300' 
                  : 'bg-red-500 border-red-300'
                }`}>
                
                <Flag size={16} className={requestStatus === 'Done' ? 'text-white' : 'text-white'} />

                <span className="text-sm font-medium text-white">
                  Request {requestStatus}
                </span>
              </div>
              </div>
            </div>
          </div>
          {/* User and Reference Information */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Requester Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-32">Name:</span>
                    <span className="font-medium">{requestData.name}</span>
                  </div>
                  <button
                    className="ml-4 px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"                  
                    onClick={() => router.push(`/admin/profile?rollNo=${requestData.rollNo}`)}
                  >
                    View Profile
                  </button>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Email:</span>
                  <span className="font-medium">{requestData.email}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Roll Number:</span>
                  <span className="font-medium">{requestData.rollNo}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Phone Number:</span>
                  <span className="font-medium">{requestData.phoneNo || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            
            {/* Description and requested days */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h4 className="font-medium text-gray-700">Request Description</h4>
                </div>
                <p className="text-gray-600">{requestData.description || "No description provided."}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h4 className="font-medium text-gray-700">Admin Description</h4>
                </div>
                <p className="text-gray-600">{requestData.description || "No description provided."}</p>
              </div>

            </div>
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Reference Staff
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-32">Name:</span>
                  <span className="font-medium">{requestData.referenceStaff.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Email:</span>
                  <span className="font-medium">{requestData.referenceStaff.email}</span>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Components Tables Section */}
          <div className="p-6">
            <div className={`grid ${isLargeScreen ? 'grid-cols-2 gap-6' : 'grid-cols-1 gap-8'} mb-8`}>
              {/* Requested Components Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Requested Components
                    </h2>
                    <div className="mb-2">
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                        <h4 className="font-medium text-gray-700">Requested Days</h4>
                      </div>
                      <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{requestData.requestedDays || "N/A"} Days</span>
                      </div>
                    </div>
                </div>
                  </div>
                  <Table 
                    columns={requestedComponentsColumns} 
                    rows={requestedComponentsRows} 
                    currentPage={requestedPage} 
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
              
              {/* Admin Issue Components Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Admin Issued Components
                    </h2>
                    <div className="mb-2">
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                        <h4 className="font-medium text-gray-700">Issued Days</h4>
                      </div>
                      <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{requestData.requestedDays || "N/A"} Days</span>
                      </div>
                    </div>
                </div>
                  </div>
                  <Table 
                    columns={adminComponentsColumns} 
                    rows={adminComponentsRows} 
                    currentPage={adminPage} 
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </div>
            {/* Return Tracking Table */}
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-amber-600" />
                  Component Return Tracking
                </h2>
                {returnTrackingComponents.length > 0 ? (
                  <Table 
                    columns={returnTrackingColumns} 
                    rows={returnTrackingRows} 
                    currentPage={returnTrackingPage} 
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setReturnTrackingPage}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    All components have been returned
                  </div>
                )}
              </div>
            </div>
            
            {/* Return History Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Return History
                </h2>
                {returnHistory.length > 0 ? (
                  <Table 
                    columns={returnHistoryColumns} 
                    rows={returnHistoryRows} 
                    currentPage={returnHistoryPage} 
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setReturnHistoryPage}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No return history available yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Damage Report Modal */}
      {showDamageModal && selectedComponentIndex !== null && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform scale-100 animate-fadeIn">
          <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
            Report Damaged Component
          </h3>

          <div className="space-y-5">
            {/* Component Name */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Component Name</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800 text-sm">
                {returnTrackingComponents[selectedComponentIndex].name}
              </div>
            </div>
            
            {/* User Damaged Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">User Damaged Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementUserDamagedCount}
                  disabled={userDamagedCount <= 0}
                  className={`p-2 rounded-md border ${userDamagedCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={returnTrackingComponents[selectedComponentIndex].returned - notUserDamagedCount}
                  value={userDamagedCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = returnTrackingComponents[selectedComponentIndex].returned - notUserDamagedCount;
                    setUserDamagedCount(Math.min(val, max));
                    // Adjust replacing count if needed
                    if (replacingCount > val + notUserDamagedCount) {
                      setReplacingCount(val + notUserDamagedCount);
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementUserDamagedCount}
                  disabled={userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned}
                  className={`p-2 rounded-md border ${userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Not User Damaged Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Not User Damaged Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementNotUserDamagedCount}
                  disabled={notUserDamagedCount <= 0}
                  className={`p-2 rounded-md border ${notUserDamagedCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={returnTrackingComponents[selectedComponentIndex].returned - userDamagedCount}
                  value={notUserDamagedCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = returnTrackingComponents[selectedComponentIndex].returned - userDamagedCount;
                    setNotUserDamagedCount(Math.min(val, max));
                    // Adjust replacing count if needed
                    if (replacingCount > val + userDamagedCount) {
                      setReplacingCount(val + userDamagedCount);
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementNotUserDamagedCount}
                  disabled={userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned}
                  className={`p-2 rounded-md border ${userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Replacing Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Replacing Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementReplacingCount}
                  disabled={replacingCount <= 0}
                  className={`p-2 rounded-md border ${replacingCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={userDamagedCount + notUserDamagedCount}
                  value={replacingCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = userDamagedCount + notUserDamagedCount;
                    setReplacingCount(Math.min(val, max));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementReplacingCount}
                  disabled={replacingCount >= userDamagedCount + notUserDamagedCount}
                  className={`p-2 rounded-md border ${replacingCount >= userDamagedCount + notUserDamagedCount 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cannot exceed total damaged quantity ({userDamagedCount + notUserDamagedCount})
              </p>
            </div>

            {/* Damage Description */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Damage Description</label>
              <textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows="3"
                placeholder="Describe the damage..."
                required
              ></textarea>
            </div>    
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-end mt-8 space-x-3">
            <button
              onClick={() => setShowDamageModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDamageModalSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap:2 shadow-sm"
            >
              <Check size={20} />
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {showDamageDetailsModal && selectedDamageDetails && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold">Damage Description</h3>
            <button 
              onClick={() => setShowDamageDetailsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Component:</span>
              <span>{selectedDamageDetails.name}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="font-medium mb-1">Description:</p>
            <div className="border rounded p-4 bg-gray-50 max-h-48 overflow-y-auto">
              {selectedDamageDetails.damageDescription ? (
                <p>{selectedDamageDetails.damageDescription}</p>
              ) : (
                <p className="text-gray-500 italic">No damage description provided.</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowDamageDetailsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default AdminRequestView;