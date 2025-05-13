'use client';
import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Trash2, Search, AlertCircle, CheckCircle, Info, X, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Table from '../../../components/table';

const referenceStaffOptions = [
  { id: 1, name: 'Prof 1' },
  { id: 2, name: 'Prof 2' },
  { id: 3, name: 'Prof 3' },
  { id: 4, name: 'Prof 4' },
  { id: 5, name: 'Prof 5' },
  { id: 6, name: 'Prof 6' },
  { id: 7, name: 'Prof 7' },
  { id: 8, name: 'Prof 8' },
  { id: 9, name: 'Prof 9' },
  { id: 10, name: 'Prof 10' },
];

export default function CheckoutPage() {
  const router = useRouter();
  
  // State for selected products
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Retrieve selected products from localStorage when component mounts
  useEffect(() => {
    const storedProducts = localStorage.getItem('selectedProducts');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        setSelectedProducts(parsedProducts);
      } catch (error) {
        console.error('Failed to parse selected products:', error);
      }
    }
  }, []);
  
  // Form state
  const [purpose, setPurpose] = useState('');
  const [returnDays, setReturnDays] = useState(7);
  const [acknowledged, setAcknowledged] = useState(false);
  const [referenceStaff, setReferenceStaff] = useState('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  
  // Custom faculty state
  const [showCustomFacultyForm, setShowCustomFacultyForm] = useState(false);
  const [customFacultyName, setCustomFacultyName] = useState('');
  const [customFacultyEmail, setCustomFacultyEmail] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Confirmation popup state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Pagination (if needed)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter staff options based on search query
  const filteredStaffOptions = referenceStaffOptions.filter(staff => 
    staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

  // Calculate total items
  const totalItems = selectedProducts.reduce((acc, product) => acc + product.selectedQuantity, 0);

  // Handle quantity change
  const updateQuantity = (index, newQuantity) => {
    const updated = [...selectedProducts];
    const product = updated[index];
    
    // Validate quantity
    const quantity = Math.max(1, Math.min(parseInt(newQuantity) || 1, product.inStock));
    
    product.selectedQuantity = quantity;
    setSelectedProducts(updated);
  };

  // Remove product from selection
  const removeProduct = (index) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
    localStorage.setItem('selectedProducts', JSON.stringify(updated));
  };

  // Handle return days change with max limit of 30
  const handleReturnDaysChange = (value) => {
    const days = parseInt(value) || 0;
    if (days > 30) {
      setReturnDays(30);
    } else {
      setReturnDays(days);
    }
  };

  // Handle custom faculty submission
  const handleCustomFacultySubmit = (e) => {
    e.preventDefault();
    
    if (!customFacultyName.trim() || !customFacultyEmail.trim()) {
      setErrors({
        ...errors,
        customFaculty: 'Both name and email are required'
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customFacultyEmail)) {
      setErrors({
        ...errors,
        customFaculty: 'Please enter a valid email address'
      });
      return;
    }
    
    // Set the reference staff with the custom entry
    setReferenceStaff(`${customFacultyName} (${customFacultyEmail})`);
    
    // Close the custom faculty form and the dropdown
    setShowCustomFacultyForm(false);
    setShowStaffDropdown(false);
    
    // Clear any previous errors
    const updatedErrors = {...errors};
    delete updatedErrors.customFaculty;
    delete updatedErrors.referenceStaff;
    setErrors(updatedErrors);
  };

  // Validate form data
  const validateForm = () => {
    const validationErrors = {};
    
    if (!purpose.trim()) {
      validationErrors.purpose = 'Purpose is required';
    }
    
    if (!referenceStaff) {
      validationErrors.referenceStaff = 'Reference staff is required';
    }
    
    if (!returnDays || returnDays < 1 || returnDays > 30) {
      validationErrors.returnDays = 'Return days must be between 1 and 30';
    }
    
    if (!acknowledged) {
      validationErrors.acknowledged = 'You must acknowledge the terms';
    }
    
    if (selectedProducts.length === 0) {
      validationErrors.products = 'At least one product must be selected';
    }
    
    return validationErrors;
  };

  // Initial form submission handler
  const handleSubmitRequest = () => {
    setSubmitted(true);
    
    // Validate form
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    // If no errors, show confirmation dialog
    if (Object.keys(validationErrors).length === 0) {
      setShowConfirmDialog(true);
    }
  };
  
  // Final form submission after confirmation
  const handleConfirmSubmit = () => {
    // Hide the confirmation dialog
    setShowConfirmDialog(false);
    
    console.log('Form submitted successfully', {
      selectedProducts,
      purpose,
      referenceStaff,
      returnDays,
      acknowledged
    });
    
    // Show success message
    setSubmitSuccess(true);
    
    setTimeout(() => {
      localStorage.removeItem('selectedProducts');
      router.push('/'); // Redirect to home page
    }, 1500);
  };
  
  // Cancel confirmation dialog
  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  // Handle back button
  const handleBack = () => {
    // Store the current state of selected products back to localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    
    // Navigate back to product page
    router.push('/user/product');
  };

  // Close success alert
  const closeSuccessAlert = () => {
    setSubmitSuccess(false);
  };
  
  // Table column definitions for selected products
  const columns = [
    { key: 'name', label: 'Component' },
    { key: 'selectedQuantity', label: 'Quantity' },
    { key: 'inStock', label: 'Stock' },
    { key: 'action', label: 'Action' },
  ];
  
  // Custom cell renderer for the table
  const renderCell = (key, product, index) => {
    switch (key) {
      case 'name':
        return <div className="font-medium text-gray-900">{product.name}</div>;
      
      case 'selectedQuantity':
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-28">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
                onClick={() => updateQuantity(index, product.selectedQuantity - 1)}
                disabled={product.selectedQuantity <= 1}
              >
                −
              </button>
              <input
                type="text"
                value={product.selectedQuantity}
                onChange={(e) => updateQuantity(index, e.target.value)}
                className="h-8 w-12 text-center border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
                max={product.inStock}
              />
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
                onClick={() => updateQuantity(index, product.selectedQuantity + 1)}
                disabled={product.selectedQuantity >= product.inStock}
              >
                +
              </button>
            </div>
          </div>
        );
      
      case 'inStock':
        return (
          <span className={`inline-flex text-sm ${product.inStock < 5 ? 'text-amber-600' : 'text-gray-600'}`}>
            {product.inStock} available
          </span>
        );
      
      case 'action':
        return (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
        
      default:
        return product[key];
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="mx-auto px-4 py-3">
        {/* Header */}
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <div className="flex items-center">
                <Package className="text-blue-600 h-6 w-6 mr-2" />
                <h1 className="text-2xl font-bold text-gray-800">
                  Checkout
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Success notification */}
        {submitSuccess && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle size={30} className="text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-center text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-gray-600 text-center mb-5">
                Your component request has been sent for processing. Redirecting to home page...
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Form */}
          <div className="md:w-2/3 space-y-4">
            {/* Selected Products Section */}
            <section className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Selected Components</h2>
                {selectedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add more
                  </button>
                )}
              </div>
              
              {selectedProducts.length > 0 ? (
                <div className={`${selectedProducts.length > 3 ? 'max-h-66 overflow-y-auto' : ''} overflow-x-auto`}>
                  {/* Using the Table component */}
                  <Table 
                    columns={columns} 
                    rows={selectedProducts} 
                    currentPage={currentPage} 
                    itemsPerPage={itemsPerPage} 
                    renderCell={renderCell} 
                  />
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">No components selected yet</p>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Browse components
                  </button>
                </div>
              )}
              
              {submitted && errors.products && (
                <div className="p-3 bg-red-50 text-red-700 text-sm flex items-center border-t border-red-100">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  {errors.products}
                </div>
              )}
            </section>

            {/* Request Details Section */}
            <section className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-2 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Request Details</h2>
              </div>
              <div className="px-6 py-4 space-y-5">
                {/* Purpose Field */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      submitted && errors.purpose ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    rows="3"
                    placeholder="Please describe why you need these components..."
                  ></textarea>
                  {submitted && errors.purpose && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.purpose}
                    </p>
                  )}
                </div>

                {/* Reference Staff Dropdown */}
                <div>
                  <label htmlFor="referenceStaff" className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Staff <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div 
                      className={`w-full px-4 py-2 border ${
                        submitted && errors.referenceStaff ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer flex items-center justify-between`}
                      onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                    >
                      <span className={referenceStaff ? 'text-gray-900' : 'text-gray-400'}>
                        {referenceStaff || 'Select reference staff...'}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {showStaffDropdown && (
                      <div className="absolute z-10 bottom-full mb-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Search staff..."
                              value={staffSearchQuery}
                              onChange={(e) => setStaffSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                              autoFocus
                            />
                            <Search size={16} className="absolute left-2.5 top-3 text-gray-400" />
                          </div>
                        </div>
                        
                        <ul className="py-1">
                          {filteredStaffOptions.length > 0 ? (
                            filteredStaffOptions.map((staff) => (
                              <li 
                                key={staff.id}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors flex items-center"
                                onClick={() => {
                                  setReferenceStaff(staff.name);
                                  setShowStaffDropdown(false);
                                }}
                              >
                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                                  {staff.name.charAt(0)}
                                </div>
                                {staff.name}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-sm text-gray-500 italic">
                              No matching staff found
                            </li>
                          )}
                        </ul>
                        
                        <div className="p-2 border-t border-gray-200 bg-gray-50">
                          <button
                            type="button"
                            className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
                            onClick={() => {
                              setShowCustomFacultyForm(true);
                              setStaffSearchQuery('');
                            }}
                          >
                            <UserPlus size={16} className="mr-2" />
                            Add new faculty member
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Faculty Form Modal remains unchanged */}
                    {showCustomFacultyForm && (
                      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
                          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
                            <h4 className="text-lg font-medium text-black flex items-center">
                              <UserPlus size={20} className="mr-2" />
                              Add New Faculty Member
                            </h4>
                            <button 
                              type="button" 
                              className="text-white/80 hover:text-white transition-colors" 
                              onClick={() => setShowCustomFacultyForm(false)}
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          <form onSubmit={handleCustomFacultySubmit} className="p-6">
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="facultyName" className="block text-sm font-medium text-gray-700 mb-1">
                                  Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  id="facultyName"
                                  value={customFacultyName}
                                  onChange={(e) => setCustomFacultyName(e.target.value)}
                                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="e.g. Prof. John Doe"
                                  autoFocus
                                  required
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="facultyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                  Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="email"
                                  id="facultyEmail"
                                  value={customFacultyEmail}
                                  onChange={(e) => setCustomFacultyEmail(e.target.value)}
                                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="e.g. john.doe@university.edu"
                                  required
                                />
                              </div>
                              
                              {errors.customFaculty && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700 flex items-center">
                                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                                  {errors.customFaculty}
                                </div>
                              )}
                              
                              <div className="pt-4 flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setShowCustomFacultyForm(false)}
                                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
                                >
                                  <UserPlus size={16} className="mr-2" />
                                  Add Faculty
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                  {submitted && errors.referenceStaff && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.referenceStaff}
                    </p>
                  )}
                </div>
                {/* Return Days Field */}
                <div>
                  <label htmlFor="returnDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Return Days <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      id="returnDays"
                      value={returnDays}
                      onChange={(e) => handleReturnDaysChange(e.target.value)}
                      min="1"
                      max="30"
                      className={`w-full px-4 py-2 border ${
                        submitted && errors.returnDays ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors pr-16`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">days</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <Info size={14} className="text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">Maximum 30 days</p>
                  </div>
                  {submitted && errors.returnDays && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.returnDays}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3 space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Component Types:</span>
                    <span className="font-medium">{selectedProducts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Return Period:</span>
                    <span className="font-medium">{returnDays} days</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Submission</h3>
                  <p className="text-gray-500 mb-5">
                    Are you sure you want to submit this request? Once submitted, you will be responsible for all the components listed.
                  </p>
                  <div className="flex space-x-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelSubmit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSubmit}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Terms & Conditions</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Important Note */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                  <div className="flex items-start">
                    <Info size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      The request for components is valid for a maximum of 30 days. To request for more, you should get re-issued. For more details, contact lab in-charge.
                    </p>
                  </div>
                </div>
                
                {/* Acknowledgement Checkbox */}
                <div className="flex items-start pt-2">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="acknowledgement"
                      type="checkbox"
                      checked={acknowledged}
                      onChange={() => setAcknowledged(!acknowledged)}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                        submitted && errors.acknowledged ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acknowledgement" className={`font-medium ${
                      submitted && errors.acknowledged ? 'text-red-600' : 'text-gray-700'
                    }`}>
                  I acknowledge receipt of the issued components and accept full responsibility for their care. I understand that I will be liable for any damage, loss, or misuse, and agree to pay any applicable penalties if required.
                  </label>
                    {submitted && errors.acknowledged && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.acknowledged}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  className="w-full px-6 py-3 mt-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                >
                  Submit Request
                </button> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}