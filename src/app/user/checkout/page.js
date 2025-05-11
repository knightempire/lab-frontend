'use client';
import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for reference staff
const referenceStaffOptions = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sarah Johnson' },
  { id: 3, name: 'Michael Brown' },
  { id: 4, name: 'Emily Davis' },
  { id: 5, name: 'David Wilson' },
  { id: 6, name: 'Jennifer Taylor' },
  { id: 7, name: 'Robert Martinez' },
  { id: 8, name: 'Lisa Anderson' },
  { id: 9, name: 'William Thomas' },
  { id: 10, name: 'Patricia Jackson' },
];

export default function CheckoutPage() {
  const router = useRouter();
  
  // Assuming products are passed via router query or localStorage in a real app
  // For demo purposes, let's use dummy selected products
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
  
  // Reference staff state
  const [referenceStaff, setReferenceStaff] = useState('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter staff options based on search query
  const filteredStaffOptions = referenceStaffOptions.filter(staff => 
    staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

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
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Validate form
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
    
    setErrors(validationErrors);
    
    // If no errors, proceed with submission
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted successfully', {
        selectedProducts,
        purpose,
        referenceStaff,
        returnDays,
        acknowledged
      });
      
      // Show success message
      setSubmitSuccess(true);
      
      // In a real app, you would submit the form data to an API
      // After successful submission, redirect to a confirmation page
      setTimeout(() => {
        // router.push('/confirmation');
        // For demo, we'll just reset the form
        setSubmitSuccess(false);
        setSubmitted(false);
      }, 3000);
    }
  };

  // Handle back button
  const handleBack = () => {
    // Store the current state of selected products back to localStorage
    // This ensures the product page can restore the same selections
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    
    // Navigate back to product page
    router.push('/user/product');
  };

  return (
    <div className="h-full w-full bg-gray-50">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <Package size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Checkout
          </h1>
        </div>

        {submitSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center mb-6">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-green-800">Success!</h3>
              <p className="text-green-700">Your request has been submitted successfully.</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          {/* Selected Products Section */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Selected Products</h2>
            </div>
            
            {selectedProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="inline-flex items-center border border-gray-300 rounded-md bg-white overflow-hidden">
                            {/* Minus Button */}
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                              onClick={() => updateQuantity(index, product.selectedQuantity - 1)}
                            >
                              −
                            </button>
                      
                            {/* Editable Quantity */}
                            <input
                              type="number"
                              value={product.selectedQuantity}
                              onChange={(e) => updateQuantity(index, e.target.value)}
                              className="w-12 text-center bg-transparent border-x border-gray-300 focus:outline-none text-gray-700"
                              min="1"
                              max={product.inStock}
                            />
                      
                            {/* Plus Button */}
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                              onClick={() => updateQuantity(index, product.selectedQuantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.inStock} available</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No products selected.</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Return to product selection
                </button>
              </div>
            )}
            
            {submitted && errors.products && (
              <div className="p-3 bg-red-50 text-red-700 text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {errors.products}
              </div>
            )}
          </div>

          {/* Form Fields Section */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Request Details</h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Purpose Field */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    submitted && errors.purpose ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  rows="3"
                  placeholder="Please describe why you need these components..."
                ></textarea>
                {submitted && errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {/* Reference Staff Dropdown */}
              <div>
                <label htmlFor="referenceStaff" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Staff <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div 
                    className={`w-full px-3 py-2 border ${
                      submitted && errors.referenceStaff ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex items-center justify-between`}
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
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search staff..."
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Search size={16} className="absolute left-2.5 top-3 text-gray-400" />
                        </div>
                      </div>
                      
                      <ul className="py-1">
                        {filteredStaffOptions.length > 0 ? (
                          filteredStaffOptions.map((staff) => (
                            <li 
                              key={staff.id}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                              onClick={() => {
                                setReferenceStaff(staff.name);
                                setShowStaffDropdown(false);
                              }}
                            >
                              {staff.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-sm text-gray-500">No staff found</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {submitted && errors.referenceStaff && (
                  <p className="mt-1 text-sm text-red-600">{errors.referenceStaff}</p>
                )}
              </div>

              {/* Return Days Field */}
              <div>
                <label htmlFor="returnDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Return Days <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="returnDays"
                    value={returnDays}
                    onChange={(e) => setReturnDays(parseInt(e.target.value) || '')}
                    min="1"
                    max="30"
                    className={`w-full px-3 py-2 border ${
                      submitted && errors.returnDays ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">days</span>
                  </div>
                </div>
                {submitted && errors.returnDays ? (
                  <p className="mt-1 text-sm text-red-600">{errors.returnDays}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Maximum 30 days</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Acknowledgement Section */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Terms & Conditions</h2>
            </div>
            <div className="p-4">
              {/* Additional Note */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-sm text-blue-700">
                  The request for components is valid for a maximum of 30 days. To request for more, you should get re-issued. For more details, contact lab in-charge.
                </p>
              </div>
              
              {/* Acknowledgement Checkbox */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acknowledgement"
                    type="checkbox"
                    checked={acknowledged}
                    onChange={() => setAcknowledged(!acknowledged)}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      submitted && errors.acknowledged ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acknowledgement" className={`font-medium ${
                    submitted && errors.acknowledged ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    I acknowledge that the components are completely my responsibility after issuance; I will take care of any damage that occurs.
                  </label>
                  {submitted && errors.acknowledged && (
                    <p className="mt-1 text-sm text-red-600">{errors.acknowledged}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Products
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}