'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, Package, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import SuccessAlert from '../../../components/SuccessAlert';
import { useRouter } from 'next/navigation';

export default function ProductPage() {
    const router = useRouter();
const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ product_name: '', quantity: '', damagedQuantity: '', inStock: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [formErrors, setFormErrors] = useState({});
const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 10;
  

useEffect(() => {

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
    }
  }
  verifyadmin();
  fetchProducts();
}, []);

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
    console.log('Fetched products:', data);

    if (res.ok && data.products) {
      const flattened = data.products.map(p => p.product || p); // <-- FIX HERE
      setProducts(flattened);
    } else {
      console.error('Failed to fetch products:', data.message || res.statusText);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};



  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter(product =>
   product.product_name?.toLowerCase().includes(searchQuery.toLowerCase())

  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

const validateProduct = (product) => {
  const errors = {};

  if (!product.product_name || typeof product.product_name !== 'string' || product.product_name.trim() === '') {
    errors.product_name = 'Product name is required.';
  }

  const quantity = parseInt(product.quantity);
  const damagedQuantity = parseInt(product.damagedQuantity);
  const inStock = parseInt(product.inStock);


  if (isNaN(quantity) || quantity < 0) {
    errors.quantity = 'Quantity must be a non-negative number.';
  }

  if (isNaN(damagedQuantity) || damagedQuantity < 0) {
    errors.damagedQuantity = 'Damaged Quantity must be a non-negative number.';
  }

  if (isNaN(inStock) || inStock < 0) {
    errors.inStock = 'In Stock must be a non-negative number.';
  }

  console.log('Validation errors:', errors);  
  return errors;
};


const addProduct = async () => {
  const errors = validateProduct(newProduct);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setFormErrors({});

  const payload = {
    product_name: newProduct.product_name.trim(),
    quantity: parseInt(newProduct.quantity),
    damagedQuantity: parseInt(newProduct.damagedQuantity),
    inStock: parseInt(newProduct.inStock),
  };

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.message === 'Product already exists') {
            setFormErrors({ product_name: data.message });
        } else {
          toast.error(data.message || 'Failed to add product');
     }
  return;
    }

    setSuccessMessage(data.message || 'Product added successfully');
    setProducts([...products, {
      product_name: payload.product_name,
      quantity: payload.quantity,
      damagedQuantity: payload.damagedQuantity,
      inStock: payload.inStock,
    }]);

    resetForm();
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);

  } catch (error) {
    console.error('Error adding product:', error);
    toast.error('Something went wrong while adding the product');
  }
};

