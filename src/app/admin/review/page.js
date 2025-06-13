'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Table from '../../../components/table';
import LoadingScreen from '../../../components/loading/loadingscreen';
import DropdownPortal from '../../../components/dropDown';
import SuccessAlert from '../../../components/SuccessAlert';
import RequestTimeline from '../../../components/RequestTimeline';
import { CheckCircle, XCircle, PlusCircle, RefreshCw, Trash2, FileText, Plus, Minus, CalendarDays, Clock, Search, ArrowLeft, AlertTriangle, Repeat } from 'lucide-react';

const AdminRequestViewContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestData, setRequestData] = useState(null);
  const [products, setProducts] = useState([]);
  // State for admin issue table (editable)
  const [adminIssueComponents, setAdminIssueComponents] = useState([]);
  const [issuableDays, setIssuableDays] = useState();
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [searchTerm, setSearchTerm] = useState({});

    // Action states
  const [action, setAction] = useState(null); // 'accept' or 'decline'
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationMessage, setValidationMessage] = useState('');


  const [adminAvailableDate, setAdminAvailableDate] = useState('');
  const [adminAvailableTime, setAdminAvailableTime] = useState('');
const [issueError, setIssueError] = useState(""); // Add this state

  const [showSuccess, setShowSuccess] = useState(false);
  const [showDateTimeWarning, setShowDateTimeWarning] = useState(false);
const [collectedError, setCollectedError] = useState('');


const [reissueAction, setReissueAction] = useState(null); // 'accept' or 'decline'
const [reissueMessage, setReissueMessage] = useState('');
const [isReissueSubmitting, setIsReissueSubmitting] = useState(false);
const [showReissueDuration, setShowReissueDuration] = useState(true);
const [showReissueActions, setShowReissueActions] = useState(true);
const [reissueSummary, setReissueSummary] = useState(null);

  function formatScheduledCollectionDate(date, time) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-'); // date: "2025-06-20"
    return `${day}/${month}/${year} ${time}`;   // "20/06/2025 16:00"
  }


  useEffect(() => {
  if (issueError) {
    const timer = setTimeout(() => setIssueError(""), 3000);
    return () => clearTimeout(timer);
  }
}, [issueError]);

  useEffect(() => {
    const requestId = searchParams.get('requestId');
    console.log('requestId:', requestId);

    if (!requestId) {
      console.error('No requestId found in search params');
           router.push('/auth/login'); 
    }
 
    const verifyadmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/login'); 
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Token verification failed:', data.message);
      router.push('/auth/login'); 
    } else {
      const user = data.user;
      console.log('User data:', user);
      console.log('Is admin:', user.isAdmin);
      if (!user.isAdmin ) {
        router.push('/auth/login'); 
      }
      if (!user.isActive) {
          router.push('/auth/login'); 
      }

      console.log('User is admin, proceeding with request data fetch');
    if (requestId) {
      fetchRequestData();
    } else {
      router.push('/admin/request');
    }

    fetchProducts();
    }
  }


