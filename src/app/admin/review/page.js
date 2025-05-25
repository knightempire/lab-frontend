'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Table from '../../../components/table';
import LoadingScreen from '../../../components/loading/loadingscreen';
import DropdownPortal from '../../../components/dropDown';
import SuccessAlert from '../../../components/SuccessAlert';
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

  const [showSuccess, setShowSuccess] = useState(false);



  useEffect(() => {
    const requestId = searchParams.get('requestId');
    console.log('requestId:', requestId);

         const token = localStorage.getItem('token'); 
        if (!token) {
          console.error('No token found in localStorage');
          router.push('/auth/login'); 
          return;
        } 

    fetchProducts();

    const fetchRequestData = async () => {
      try {
   
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/get/${requestId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          localStorage.remove('token'); 
          router.push('/auth/login');
        }

        const apiResponse = await response.json();
        const data = apiResponse.request; 

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
            replacedQuantity: 0, 
          })),
          returnedComponents: [], 
          reIssueRequest: null, 
        };

        setRequestData(mappedData);
        setIssuableDays(mappedData.requestedDays);
        console.log('Request Data:', mappedData);
        console.log('usermessage:', mappedData.userMessage);
         setAdminIssueComponents(prev =>
      !prev || prev.length === 0
        ? mappedData.components.map((c, idx) => ({
            id: c.id , // Use index as fallback ID
            name: c.name,
            quantity: c.quantity,
            description: c.description || ''
          }))
        : prev
    );
      } catch (error) {
        console.error('Error fetching request data:', error);
        router.push('/admin/request');
      }
    };

    if (requestId) {
      fetchRequestData();
    } else {
      router.push('/admin/request');
    }
  }, [searchParams, router]);




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