const updateProduct = async (index) => {
  console.log('Updating product at index:', index);

    console.log('newProduct:', newProduct);
  const errors = validateProduct(newProduct);
  console.log('Validation errors:', errors); 


  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

   const token = localStorage.getItem('token');
  setFormErrors({});

  // Convert input values to integers
  const quantity = parseInt(newProduct.quantity);
  const damagedQuantity = parseInt(newProduct.damagedQuantity);
  const inStock = parseInt(newProduct.inStock);

  const updatedProduct = {
    product_name: newProduct.product_name.trim(), 
    quantity,
    damagedQuantity,
    inStock,
  };

  try {

   const productId = products[index]._id;
  
    console.log('Updating product with ID:', productId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/update/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify(updatedProduct),
    });



    const result = await response.json();

        if (!response.ok) {
      if (result.message === 'Product already exists') {
            setFormErrors({ product_name: result.message });
        } else {
          toast.error(result.message || 'Failed to add product');
     }
  return;
    }

setSuccessMessage(result.message || 'Product updated successfully');

    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index], 
      ...updatedProduct, 
    };

    setProducts(updatedProducts);


    resetForm();
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  } catch (error) {
    console.error('Error updating product:', error);

  }
};




  const startEdit = (product, index) => {
      console.log("Starting to edit", product); 
    setEditIndex(index);
    setNewProduct({ ...product });
    setShowForm(true);
  };

  const cancelForm = () => resetForm();
  
  const resetForm = () => {
      setFormErrors({});
    setShowForm(false);
    setEditIndex(null);
    setNewProduct({ name: '', quantity: '', damagedQuantity: '', inStock: '' });
  };
  

  const columns = [
    { key: 'product_name', label: 'Name' },
    { key: 'quantity', label: 'Total Quantity' },
    { key: 'issued', label: 'Issued Quantity' },
    { key: 'damagedQuantity', label: 'Damaged Quantity' },
    { key: 'inStock', label: 'In Stock' },
    { key: 'yetToGive', label: 'On Hold' },
    { key: 'actions', label: 'Actions' },
  ];

  const rows = paginatedProducts.map((item, idx) => ({
    ...item,
    issued: item.quantity - item.damagedQuantity - item.inStock,
    actions: (
      <div className="flex justify-center gap-x-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => startEdit(item, (currentPage - 1) * itemsPerPage + idx)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
      </div>
    )
  }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const headers = data[0];
      const rows = data.slice(1);

      const formatted = rows.map((row) => {
        const entry = {};
        headers.forEach((h, i) => {
          entry[h] = row[i];
        });

        return {
          name: entry.name || '',
          quantity: parseInt(entry.quantity) || 0,
          damagedQuantity: parseInt(entry.damagedQuantity) || 0,
          inStock: parseInt(entry.inStock) || 0
        };
      }).filter(item => item.name);

      setExcelData(formatted);
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const submitExcelData = () => {
    const newNames = new Set(excelData.map(p => p.name.toLowerCase()));
    const existingNames = new Set(products.map(p => p.name.toLowerCase()));
    const hasDuplicates = [...newNames].some(name => existingNames.has(name));

    if (hasDuplicates) {
      const confirmOverwrite = window.confirm("Some products already exist. Do you want to continue?");
      if (!confirmOverwrite) return;
    }

    setProducts([...products, ...excelData]);
    setExcelData([]);
    setShowUploadModal(false);
    toast.success('Products imported successfully!');
  };

  return (
    <div className="h-full w-full">
      {/* Backdrop for modal */}
      {showForm && <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />}

      <div className="p-4 md:p-3 mx-auto bg-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Product Management
              <span className="ml-4 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                Total Products: {products.length}
              </span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 w-full relative bg-white">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm"
          />
        </div>

        {/* Table or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            <Table columns={columns} rows={rows} currentPage={currentPage} itemsPerPage={itemsPerPage} />
            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </div>
        ) : (
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No products found. Add some products to get started.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Upload Excel File</h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>

            {!excelData.length ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                {isLoading ? (
                  <p className="text-blue-600">Processing file...</p>
                ) : (
                  <>
                    <Plus size={36} className="text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload your Excel file</p>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                    >
                      Browse to Upload
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Required headers: <code>name</code>, <code>quantity</code>, <code>damagedQuantity</code>, <code>inStock</code>
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-auto max-h-[400px] border rounded">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2">Product Name</th>
                        <th className="border px-3 py-2">Quantity</th>
                        <th className="border px-3 py-2">Damaged Quantity</th>
                        <th className="border px-3 py-2">In Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((item, i) => (
                        <tr key={i}>
                          <td className="border px-3 py-1">{item.name}</td>
                          <td className="border px-3 py-1">{item.quantity}</td>
                          <td className="border px-3 py-1">{item.damagedQuantity}</td>
                          <td className="border px-3 py-1">{item.inStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setExcelData([]);
                    }}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitExcelData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Form */}
{showForm && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
    onClick={cancelForm}
  >
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            {editIndex !== null ? <Edit2 size={18} /> : <Plus size={18} />}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {editIndex !== null ? 'Edit Product' : 'Add Product'}
          </h2>
        </div>
        <button
          onClick={cancelForm}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Body */}
      <div className="p-4 space-y-4">
        {['product_name', 'quantity', 'damagedQuantity', 'inStock'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field === 'product_name' ? 'Product Name *' : field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              name={field}
              type={field === 'product_name' ? 'text' : 'number'}
              placeholder={`Enter ${field}`}
              value={newProduct[field] ?? ''}
              onChange={handleChange}
              className={`w-full border ${
                formErrors[field] ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors[field] && (
              <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
        <button
          onClick={cancelForm}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={editIndex !== null ? () => updateProduct(editIndex) : addProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
        >
          <Save size={16} />
          {editIndex !== null ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  </div>
)}


      {showSuccessAlert && (
  <SuccessAlert
    message="Done successfully :)"
  description={successMessage}
    onClose={() => setShowSuccessAlert(false)}
  />
)}

    </div>
  );
}
