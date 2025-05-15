'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/table';
import { CheckCircle, XCircle, PlusCircle, RefreshCw, Trash2, FileText, Plus, Minus, CalendarDays, Clock, Search, ArrowLeft, AlertTriangle } from 'lucide-react';

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
  const handleDamageChange = (index, checked) => {
    setHasDamage({ ...hasDamage, [index]: checked });
    
    // Reset damage count if unchecked
    if (!checked) {
      setDamageCount({ ...damageCount, [index]: 0 });
    }
  };

  // Handle damage count change
  const handleDamageCountChange = (index, value) => {
    const newValue = parseInt(value) || 0;
    const returnQty = returnTrackingComponents[index].returned;
    
    // Ensure damage count doesn't exceed return quantity
    const validValue = Math.min(newValue, returnQty);
    
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
  
  // Handle component return submission
  const handleReturnSubmit = (componentIndex) => {
    const component = returnTrackingComponents[componentIndex];
    
    // Only process if there's something to return
    if (component.returned > 0) {
      // Get damage count (if any)
      const damagedCount = hasDamage[componentIndex] ? damageCount[componentIndex] : 0;
      
      // Create a return history entry
      const returnEntry = {
        id: returnHistory.length + 1,
        name: component.name,
        qtyReturned: component.returned,
        damagedCount: damagedCount,
        dateReturned: new Date().toISOString()
      };
      
      // Add to return history
      setReturnHistory([returnEntry, ...returnHistory]);
      
      // Update component in the tracking list - FIX #1
      const updatedComponents = [...returnTrackingComponents];
      updatedComponents[componentIndex] = {
        ...component,
        returned: 0,
        remaining: component.remaining - component.returned
      };
      
      // FIX #3: Filter out components with no items remaining
      const filteredComponents = updatedComponents.filter((comp, idx) => {
        // Only include it if it's not this component OR if this component still has items remaining
        return idx !== componentIndex || (idx === componentIndex && updatedComponents[idx].remaining > 0);
      });
      
      setReturnTrackingComponents(filteredComponents);
      
      // Reset damage states
      setHasDamage({ ...hasDamage, [componentIndex]: false });
      setDamageCount({ ...damageCount, [componentIndex]: 0 });
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
    { key: 'quantity', label: 'Quantity' },
  ];

  const adminComponentsRows = requestData.components.map(component => ({
    ...component,
    name: component.name,
    quantity: component.quantity,
    description: component.description || '-'
  }));
  
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
      <div className="flex items-center justify-center space-x-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`damage-${index}`}
            checked={hasDamage[index] || false}
            onChange={(e) => handleDamageChange(index, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor={`damage-${index}`} className="ml-2 text-sm text-gray-700">
            Damage
          </label>
        </div>
        {hasDamage[index] && (
          <div className="flex items-center ml-2">
            <button 
              onClick={() => decrementDamageCount(index)}
              disabled={damageCount[index] <= 0}
              className={`p-1 rounded ${damageCount[index] <= 0 ? 'text-gray-300' : 'text-amber-600 hover:bg-amber-100'}`}
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="0"
              max={component.returned}
              value={damageCount[index] || 0}
              onChange={(e) => handleDamageCountChange(index, e.target.value)}
              className="w-14 p-1 mx-1 border border-gray-300 rounded text-center"
            />
            <button 
              onClick={() => incrementDamageCount(index)}
              disabled={damageCount[index] >= component.returned}
              className={`p-1 rounded ${damageCount[index] >= component.returned ? 'text-gray-300' : 'text-amber-600 hover:bg-amber-100'}`}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
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
    { key: 'dateReturned', label: 'Date Returned', className: 'text-center' }
  ];
  
  const returnHistoryRows = returnHistory.map(item => ({
    ...item,
    name: <div className="text-center">{item.name}</div>,
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
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">{requestData.isFaculty ? 'Faculty' : 'Student'} Request</span>
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
              
              {/* Issuable Days Section with Controls */}
              <div className="mb-2">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-medium text-gray-700">Issued Duration</h4>
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{requestData.requestedDays || "N/A"} Days</span>
                  </div>
                </div>
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
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h4 className="font-medium text-gray-700">Admin Description</h4>
                </div>
                <p className="text-gray-600">{requestData.description || "No description provided."}</p>
              </div>
              <div className="mb-2">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-medium text-gray-700">Issued Date</h4>
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                <p className="text-gray-600">{formatDate(requestData.requestedDate)}</p>
                  </div>
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
                  <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Requested Components
                  </h2>
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
    </div>
  );
};

export default AdminRequestView;