verifyadmin();

  }, [searchParams, router]);

    const fetchRequestData = async () => {
      try {
    const requestId = searchParams.get('requestId');
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('No token found in localStorage');
      router.push('/auth/login'); 
      return;
    } 
    if (!requestId) {
      router.push('/admin/request');
      return;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/get/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      localStorage.removeItem('token'); 
      router.push('/auth/login');
      return;
    }

    const apiResponse = await response.json();
    const data = apiResponse.request; 

    // If returned/closed/collected, redirect
if (
  data.requestStatus === 'returned' ||
  data.requestStatus === 'closed' || data.requestStatus === 'reIssued' || data.requestStatus === 'rejected' ||
  (
    data.requestStatus === 'approved' &&
    data.collectedDate &&
    (
      !Array.isArray(data.reIssued) ||
      data.reIssued.length === 0
    )
  )
) {
  router.push('/admin/request');
  return;
}

    // --- Check for re-issue ---
    let isExtended = false;
    let reIssueRequest = null;
    if (Array.isArray(data.reIssued) && data.reIssued.length > 0) {
      // Only check the latest re-issue (or loop if you want all)
      const reIssuedId = data.reIssued[data.reIssued.length - 1];
      const reissueRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reIssued/get/${reIssuedId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  if (reissueRes.ok) {
    const reissueData = await reissueRes.json();
    if (reissueData.reIssued) {
      if (reissueData.reIssued.status === 'pending') {
        isExtended = true;
        reIssueRequest = { ...reissueData.reIssued };
      } else {
        // If re-issue status is not pending, redirect
        router.push('/admin/request');
        return;
      }
    }
  }
}


    

    const mappedData = {
      requestId: data.requestId,
      name: data.userId.name,
      rollNo: data.userId.rollNo,
      phoneNo: data.userId.phoneNo, 
      email: data.userId.email,
      isFaculty: false, 
      requestedDate: data.requestDate,
      requestedDays: data.requestedDays,
      adminApprovedDays: data.adminApprovedDays,
      status: data.requestStatus,
      referenceStaff: {
        name: data.referenceId.name,
        email: data.referenceId.email,
      },
      userMessage: data.description ,
      adminMessage: data.adminReturnMessage || "",
      components: data.requestedProducts.map(product => ({
        id: product.productId._id,
        name: product.productId?.product_name || "Unknown Product",
        quantity: product.quantity,
      })),
      adminIssueComponents: data.issued.map(issued => ({
        id: issued.issuedProductId._id,
        name: issued.issuedProductId.product_name,
        quantity: issued.issuedQuantity,
      })),
     returnedComponents: data.issued
    .flatMap(issued => (issued.return || []).map(ret => ({
      issuedProductId: issued.issuedProductId._id,
      name: issued.issuedProductId.product_name,
      returnedQuantity: ret.returnedQuantity,
      replacedQuantity: ret.replacedQuantity,
      damagedQuantity: ret.damagedQuantity,
      returnDate: ret.returnDate,
      _id: ret._id,
    }))),
      reIssueRequest, 
      isExtended,
      acceptedDate: data.issuedDate || null,
      issueDate: data.collectedDate || null,
      // Optionally add originalRequestedDays, originalRequestDate, etc.
    };

    setRequestData(mappedData);
    setIssuableDays(
      mappedData.adminApprovedDays && mappedData.adminApprovedDays > 0
        ? mappedData.adminApprovedDays
        : mappedData.requestedDays
    );
    setAdminIssueComponents(() => {
      const isIssuedEmpty = !mappedData.adminIssueComponents || mappedData.adminIssueComponents.length === 0;
      return isIssuedEmpty
        ? mappedData.components.map((c, idx) => ({
            id: c.id || idx + 1,
            name: c.name,
            quantity: c.quantity,
            description: c.description || ''
          }))
        : mappedData.adminIssueComponents;
    });
  } catch (error) {
    console.error('Error fetching request data:', error);
    router.push('/admin/request');
  }
};
      const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/get`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (res.ok && data.products) {
          // Transform API data to simplified format used in component
const simplified = data.products.map(item => ({
  _id: item.product._id, // Add this line
  name: item.product.product_name,
  inStock: item.product.inStock
}));
          setProducts(simplified);
        } else {
          console.error('Failed to fetch products:', data.message);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


const handleSave = async () => {
  
  const requestId = searchParams.get('requestId');
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No token found in localStorage');
    router.push('/auth/login');
    return;
  }

  const hasEmptyComponent = adminIssueComponents.some(
    (component) => !component.name || component.name.trim() === ""
  );
  if (hasEmptyComponent) {
    setIssueError("Please select a component for all rows before saving.");
    return;
  }
  
  if (!adminIssueComponents || adminIssueComponents.length === 0) {
    setIssueError("No issuing components. Please add at least one component to issue.");
    return;
  }
  setIssueError("");


  console.log('Saving admin issued components:', adminIssueComponents);
    const currentstatus = requestData.status;
    const iscollected = requestData.collectedDate;
    console.log('Current request status:', currentstatus);
  if (currentstatus === 'pending') {
    console.log("Request is pending, proceeding to save.");

      const payload = {
        adminApprovedDays: issuableDays, 
    issued: adminIssueComponents.map(component => ({
      issuedProductId: component.id,
      issuedQuantity: component.quantity
    }))
  };

  console.log('Payload for update:', payload);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/update-product/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('API Response:', data);
    if (!response.ok) {
      console.error('Failed:', data.message || 'Unknown error');
    } else {
      console.log('Success:', data);
      
      setShowSuccess(true);
      fetchRequestData(); 
    }

  } catch (error) {
    console.error('Error:', error);
  }
  }
  else if ((currentstatus === 'approved' || currentstatus === 'accepted' ) && !iscollected) {
    console.log("Request is approved, proceeding to save.");

      const payload = {
        adminApprovedDays: issuableDays, 
    issued: adminIssueComponents.map(component => ({
      issuedProductId: component.id,
      issuedQuantity: component.quantity
    }))
  };

  console.log('Payload for update:', payload);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/update/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('API Response:', data);
    if (!response.ok) {
      console.error('Failed:', data.message || 'Unknown error');
    } else {
      console.log('Success:', data);
      
      setShowSuccess(true);
      fetchRequestData(); 
    }

  } catch (error) {
    console.error('Error:', error);
  }
  }
};


// Add this function inside your AdminRequestViewContent component

const handleReIssueAction = async (action, message) => {
  console.log('reIssueRequest:', requestData?.reIssueRequest);

  const token = localStorage.getItem('token');
  const reissueId = requestData.reIssueRequest?.reIssuedId; 

  console.log(reissueId, "reissueId");
  let url = '';
  let payload = {
    adminReturnMessage: message
  };

  if (action === 'accept') {
    url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reIssued/approve/${reissueId}`;
    payload.adminApprovedDays = issuableDays;
  } else if (action === 'decline') {
    url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reIssued/reject/${reissueId}`;
  } else {
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowSuccess(true);
       setReissueAction(null); // Hide the buttons
      setReissueMessage('');
      setShowReissueDuration(false); // Hide the re-issue duration input
        setShowReissueActions(false);
         setReissueSummary({
    ...yourSummaryData,
    resStatus: 200
  });
    } else {
      const data = await res.json();
      setIssueError(data.message || 'Failed to process re-issue action.');
    }
  } catch (err) {
    setIssueError('Network error.');
  }
};
  
// Helper to get not returned components for re-issue
function getNotReturnedComponents(issued, returned) {
  console.log('Calculating not returned components...');
  console.log('Issued components:', issued);
  console.log('Returned components:', returned);
  return issued.map(issuedItem => {
    const totalIssued = issuedItem.quantity || issuedItem.issuedQuantity || 0;
    const name = issuedItem.name || issuedItem.issuedProductId?.product_name;
    // Sum returned and replaced from the flat returned array
    const relatedReturns = (returned || []).filter(ret => ret.issuedProductId === issuedItem.id);
    const totalReturned = relatedReturns.reduce((sum, ret) => sum + (ret.returnedQuantity || 0), 0);
    const totalReplaced = relatedReturns.reduce((sum, ret) => sum + (ret.replacedQuantity || 0), 0);
    const notReturned = totalIssued - totalReturned + totalReplaced;
    // Debug print
    console.log(`[DEBUG] ${name}: issued=${totalIssued}, returned=${totalReturned}, replaced=${totalReplaced}, notReturned=${notReturned}`);
    return {
      name,
      quantity: notReturned
    };
  }).filter(item => item.quantity > 0);
}

function getInitialReturnDate(collectedDate, adminApprovedDays) {
  console.log('Collected Date:', collectedDate);
  console.log('Admin Approved Days:', adminApprovedDays);
  if (!collectedDate || !adminApprovedDays) return "-";
  const date = new Date(collectedDate);
  date.setDate(date.getDate() + Number(adminApprovedDays));
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function getPreviousReturnDate(issueDate, adminApprovedDays) {
  if (!issueDate || !adminApprovedDays) return null;
  const date = new Date(issueDate);
  date.setDate(date.getDate() + Number(adminApprovedDays));
  return date;
}
function formatDateShort(dateObj) {
  if (!dateObj) return "-";
  return dateObj.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// 

  // --- Admin Issue Table Handlers ---
  const handleIncrementQuantity = (id) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        const product = products.find(p => p.name === component.name);
        const maxStock = product ? product.inStock : 0;
        const newQuantity = Math.min(component.quantity + 1, maxStock);
        return { ...component, quantity: newQuantity };
      }
      return component;
    }));
  };
  const handleDecrementQuantity = (id) => {
    setAdminIssueComponents(prev =>
      prev
        .map(component => {
          if (component.id === id) {
            const newQuantity = Math.max(component.quantity - 1, 0);
            return { ...component, quantity: newQuantity };
          }
          return component;
        })
        .filter(component => component.quantity > 0) 
    );
  };
  const handleNameChange = useCallback((id, newName) => {
    const product = products.find(p => p.name === newName);
    const newId = product ? product._id : id;
    const initialQty = product && product.inStock > 0 ? 1 : 0;
    setAdminIssueComponents(prev => prev.map(component => {
      if (component.id === id) {
        return { ...component, id: newId, name: newName, quantity: initialQty };
      }
      return component;
    }));
    setDropdownOpen(prev => ({ ...prev, [id]: false }));
  }, [products]);

  const handleQuantityChange = useCallback((id, newQuantity) => {
    setAdminIssueComponents(prev => prev.map(component => {
      if (component.id === id) {
        const product = products.find(p => p.name === component.name);
        const maxStock = product ? product.inStock : 0;
        const limitedQuantity = Math.min(Math.max(0, parseInt(newQuantity) || 0), maxStock);
        return { ...component, quantity: limitedQuantity };
      }
      return component;
    }));
  }, [products]);
    
  const toggleDropdown = useCallback((id) => {
    setDropdownOpen(prev => {
      const isCurrentlyOpen = prev[id];
      
      if (isCurrentlyOpen) {
        // If clicking the same dropdown, just close it
        return { ...prev, [id]: false };
      } else {
        // Close all others and open the clicked one
        const newState = Object.keys(prev).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {});
        return { ...newState, [id]: true };
      }
    });
  }, []);

  const handleSearchChange = (id, value) => {
    setSearchTerm(prev => ({ ...prev, [id]: value }));
  };
  const handleDeleteComponent = (id) => {
    setAdminIssueComponents(adminIssueComponents.filter (component => component.id !== id));
  };
const handleAddComponent = () => {
  if (isCollected) {
    setCollectedError('Components already issued. You cannot add more.');
    return;
  }
  setAdminIssueComponents([
    ...adminIssueComponents,
    { id: '', name: '', quantity: 0, description: '' }
  ]);
};

const handleResetComponents = () => {
  if (isCollected) {
    setCollectedError('Components already issued. You cannot reset.');
    return;
  }
  if (requestData) {
    setAdminIssueComponents([...requestData.components]);
    setIssuableDays(requestData.requestedDays || 7);
  }
};

const handleIssuableDaysChange = (value) => {
  if (isCollected) {
    setCollectedError('Components already issued. You cannot change duration.');
    return;
  }
  const newDays = Math.min(Math.max(0, parseInt(value) || 1), 30);
  setIssuableDays(newDays);
};
const handleIncrementDays = () => {
  if (isCollected) {
    setCollectedError('Components already issued. You cannot change duration.');
    return;
  }
  setIssuableDays(prev => Math.min(prev + 1, 30));
};
const handleDecrementDays = () => {
  if (isCollected) {
    setCollectedError('Components already issued. You cannot change duration.');
    return;
  }
  setIssuableDays(prev => Math.max(prev - 1, 1));
};

  // --- Action Handlers ---
  const handleActionClick = (actionType) => {
    // Check if date and time are selected
    if (!adminAvailableDate || !adminAvailableTime) {
      setShowDateTimeWarning(true);
      return;
    }

    // Check if selected datetime is in the future
    if (!isValidDateTime(adminAvailableDate, adminAvailableTime)) {
      // The warning will already be shown by the JSX, just return
      return;
    }

    setShowDateTimeWarning(false);
    setAction(actionType);
  };

  const handleSubmit = async () => {
  if (action === 'accept') {
    const requestId = searchParams.get('requestId');
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found in localStorage');
      router.push('/auth/login');
      return;
    }

    const scheduledCollectionDate = formatScheduledCollectionDate(adminAvailableDate, adminAvailableTime);

    const payload = {
      adminApprovedDays: issuableDays, // Set the number of approved days
      issued: adminIssueComponents.map(component => ({
        issuedProductId: component.id,
        issuedQuantity: component.quantity
      })),
      adminReturnMessage: responseMessage,
      scheduledCollectionDate // Set the current date/time
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/approve/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to approve request:', errorData.message);
        return;
      }

      const data = await response.json();
      console.log('Request approved successfully:', data);
      // Update the request data state or perform any other actions needed
      setRequestData(prev => ({ ...prev, status: 'accepted' }));
      setShowSuccess(true);
      setAction(null); 
    } catch (error) {
      console.error('Error during API call:', error);
    }
  }

  if (action === 'decline') {
    const requestId = searchParams.get('requestId');
    const token = localStorage.getItem('token');
      const payload = {
      adminReturnMessage: responseMessage || "Insufficient amount of products" 
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/reject/${requestId}`, {
        method: 'POST', // Use POST for rejecting
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to reject request:', errorData.message);
        return;
      }
      const data = await response.json();
      console.log('Request rejected successfully:', data);
      // Update the request data state or perform any other actions needed
      setRequestData(prev => ({ ...prev, status: 'rejected' }));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error during API call:', error);
    }
  }
};