const handleSave = () => {
  console.log("Total components issued:", adminIssueComponents.length);

  // Print each issued component with product ID and details
  adminIssueComponents.forEach(component => {
    console.log(`Product ID: ${component.id}, Name: ${component.name}, Quantity: ${component.quantity}`);
  });

  const currentstatus = requestData.status;
  if (currentstatus === 'pending') {
    console.log("Request is pending, proceeding to save.");
  }
  
  setShowSuccess(true);
};

  
  // --- Admin Issue Table Handlers ---
  const handleQuantityChange = (id, newQuantity) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        const product = products.find(p => p.name === component.name);
        const maxStock = product ? product.inStock : 0;
        const limitedQuantity = Math.min(Math.max(0, parseInt(newQuantity) || 0), maxStock);
        return { ...component, quantity: limitedQuantity };
      }
      return component;
    }));
  };
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
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        const newQuantity = Math.max(component.quantity - 1, 0);
        return { ...component, quantity: newQuantity };
      }
      return component;
    }));
  };
  const handleNameChange = (id, newName) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        const product = products.find(p => p.name === newName);
        const initialQty = product && product.inStock > 0 ? 1 : 0;
        return { ...component, name: newName, quantity: initialQty };
      }
      return component;
    }));
    setDropdownOpen(prev => ({ ...prev, [id]: false }));
    setSearchTerm(prev => ({ ...prev, [id]: '' }));
  };
  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleSearchChange = (id, value) => {
    setSearchTerm(prev => ({ ...prev, [id]: value }));
  };
  const handleDeleteComponent = (id) => {
    setAdminIssueComponents(adminIssueComponents.filter(component => component.id !== id));
  };
  const handleAddComponent = () => {
    const newId = Math.max(0, ...adminIssueComponents.map(c => c.id)) + 1;
    setAdminIssueComponents([
      ...adminIssueComponents,
      { id: newId, name: '', quantity: 0, description: '' }
    ]);
  };
  const handleResetComponents = () => {
    if (requestData) {
      setAdminIssueComponents([...requestData.components]);
      setIssuableDays(requestData.requestedDays || 7);
    }
  };
  const handleIssuableDaysChange = (value) => {
    const newDays = Math.min(Math.max(0, parseInt(value) || 1), 30);
    setIssuableDays(newDays);
  };
  const handleIncrementDays = () => setIssuableDays(prev => Math.min(prev + 1, 30));
  const handleDecrementDays = () => setIssuableDays(prev => Math.max(prev - 1, 1));

  // --- Action Handlers ---
  const handleActionClick = (actionType) => {
    setAction(actionType);
    setResponseMessage(
      actionType === 'accept'
        ? 'Your request has been approved.'
        : 'Due to component shortage, your request has been declined.'
    );
  };
  const handleSubmit = async () => {
    if (!requestData.isExtended && action === 'accept') {
      if (adminIssueComponents.length === 0) {
        setValidationMessage('Please add at least one component before accepting the request.');
        return;
      }
      const invalidComponents = adminIssueComponents.filter(
        component => !component.name || component.quantity <= 0
      );
      if (invalidComponents.length > 0) {
        setValidationMessage('Please fill in all component details (name and quantity) before accepting the request.');
        return;
      }
    }
    setValidationMessage('');
    setIsSubmitting(true);
    try {
      setTimeout(() => {
        alert(`Request ${action === 'accept' ? 'approved' : 'declined'} successfully!`);
        setRequestData({
          ...requestData,
          status: action === 'accept' ? 'accepted' : 'rejected'
        });
        setAction(null);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      alert('Failed to process request. Please try again.');
      setIsSubmitting(false);
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
  const ComponentDropdown = ({ id, selectedValue }) => {
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const existingComponentNames = adminIssueComponents
      .filter(component => component.id !== id && component.name)
      .map(component => component.name);
  const filteredProducts = products
    .filter(product =>
      !existingComponentNames.includes(product.name) &&
      product.name.toLowerCase().includes((searchTerm[id] || '').toLowerCase())
    );
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownOpen[id] &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          toggleDropdown(id);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen, id]);
    return (
      <div className="relative">
        <div
          ref={buttonRef}
          className="w-full px-3 py-2 rounded-md border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
          onClick={() => toggleDropdown(id)}
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
                    type="text"
                    className="w-full bg-transparent border-none focus:outline-none text-sm"
                    placeholder="Search components..."
                    value={searchTerm[id] || ''}
                    onChange={(e) => handleSearchChange(id, e.target.value)}
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
                      onClick={() => handleNameChange(id, product.name)}
                    >
                      <span>{product.name}</span>
                      <span className="text-sm text-gray-500">Stock: {product.inStock}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    {searchTerm[id] ? 'No matching components' : 'All components already added'}
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
  const adminComponentsRows = adminIssueComponents.map(component => {
    const product = products.find(p => p.name === component.name);
    const maxStock = product ? product.inStock : 0;
    return {
      ...component,
      name: (
        <ComponentDropdown
          id={component.id}
          selectedValue={component.name}
        />
      ),
      quantity: (
        <div className="flex items-center justify-center space-x-2">
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleDecrementQuantity(component.id)}
            disabled={component.quantity <= 0 || !component.name}
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
            disabled={!component.name}
          />
          <button
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleIncrementQuantity(component.id)}
            disabled={component.quantity >= maxStock || !component.name}
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 ml-1">
            Available: {component.name ? maxStock : 'N/A'}
          </span>
        </div>
      ),
      actions: (
        <button
          className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition duration-150"
          onClick={() => handleDeleteComponent(component.id)}
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )
    };
  });

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
                <p className="text-gray-600">
                  Requested on {formatDate(requestData.requestedDate)}
                </p>
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
                          <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{requestData.originalRequestedDays || "N/A"} Days</span>
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
                          <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{requestData.originalRequestedDays || "N/A"} Days</span>
                          </div>
                        </div>
                      </div>
                      <Table
                        columns={[
                          { key: 'name', label: 'Component Name' },
                          { key: 'quantity', label: 'Quantity' }
                        ]}
                        rows={adminIssueComponents.map(({ name, quantity }) => ({ name, quantity }))}
                        currentPage={1}
                        itemsPerPage={10}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates and User Note */}
              <div className="p-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                      <h4 className="font-medium text-gray-700">Original Request Date</h4>
                    </div>
                    <p className="text-gray-600">{formatDate(requestData.originalRequestDate || requestData.requestedDate)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                      <h4 className="font-medium text-gray-700">First Approved Date</h4>
                    </div>
                    <p className="text-gray-600">{formatDate(requestData.originalApprovedDate)}</p>
                  </div>
                </div>
                 {/* --- Admin Message from First Approval --- */}
                  {requestData.originalAdminMessage && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        <h4 className="font-medium text-green-700">Admin Message (First Approval)</h4>
                      </div>
                      <p className="text-gray-700">{requestData.originalAdminMessage}</p>
                    </div>
                  )}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-medium text-gray-700">User Note / Reason</h4>
                  </div>
                  <p className="text-gray-600">{requestData.userMessage  || "No description provided."}</p>
                </div>
              </div>

              {/* Re-Issue Request Components Table (Read-only) */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800 flex items-center">
                  <Repeat className="w-5 h-5 mr-2 text-indigo-600" />
                  Re-Issue Request Components
                </h3>
                <Table
                  columns={reissueColumns}
                  rows={reissueRows}
                  currentPage={1}
                  itemsPerPage={10}
                />
              </div>
              {/* Issuable Days (Below Re-Issue Table) */}
              <div className="p-6 border-t border-blue-100">
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
            </>
          ) : (
            <>
              {/* --- Standard New Request UI --- */}
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
                      <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{requestData.requestedDays || "7"} Days</span>
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
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Admin Issue Components
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetComponents}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </button>
                    <button
                      onClick={handleAddComponent}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                      <button
                        className="inline-flex items-center px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        onClick={handleSave}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Save Issued Components
                      </button>
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
            </>
          )}
          {/* --- Take Action Section --- */}
          {requestData.status === 'accepted' && requestData.CollectedDate === null ? (
          <div className="p-6 border-t border-gray-200 flex flex-col items-start">
              <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base font-medium text-green-800">
                Request is <span className="font-semibold">approved</span> and pending issuance.
              </h3>
            </div>
            {!action ? (
              <button
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors duration-150"
                onClick={() => setAction('issued')}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Issued
              </button>
            ) : (
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
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={adminAvailableDate}
                        onChange={e => setAdminAvailableDate(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Available Time</label>
                      <input
                        type="time"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={adminAvailableTime}
                        onChange={e => setAdminAvailableTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors duration-150 group"
                      onClick={() => handleActionClick('accept')}
                      aria-label="Accept Request"
                      title="Accept this request"
                    >
                      <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Accept
                    </button>

                    <button
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-150 group"
                      onClick={() => handleActionClick('decline')}
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
