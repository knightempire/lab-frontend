'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/table';
import { CheckCircle, XCircle, PlusCircle, RefreshCw, Trash2, FileText, Plus, Minus, CalendarDays, Clock, Search, ArrowLeft } from 'lucide-react';
const simplifiedProducts = [
  { name: "Widget A", inStock: 90 },
  { name: "Widget B", inStock: 45 },
  { name: "Widget C", inStock: 65 },
  { name: "Widget Z", inStock: 85 }
];

const AdminRequestView = () => {
  const router = useRouter();
  const [requestData, setRequestData] = useState(null);
  
  // State for admin issue table (editable)
  const [adminIssueComponents, setAdminIssueComponents] = useState([]);
  
  // State for issuable days
  const [issuableDays, setIssuableDays] = useState(7);
  
  // State for dropdown
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [searchTerm, setSearchTerm] = useState({});
  
  // Action states
  const [action, setAction] = useState(null); // 'accept' or 'decline'
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Get request data from sessionStorage that was set in the requests page
    const storedData = sessionStorage.getItem('requestData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setRequestData(parsedData);
      // Initialize admin issue components with requested components
      setAdminIssueComponents([...parsedData.components]);
      // Initialize issuable days
      setIssuableDays(parsedData.requestedDays || 7);
    } else {
      // If no data is found, redirect back to the requests page
      router.push('/admin/requests');
    }
  }, [router]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle quantity change in admin issue table
  const handleQuantityChange = (id, newQuantity) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        // Find the corresponding product in simplifiedProducts to get inStock value
        const product = simplifiedProducts.find(p => p.name === component.name);
        // Set a default max stock (e.g., 0) when no matching product is found
        const maxStock = product ? product.inStock : 0;
        
        // Ensure quantity is between 0 and maxStock
        const limitedQuantity = Math.min(Math.max(0, parseInt(newQuantity) || 0), maxStock);
        
        return {...component, quantity: limitedQuantity};
      }
      return component;
    }));
  };

  // Handle increment/decrement quantity
  const handleIncrementQuantity = (id) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        // Find the corresponding product in simplifiedProducts to get inStock value
        const product = simplifiedProducts.find(p => p.name === component.name);
        // Set a default max stock (e.g., 0) when no matching product is found
        const maxStock = product ? product.inStock : 0;
        
        // Ensure quantity doesn't exceed maxStock
        const newQuantity = Math.min(component.quantity + 1, maxStock);
        
        return {...component, quantity: newQuantity};
      }
      return component;
    }));
  };
  const handleDecrementQuantity = (id) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        // Ensure quantity doesn't go below 0
        const newQuantity = Math.max(component.quantity - 1, 0);
        
        return {...component, quantity: newQuantity};
      }
      return component;
    }));
  };

  // Handle component name change in admin issue table through dropdown
  const handleNameChange = (id, newName) => {
    setAdminIssueComponents(adminIssueComponents.map(component => {
      if (component.id === id) {
        // Find the corresponding product to get its stock
        const product = simplifiedProducts.find(p => p.name === newName);
        // Set initial quantity to 1 or 0 depending on availability
        const initialQty = product && product.inStock > 0 ? 1 : 0;
        
        return {...component, name: newName, quantity: initialQty};
      }
      return component;
    }));
    // Close the dropdown
    setDropdownOpen(prev => ({...prev, [id]: false}));
    // Reset search term
    setSearchTerm(prev => ({...prev, [id]: ''}));
  };

  // Toggle dropdown visibility
  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({...prev, [id]: !prev[id]}));
  };

  // Handle search input change
  const handleSearchChange = (id, value) => {
    setSearchTerm(prev => ({...prev, [id]: value}));
  };

  // Handle delete component from admin issue table
  const handleDeleteComponent = (id) => {
    setAdminIssueComponents(adminIssueComponents.filter(component => component.id !== id));
  };

  // Handle add new component
  const handleAddComponent = () => {
    const newId = Math.max(0, ...adminIssueComponents.map(c => c.id)) + 1;
    setAdminIssueComponents([
      ...adminIssueComponents,
      { id: newId, name: '', quantity: 0, description: '' } // Set initial quantity to 0
    ]);
  };

  // Reset admin issue components to original requested components
  const handleResetComponents = () => {
    if (requestData) {
      setAdminIssueComponents([...requestData.components]);
      setIssuableDays(requestData.requestedDays || 7);
    }
  };

  // Handle issuable days change
  const handleIssuableDaysChange = (value) => {
    // Ensure days is between 0 and 30
    const newDays = Math.min(Math.max(0, parseInt(value) || 0), 30);
    setIssuableDays(newDays);
  };

  // Handle increment/decrement issuable days
  const handleIncrementDays = () => {
    setIssuableDays(prev => Math.min(prev + 1, 30));
  };

  const handleDecrementDays = () => {
    setIssuableDays(prev => Math.max(prev - 1, 0));
  };

  // Handle action button click (accept/decline)
  const handleActionClick = (actionType) => {
    setAction(actionType);
    if (actionType === 'accept') {
      setResponseMessage('Your request has been approved.');
    } else {
      setResponseMessage('Due to component shortage, your request has been declined.');
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Replace with actual API call
      console.log('Submitting request action:', {
        requestId: requestData.id,
        action,
        responseMessage,
        adminIssueComponents: action === 'accept' ? adminIssueComponents : [],
        issuableDays: action === 'accept' ? issuableDays : null
      });
      
      // Simulate API success
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
      console.error('Error submitting request action:', error);
      alert('Failed to process request. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Status badge renderer
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
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Dropdown component renderer
  const ComponentDropdown = ({ id, selectedValue }) => {
    // Get names of components already in the table
    const existingComponentNames = adminIssueComponents
      .filter(component => component.id !== id && component.name) // Exclude current component and empty names
      .map(component => component.name);
    
    // Filter products that are not already in the table and match search term
    const filteredProducts = simplifiedProducts
      .filter(product => 
        !existingComponentNames.includes(product.name) && // Exclude products already in the table
        product.name.toLowerCase().includes((searchTerm[id] || '').toLowerCase())
      );
    
    return (
      <div className="relative">
        <div 
          className="w-full px-3 py-2 rounded-md border border-gray-300 flex justify-between items-center cursor-pointer bg-white"
          onClick={() => toggleDropdown(id)}
        >
          <span>{selectedValue || 'Select component'}</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {dropdownOpen[id] && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md border border-gray-300 shadow-lg">
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
            <div className="max-h-60 overflow-y-auto">
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
    { key: 'actions', label: 'Actions' }
  ];

  const adminComponentsRows = adminIssueComponents.map(component => {
    // Find the product in the simplifiedProducts array to get the inStock value
    const product = simplifiedProducts.find(p => p.name === component.name);
    // Set a default max stock (e.g., 0 or "N/A") when no matching product is found
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
            disabled={!component.name} // Disable input if no component name is selected
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
  })

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
        
        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Request header */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Request #{requestData.id}</h2>
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          {/* Requested Components */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

            {/* Description and requested days */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h4 className="font-medium text-gray-700">Request Description</h4>
                </div>
                <p className="text-gray-600">{requestData.description || "No description provided."}</p>
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
          </div>
          
          {/* Admin Issue Components */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  <p className="text-gray-500">No components added. Click "Add Component" to add one.</p>
                </div>
              )}
            </div>

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
          
          {/* Take Action Section */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Take Action
            </h3>
            
            {!action ? (
              <div className="flex space-x-4">
                <button
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  onClick={() => handleActionClick('accept')}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept Request
                </button>
                <button
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  onClick={() => handleActionClick('decline')}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline Request
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      action === 'accept' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {action === 'accept' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>
                    <h4 className="text-lg font-medium">
                      You are about to {action === 'accept' ? 'accept' : 'decline'} this request
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
                
                <div className="flex space-x-4">
                  <button
                    className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      action === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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
                        {action === 'accept' ? 'Confirm & Accept' : 'Confirm & Decline'}
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
        </div>
      </div>
    </div>
  );
};

export default AdminRequestView;