const issuing = async () => {
  const requestId = searchParams.get('requestId');
  const token = localStorage.getItem('token');

  if (!requestId || !token) {
    console.error('Missing requestId or token');
    return;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/collect/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
    } else {
      const data = await response.json();
      setShowSuccess(true);
      // Set CollectedDate in state to disable UI
      setRequestData(prev => ({
        ...prev,
        CollectedDate: new Date().toISOString()
      }));
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

  // --- Status Badge ---
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
      </span>
    );
  };

  // --- Component Dropdown ---
  // Replace your ComponentDropdown component with this fixed version:

const ComponentDropdown = ({ id, selectedValue }) => {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Move search term to local state to prevent parent re-renders
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  const existingComponentNames = adminIssueComponents
    .filter(component => component.id !== id && component.name)
    .map(component => component.name);
  
  // Use local search term instead of parent state
  const filteredProducts = products
    .filter(product =>
      product.inStock > 0 &&
      !existingComponentNames.includes(product.name) &&
      product.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );

  // Handle click outside with useCallback to prevent re-creation
  const handleClickOutside = useCallback((event) => {
    if (
      dropdownOpen[id] &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      toggleDropdown(id);
    }
  }, [dropdownOpen[id], id, toggleDropdown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Focus input only when dropdown first opens - with delay to prevent scroll
  useEffect(() => {
    if (dropdownOpen[id]) {
      // Reset local search when opening
      setLocalSearchTerm('');
      
      // Delay focus to prevent scroll issues
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 10);
      
      return () => clearTimeout(focusTimer);
    }
  }, [dropdownOpen[id], id]);

  // Handle input change without triggering parent re-renders
  const handleInputChange = (e) => {
    e.stopPropagation();
    setLocalSearchTerm(e.target.value);
  };

  // Handle name selection
  const handleNameSelect = (productName) => {
    handleNameChange(id, productName);
    setLocalSearchTerm(''); // Reset search term after selection
  };

  // Handle button click with scroll prevention
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown(id);
  };

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        className="w-full px-3 py-2 rounded-md border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
        onClick={handleButtonClick}
      >
        <span>{selectedValue || 'Select component'}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {dropdownOpen[id] && (
        <DropdownPortal targetRef={buttonRef}>
          <div ref={dropdownRef} className="bg-white shadow-md rounded-md mt-1">
            <div className="p-2 border-b border-gray-200">
              <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent border-none focus:outline-none text-sm"
                  placeholder="Search components..."
                  value={localSearchTerm}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product.name}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                    onClick={() => handleNameSelect(product.name)}
                  >
                    <span>{product.name}</span>
                    <span className="text-sm text-gray-500">Stock: {product.inStock}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  {localSearchTerm ? 'No matching components' : 'All components already added'}
                </div>
              )}
            </div>
          </div>
        </DropdownPortal>
      )}
    </div>
  );
};

  if (!requestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Table configs
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
    { key: 'actions', label: 'Actions' }
  ];
  const isCollected = !!(requestData.CollectedDate || requestData.collectedDate);
  console.log('Is collected:', isCollected);
  const adminComponentsRows = adminIssueComponents.map(component => {
    const product = products.find(p => p.name === component.name);
    const maxStock = product ? product.inStock : 0;
    return {
      ...component,
      name: (
        <ComponentDropdown
          id={component.id}
          selectedValue={component.name}
          isCollected={isCollected} // optionally pass as prop
        />
      ),
 quantity: (
  <div className="flex items-center justify-center space-x-2">
    <button
      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => handleDecrementQuantity(component.id)}
      disabled={component.quantity <= 0 || !component.name || isCollected}
    >
      <Minus className="w-4 h-4" />
    </button>
    <input
      type="text"
      className="w-16 px-2 py-1 text-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      min="0"
      max={maxStock}
      value={component.quantity}
      onChange={(e) => handleQuantityChange(component.id, e.target.value)}
      disabled={isCollected || !component.name}
    />
    <button
      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => handleIncrementQuantity(component.id)}
      disabled={component.quantity >= maxStock || !component.name || isCollected}
    >
      <Plus className="w-4 h-4" />
    </button>
    <span className="text-xs text-gray-500 ml-1">
      Available: {component.name ? maxStock : 'N/A'}
    </span>
    {/* Show warning if issued < requested */}
    {(() => {
      const userRequested = requestData.components.find(c => c.id === component.id)?.quantity || 0;
      return component.quantity < userRequested ? (
        <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" title="Issued quantity is less than requested!" />
      ) : null;
    })()}
  </div>
),
      actions: (
        <button
          className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition duration-150"
          onClick={() => handleDeleteComponent(component.id)}
          title="Delete"
          disabled={isCollected}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )
    };
  });


  const getCurrentDateTime = () => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return { currentDate, currentTime };
};

const isValidDateTime = (selectedDate, selectedTime) => {
  if (!selectedDate || !selectedTime) return false;
  
  const now = new Date();
  const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
  
  // Add a small buffer (1 minute) to account for processing time
  const minAllowedTime = new Date(now.getTime() + 60000);
  
  return selectedDateTime >= minAllowedTime;
};


  // --- Re-Issue Table Config ---
  const reissueColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'status', label: 'Status' }
  ];
  const reissueRows = requestData.components.map(component => ({
    ...component,
    status: (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Pending Return
      </span>
    )
  }));

  // --- Main Render ---
  const isReIssue = requestData.isExtended;
  const isRejected = requestData.status === 'rejected';
  const isAccepted = requestData.status === 'approved' || requestData.status === 'accepted';


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
            <h1 className="text-3xl font-bold text-gray-800">Request Details</h1>
          </div>
          <StatusBadge status={requestData.status} />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* --- Common Header --- */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  Request #{requestData.requestId || requestData.id}
                  </h2>
                  {requestData.isExtended && (
                      <span className="inline-flex items-center px-3 py-1 mb-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        <Repeat className="w-4 h-4 mr-1" />
                        Extension / Re-Issue Request
                      </span>
                    )}
                {/* --- Add Timeline Here --- */}
                <div className="mt-5">
                  <RequestTimeline
                    requestData={requestData}
                    reissue={requestData.reIssueRequest || []}
                    formatDate={formatDate}
                    timelineItems={[
                      {
                        label: "Initial Request",
                        date: requestData.requestedDate,
                        isCompleted: !!requestData.requestedDate,
                      },
                      {
                        label: "accepted",
                        date: requestData.issuedDate, // <-- use issuedDate
                        isCompleted: !!requestData.issuedDate,
                      },
                      {
                        label: "issued",
                        date: requestData.collectedDate, // <-- use collectedDate
                        isCompleted: !!requestData.collectedDate,
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className={`w-3 h-3 rounded-full ${requestData.isFaculty ? 'bg-green-500' : 'bg-blue-500'} mr-2`}></div>
                  <span className="font-medium">{requestData.isFaculty ? 'Faculty' : 'Student'} Request</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- User and Reference Info --- */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Reference Staff
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-32">Name:</span>
                  <span className="font-medium">{requestData.referenceStaff?.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Email:</span>
                  <span className="font-medium">{requestData.referenceStaff?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Main Section: Re-Issue or New Request --- */}
          {isReIssue ? (
            <>
              <div className="p-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Requested Components Table */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          Original Requested Components
                        </h2>
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-medium text-gray-700">Requested Days</h4>
                          </div>
                          <div className="flex flex-col items-start bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
    <div>
      <Clock className="w-4 h-4 mr-1 inline" />
      <span>{requestData.requestedDays || "N/A"} Days</span>
    </div>
  </div>
                        </div>
                      </div>
                      <Table
                        columns={requestedComponentsColumns}
                        rows={requestedComponentsRows}
                        currentPage={1}
                        itemsPerPage={10}
                      />
                    </div>
                  </div>

                  {/* Admin Issue Components Table (Read-only) */}
                  
                  <div className="bg-white shadow rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          Admin Issued Components
                        </h2>
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-medium text-gray-700">Issued Days</h4>
                          </div>
                          <div className="flex flex-col items-start bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
    <div>
      <Clock className="w-4 h-4 mr-1 inline" />
      <span>{requestData.adminApprovedDays || "N/A"} Days</span>
    </div>
  </div>
                        </div>
                      </div>
<Table
  columns={[
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ]}
  rows={adminIssueComponents
    .filter(({ quantity }) => quantity > 0)
    .map(({ name, quantity, id }) => {
      // Calculate replaced count from returnedComponents
      const replaced = requestData.returnedComponents
        ? requestData.returnedComponents
            .filter(ret => ret.issuedProductId === id)
            .reduce((sum, ret) => sum + (ret.replacedQuantity || 0), 0)
        : 0;
      // DEBUG LOG
      console.log(`[DEBUG] AdminIssuedTable: name=${name}, issued=${quantity}, replaced=${replaced}`);

      return {
        name,
        quantity: (
          <span>
            {quantity}
            {replaced > 0 && (
              <span className="text-xs text-gray-500"> + {replaced}</span>
            )}
          </span>
        )
      };
    })
  }
  currentPage={1}
  itemsPerPage={10}
/>
                    </div>
                  </div>
                </div>
              </div>
    
  
            </>
          ) : (
            <>
              {/* --- New Request UI --- */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Requested Components
                </h3>
                <div className="overflow-x-auto">
                  <Table
                    columns={requestedComponentsColumns}
                    rows={requestedComponentsRows}
                    currentPage={1}
                    itemsPerPage={10}
                  />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <h4 className="font-medium text-gray-700">Request Description</h4>
                    </div>
                    <p className="text-gray-600">{requestData.userMessage || "No description provided."}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-end gap-4">
                      <div className="flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                        <h4 className="font-medium text-gray-700">Requested Days</h4>
                      </div>
                      <div className="flex flex-col items-start bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
    <div>
      <Clock className="w-4 h-4 mr-1 inline" />
      <span>{requestData.requestedDays || "N/A"} Days</span>
    </div>
  </div>
                    </div>
                  </div>
                </div>
                  {requestData.status === "accepted" && requestData.originalAdminMessage && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        <h4 className="font-medium text-green-700">Admin Approval Message</h4>
                      </div>
                      <p className="text-gray-700">{requestData.originalAdminMessage}</p>
                    </div>
                  )}
              </div>

              {/* --- Admin Issue Components --- */}
            {!isRejected && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Admin Issued Components
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetComponents}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      disabled={isCollected}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </button>
                    <button
                      onClick={handleAddComponent}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      disabled={isCollected}
                      >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Component
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                  <Table
                    columns={adminComponentsColumns}
                    rows={adminComponentsRows}
                    currentPage={1}
                    itemsPerPage={10}
                    customClasses={{ table: "min-w-full divide-y divide-gray-200" }}
                  />
                  {adminIssueComponents.length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500">No components added. Click &ldquo;Add Component&rdquo; to add one.</p>
                    </div>
                  )}
                </div>
                {/* Submit Button for Admin Issued Components */}
                  <>
                    <div className="flex justify-end mt-4">
                       {issueError && (
    <div className="text-red-600 font-medium mb-2 mr-4">{issueError}</div>
  )}
                {!isCollected && (
  <button
    className="inline-flex items-center px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
    onClick={handleSave}
  >
    <CheckCircle className="w-5 h-5 mr-2" />
    Save Issued Components
  </button>
)}
                    </div>

                    {showSuccess && (
                      <SuccessAlert
                        message="Issued components saved!"
                        description="Changes have been successfully recorded."
                        onClose={() => setShowSuccess(false)}
                      />
                    )}
                  </>
                {/* Issuable days */}
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-medium text-blue-700">Issuable Days</h4>
                  </div>
                  <div className="flex items-center mt-2 gap-4">
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium">{requestData.requestedDays || "7"} Days</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <span className="text-gray-600 w-32">Issue Duration:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleDecrementDays}
                        disabled={issuableDays <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        className="w-16 px-2 py-1 text-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="30"
                        value={issuableDays}
                        onChange={(e) => handleIssuableDaysChange(e.target.value)}
                      />
                      <button
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleIncrementDays}
                        disabled={issuableDays >= 30}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium">Days</span>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </>
          )}

          {/* --- Take Action Section --- */}
          {isAccepted && requestData.CollectedDate == null && !isReIssue ? (
          <div className="p-6 border-t border-gray-200 flex flex-col items-start">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base font-medium text-green-800">
                Request is <span className="font-semibold">approved</span> and pending issuance.
              </h3>
            </div>
            {/* Only show the button if not in confirmation mode */}
            {action !== 'issued' ? (
              <button
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors duration-150"
                onClick={() => setAction('issued')}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Issued
              </button>
            ) : (
              // Only show the confirmation modal if action === 'issued'
              <div className="w-full bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-md">
                <div className="mb-5">
                  <div className="flex items-center mb-4">
                    <div className="h-11 w-11 rounded-full flex items-center justify-center mr-4 text-white bg-indigo-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Issue Request
                      </h4>
                      <p className="text-sm text-gray-600">
                        You are about to <span className="text-indigo-700 font-medium">mark this request as issued</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    onClick={async () => {
                      issuing();
                      setIsSubmitting(true);
                      setTimeout(() => {
                        setRequestData({
                          ...requestData,
                          CollectedDate: new Date().toISOString(),
                          ResponseMessage: responseMessage 
                        });
                        setAction(null);
                        setIsSubmitting(false);
                      }, 1000);
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Confirm & Issue'
                    )}
                  </button>

                  <button
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                    onClick={() => setAction(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : requestData.status === 'pending' ? (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Take Action
            </h3>
            {!action ? (
              <>
                <div className="p-6 pt-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Availability</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Available Date</label>
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={adminAvailableDate}
                        min={getCurrentDateTime().currentDate} // Disable past dates
                        onChange={e => {
                          setAdminAvailableDate(e.target.value);
                          // Reset time if date changes to ensure validation
                          if (adminAvailableTime && !isValidDateTime(e.target.value, adminAvailableTime)) {
                            setAdminAvailableTime('');
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Available Time</label>
                      <input
                        type="time"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={adminAvailableTime}
                        min={
                          adminAvailableDate === getCurrentDateTime().currentDate 
                            ? getCurrentDateTime().currentTime 
                            : undefined
                        } // Only set min time if selected date is today
                        onChange={e => setAdminAvailableTime(e.target.value)}
                        disabled={!adminAvailableDate} // Disable time selection until date is chosen
                      />
                    </div>
                  </div>

                  {/* Enhanced warning messages */}
                  {showDateTimeWarning && (
                    <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <span>Please select both date and time to proceed with the action.</span>
                    </div>
                  )}

                  {/* New validation warning for past datetime */}
                  {adminAvailableDate && adminAvailableTime && !isValidDateTime(adminAvailableDate, adminAvailableTime) && (
                    <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <span>Please select a future date and time. Past appointments cannot be scheduled.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors duration-150 group disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                      onClick={() => handleActionClick('accept')}
                      disabled={!adminAvailableDate || !adminAvailableTime || !isValidDateTime(adminAvailableDate, adminAvailableTime)}
                      aria-label="Accept Request"
                      title="Accept this request"
                    >
                      <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Accept
                    </button>

                    <button
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-150 group disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                      onClick={() => handleActionClick('decline')}
                      disabled={!adminAvailableDate || !adminAvailableTime || !isValidDateTime(adminAvailableDate, adminAvailableTime)}
                      aria-label="Decline Request"
                      title="Decline this request"
                    >
                      <XCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Reject
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      action === 'accept' ? 'bg-green-100 text-green-600'
                        : action === 'decline' ? 'bg-red-100 text-red-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {action === 'accept' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : action === 'decline' ? (
                        <XCircle className="w-6 h-6" />
                      ) : (
                        <CheckCircle className="w-6 h-6" />
                      )}
                    </div>
                    <h4 className="text-lg font-medium">
                      You are about to {action === 'accept'
                        ? 'accept'
                        : action === 'decline'
                        ? 'decline'
                        : 'issue'} this request
                    </h4>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Message</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter response message to the requester..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                </div>
                {validationMessage && (
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-md mb-4 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{validationMessage}</span>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      action === 'accept' ? 'bg-green-600 hover:bg-green-700'
                        : action === 'decline' ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        {action === 'accept'
                          ? 'Confirm & Accept'
                          : action === 'decline'
                          ? 'Confirm & Decline'
                          : 'Confirm & Issue'}
                      </>
                    )}
                  </button>
                  <button
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    onClick={() => setAction(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {isRejected && (
          <div className="px-6 pt-4 pb-6 border-t border-gray-200">
            <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-base sm:text-lg font-semibold text-red-700 leading-tight">
                  Request Rejected
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {requestData.adminMessage
                    ? requestData.adminMessage
                    : "This request was rejected by the admin."}
                </p>
              </div>
            </div>
          </div>
        )}

        {isReIssue && requestData.reIssueRequest && (
  <>
    {/* --- Existing Re-Issue UI --- */}

    {/* Show both original and re-issue descriptions */}
    <div className="p-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          <h4 className="font-medium text-blue-700">Original Request Description</h4>
        </div>
        <p className="text-gray-600">{requestData.userMessage || "No description provided."}</p>
        {/* Show admin return message if present */}
        {requestData.adminMessage && (
          <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              <h4 className="font-medium text-green-700">Admin Return Message</h4>
            </div>
            <p className="text-gray-700">{requestData.adminMessage}</p>
          </div>
        )}
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Repeat className="w-5 h-5 mr-2 text-yellow-600" />
          <h4 className="font-medium text-yellow-700">Re-Issue User Note</h4>
        </div>
        <p className="text-gray-700">{requestData.reIssueRequest.requestDescription || "No re-issue note provided."}</p>
<div className="mt-4 flex flex-col gap-2">
  <div className="flex items-center gap-2">
    <CalendarDays className="w-4 h-4 text-blue-600" />
    <span className="text-gray-600">Requested Days:</span>
    <span className="font-semibold text-gray-800">{requestData.reIssueRequest.requestedDays}</span>
  </div>
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4 text-indigo-600" />
    <span className="text-gray-600">Initial Return Date:</span>
    <span className="font-semibold text-gray-800">
      {getInitialReturnDate(requestData.issueDate, requestData.adminApprovedDays)}
    </span>
  </div>
</div>
      </div>
    </div>

    {/* Show Not Returned Components Table ONLY if re-issue is pending */}
    {requestData.reIssueRequest.status === 'pending' && (
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center">
          <Repeat className="w-5 h-5 mr-2 text-indigo-600" />
          Re-Issue Request Components (Not Returned)
        </h3>
        <Table
          columns={[
            { key: 'name', label: 'Component Name' },
            { key: 'quantity', label: 'Not Returned' }
          ]}
       rows={getNotReturnedComponents(requestData.adminIssueComponents, requestData.returnedComponents)}   
          currentPage={1}
          itemsPerPage={10}
        />
{requestData.reIssueRequest.status === 'pending' && showReissueDuration && (
  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 w-full">
    <div className="flex items-center space-x-3">
      <CalendarDays className="w-5 h-5 text-blue-600" />
      <h4 className="font-medium text-blue-700">Issue Duration</h4>
      <button
        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
        onClick={handleDecrementDays}
        disabled={issuableDays <= 1}
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="text"
        className="w-16 px-2 py-1 text-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        min="1"
        max="30"
        value={issuableDays}
        onChange={(e) => handleIssuableDaysChange(e.target.value)}
      />
      <button
        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
        onClick={handleIncrementDays}
        disabled={issuableDays >= 30}
      >
        <Plus className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium">Days</span>
    </div>
  </div>
)}
    </div>
    )}

    {/* Accept/Decline Buttons */}
{requestData.reIssueRequest.status === 'pending' && showReissueActions && !reissueAction && (
  <div className="p-6 border-t border-gray-200 flex gap-4">
    <button
      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
onClick={() => {
  setReissueAction('accept');
  setReissueMessage('Your re-issue request has been approved.');
  // Get the previous return date (initial return date)
  const prevReturnDateObj = getPreviousReturnDate(requestData.issueDate, requestData.adminApprovedDays);
  let finalReturnDate = "-";
  if (prevReturnDateObj) {
    const newDate = new Date(prevReturnDateObj);
    newDate.setDate(newDate.getDate() + Number(issuableDays));
    finalReturnDate = formatDateShort(newDate);
  }
  setReissueSummary({
    status: 'accepted',
    days: issuableDays,
    message: 'Your re-issue request has been approved.',
    returnDate: finalReturnDate
  });
}}
    >
      <CheckCircle className="w-5 h-5 mr-2" />
      Accept Re-Issue
    </button>
    <button
      className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
      onClick={() => {
        setReissueAction('decline');
        setReissueMessage('Your re-issue request has been declined due to unavailability , Return components on original return date.');
        setReissueSummary({
          status: 'declined',
          days: '-',
          message: 'Your re-issue request has been declined due to unavailability , Return components on original return date.',
          returnDate: getInitialReturnDate(requestData.issueDate, requestData.adminApprovedDays)
        });
      }}
    >
      <XCircle className="w-5 h-5 mr-2" />
      Decline Re-Issue
    </button>
  </div>
)}


{reissueSummary && reissueSummary.resStatus === 200 && (
  <div
    className={`mt-8 w-full rounded-2xl border shadow-lg px-0 py-0 overflow-hidden
      ${reissueSummary.status === 'accepted'
        ? 'bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-green-300'
        : 'bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-300'
      }`}
    style={{ maxWidth: "100%" }}
  >
    {/* Header */}
    <div className={`flex items-center gap-4 px-8 py-6 border-b ${reissueSummary.status === 'accepted' ? 'border-green-200' : 'border-red-200'} bg-white`}>
      <div className={`flex items-center justify-center rounded-full h-16 w-16 shadow ${reissueSummary.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'}`}>
        {reissueSummary.status === 'accepted' ? (
          <CheckCircle className="w-10 h-10 text-green-600" />
        ) : (
          <XCircle className="w-10 h-10 text-red-600" />
        )}
      </div>
      <div>
        <div className={`text-2xl font-extrabold tracking-wide ${reissueSummary.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
          Re-Issue {reissueSummary.status === 'accepted' ? 'Accepted' : 'Rejected'}
        </div>
        <div className="text-gray-500 text-sm mt-1">
          {reissueSummary.status === 'accepted'
            ? 'The re-issue request has been approved. See details below.'
            : 'The re-issue request has been declined. See details below.'}
        </div>
      </div>
    </div>
    {/* Details */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-gradient-to-r from-white via-transparent to-white">
      <div className="flex flex-col items-center md:items-start px-8 py-7">
        <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
          <Repeat className="w-4 h-4 text-indigo-400" />
          Re-Issue Days
        </div>
        <div className="font-bold text-2xl text-gray-900">{reissueSummary.days}</div>
      </div>
      <div className="flex flex-col items-center md:items-start px-8 py-7">
        <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-400" />
          Return Date
        </div>
        <div className="font-bold text-2xl text-gray-900">{reissueSummary.returnDate}</div>
      </div>
      <div className="flex flex-col items-center md:items-start px-8 py-7">
        <div className="text-gray-500 text-sm mb-1 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Admin Message
        </div>
        <div className="bg-white border border-gray-200 rounded-md px-4 py-3 text-gray-800 text-base w-full shadow-sm">
          {reissueSummary.message}
        </div>
      </div>
    </div>
  </div>
)}

    {/* Confirmation Card - Styled like Take Action */}
    {requestData.reIssueRequest.status === 'pending' && reissueAction && (
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mt-4">
        <div className="mb-4 flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
            reissueAction === 'accept' ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600'
          }`}>
            {reissueAction === 'accept'
              ? <CheckCircle className="w-6 h-6" />
              : <XCircle className="w-6 h-6" />}
          </div>
          <h4 className="text-lg font-medium">
            You are about to {reissueAction === 'accept' ? 'accept' : 'decline'} this re-issue request
          </h4>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {reissueAction === 'accept' ? 'Approval Message' : 'Decline Reason'}
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          rows={3}
          placeholder={reissueAction === 'accept'
            ? 'Enter approval message for the requester...'
            : 'Enter reason for declining the re-issue...'}
          value={reissueMessage}
          onChange={e => setReissueMessage(e.target.value)}
        />
        <div className="flex space-x-4">
          <button
            className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              reissueAction === 'accept'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            disabled={isReissueSubmitting}
            onClick={async () => {
              setIsReissueSubmitting(true);
              await handleReIssueAction(reissueAction, reissueMessage);
              setIsReissueSubmitting(false);
              setReissueAction(null);
              setReissueMessage('');
            }}
          >
            {isReissueSubmitting ? 'Processing...' : (
              reissueAction === 'accept'
                ? 'Confirm & Accept'
                : 'Confirm & Decline'
            )}
          </button>
          <button
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm textBase font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            onClick={() => {
              setReissueAction(null);
              setReissueMessage('');
            }}
            disabled={isReissueSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </>
)}


        </div>
      </div>
    </div>
  );
};

export default function AdminRequestView() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminRequestViewContent />
    </Suspense>
  );
}
