'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit2, Save, Package, Search ,Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import SuccessAlert from '../../../components/SuccessAlert';
import { useRouter } from 'next/navigation';
import fuzzysort from 'fuzzysort'; // Install with: npm install fuzzysort

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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 10;

  const [sortKey, setSortKey] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Add to your state:
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [colMapping, setColMapping] = useState({
    product_name: '',
    quantity: '',
    damagedQuantity: '',
    inStock: ''
  });
  const [showMappingStep, setShowMappingStep] = useState(false);
  const [excelDuplicateError, setExcelDuplicateError] = useState([]);
  const [excelRawData, setExcelRawData] = useState(null);
  const [excelCheckMode, setExcelCheckMode] = useState(false);
  const [excelCheckResults, setExcelCheckResults] = useState([]);
  const [selectedErrorIndex, setSelectedErrorIndex] = useState(null); // <-- New state for selected error
  const [progress, setProgress] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkStep, setCheckStep] = useState('');
  const progressRef = useRef();

  // Utility to normalize product names (case/space insensitive)
  const normalizeName = (name) =>
    (name || '').replace(/\s+/g, '').toLowerCase().trim();

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
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortKey === 'product_name' || sortKey === 'yetToGive') {
      return sortOrder === 'asc'
        ? (a[sortKey] || '').toString().localeCompare((b[sortKey] || '').toString())
        : (b[sortKey] || '').toString().localeCompare((a[sortKey] || '').toString());
    } else if (sortKey === 'issued') {
      const aIssued = (a.quantity || 0) - (a.damagedQuantity || 0) - (a.inStock || 0);
      const bIssued = (b.quantity || 0) - (b.damagedQuantity || 0) - (b.inStock || 0);
      return sortOrder === 'asc'
        ? aIssued - bIssued
        : bIssued - aIssued;
    } else {
      // Numeric sort for other quantities
      return sortOrder === 'asc'
        ? (a[sortKey] || 0) - (b[sortKey] || 0)
        : (b[sortKey] || 0) - (a[sortKey] || 0);
    }
  });
  
  const paginatedProducts = sortedProducts.slice(
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
          fetchProducts(); 
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);


    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Something went wrong while adding the product');
    }
  };

  const updateProduct = async (id) => {
    console.log('Updating product at index:', id);
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
      console.log('Updating product with ID:', id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/update/${id}`, {
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

      // Find the index in the original products array by _id
      const updatedProducts = products.map((p) =>
        p._id === id ? { ...p, ...updatedProduct } : p
      );

      setProducts(updatedProducts);

      resetForm();
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Error updating product:', error);

    }
  };

  const startEdit = (product, id) => {
    setEditIndex(id); // Now using _id
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
          onClick={() => startEdit(item, item._id)}
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

      const headers = data[0].map(h => h.toString());
      setExcelHeaders(headers);

      // Fuzzy match for default mapping
      const mapping = {
        product_name: fuzzyMatchHeader('product name', headers) || fuzzyMatchHeader('name', headers),
        quantity: fuzzyMatchHeader('quantity', headers) || fuzzyMatchHeader('total', headers),
        damagedQuantity: fuzzyMatchHeader('damaged', headers),
        inStock: fuzzyMatchHeader('in stock', headers)
      };
      setColMapping(mapping);

      setExcelRawData({ raw: data, headers, rows: data.slice(1) });
      setShowMappingStep(true);
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  // Helper for fuzzy matching
  const fuzzyMatchHeader = (target, headers) => {
    const result = fuzzysort.go(target, headers);
    return result.length > 0 ? result[0].target : '';
  };

  // When user confirms mapping, process data:
  const handleConfirmMapping = () => {
    const { raw, headers, rows } = excelRawData;
    const headerIndex = {};
    Object.entries(colMapping).forEach(([key, col]) => {
      headerIndex[key] = headers.indexOf(col);
    });

    const formatted = rows.map((row) => ({
      product_name: row[headerIndex.product_name] || '',
      quantity: parseInt(row[headerIndex.quantity]) || 0,
      damagedQuantity: parseInt(row[headerIndex.damagedQuantity]) || 0,
      inStock: parseInt(row[headerIndex.inStock]) || 0
    })).filter(item => item.product_name);

    setExcelData(formatted);
    setShowMappingStep(false);
  };

  const handleDownloadProducts = () => {
    const exportData = sortedProducts.map((item) => ({
      Name: item.product_name,
      'Total Quantity': item.quantity,
      'Issued Quantity': (item.quantity || 0) - (item.damagedQuantity || 0) - (item.inStock || 0),
      'Damaged Quantity': item.damagedQuantity,
      'In Stock': item.inStock,
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Generate filename with timestamp
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const filename = `products_${timestamp}.xlsx`;

    // Trigger download
    XLSX.writeFile(wb, filename);
  };

  const submitExcelData = () => {
    setProducts([...products, ...excelData]);
    setExcelData([]);
    setShowUploadModal(false);
    toast.success('Products imported successfully!');
  };

  useEffect(() => {
    if (Array.isArray(excelData) && excelData.length > 0) {
      const nameMap = {};
      const errors = [];
      excelData.forEach((item, idx) => {
        const norm = normalizeName(item.product_name || item.name);
        if (!norm) return;
        if (nameMap[norm] !== undefined) {
          // Duplicate found
          errors.push({
            name: item.product_name || item.name,
            rows: [nameMap[norm] + 1, idx + 1], // 1-based row numbers
          });
        } else {
          nameMap[norm] = idx;
        }
      });
      setExcelDuplicateError(errors);
    } else {
      setExcelDuplicateError([]);
    }
  }, [excelData]);

  // Always update test results
  useEffect(() => {
    if (excelData.length > 0) {
      const errors = [];
      const nameMap = {};
      excelData.forEach((item, idx) => {
        const norm = normalizeName(item.product_name || item.name);

        // Duplicate check (case-insensitive, space-insensitive)
        if (norm && nameMap[norm] !== undefined) {
          errors.push({
            type: 'Duplicate',
            message: `Duplicate product name "${item.product_name || item.name}" at rows ${nameMap[norm] + 1} & ${idx + 1}`,
            rows: [nameMap[norm], idx],
          });
        } else {
          nameMap[norm] = idx;
        }

        // Negative value check
        if (
          item.quantity < 0 ||
          item.damagedQuantity < 0 ||
          item.inStock < 0
        ) {
          errors.push({
            type: 'Negative',
            message: `Negative value for "${item.product_name || item.name}" at row ${idx + 1}`,
            rows: [idx],
          });
        }

        // qty >= damaged + inStock
        const q = Number(item.quantity) || 0;
        const d = Number(item.damagedQuantity) || 0;
        const s = Number(item.inStock) || 0;
        if (q < d + s) {
          errors.push({
            type: 'Logic',
            message: `Total Quantity < Damaged + In Stock for "${item.product_name || item.name}" at row ${idx + 1}`,
            rows: [idx],
          });
        }
      });
      setExcelCheckResults(errors);
      setSelectedErrorIndex(null);
    } else {
      setExcelCheckResults([]);
      setSelectedErrorIndex(null);
    }
  }, [excelData]);

  useEffect(() => {
    if (excelData.length > 0) {
      setChecking(true);
      setProgress(0);
      setCheckStep('Duplicate Finding');
      setExcelCheckResults([]);
      setSelectedErrorIndex(null);

      // Simulate progress for each step
      let percent = 0;
      let errors = [];
      let nameMap = {};

      // Step 1: Duplicate check
      setTimeout(() => {
        setCheckStep('Duplicate Finding');
        excelData.forEach((item, idx) => {
          const norm = normalizeName(item.product_name || item.name);
          if (norm && nameMap[norm] !== undefined) {
            errors.push({
              type: 'Duplicate',
              message: `Duplicate product name "${item.product_name || item.name}" at rows ${nameMap[norm] + 1} & ${idx + 1}`,
              rows: [nameMap[norm], idx],
            });
          } else {
            nameMap[norm] = idx;
          }
        });
        percent = 33;
        setProgress(percent);
      }, 400);

      // Step 2: Negative value check
      setTimeout(() => {
        setCheckStep('Negative Value');
        excelData.forEach((item, idx) => {
          if (
            item.quantity < 0 ||
            item.damagedQuantity < 0 ||
            item.inStock < 0
          ) {
            errors.push({
              type: 'Negative',
              message: `Negative value for "${item.product_name || item.name}" at row ${idx + 1}`,
              rows: [idx],
            });
          }
        });
        percent = 66;
        setProgress(percent);
      }, 900);

      // Step 3: Sum check
      setTimeout(() => {
        setCheckStep('Sum of Qty');
        excelData.forEach((item, idx) => {
          const q = Number(item.quantity) || 0;
          const d = Number(item.damagedQuantity) || 0;
          const s = Number(item.inStock) || 0;
          if (q < d + s) {
            errors.push({
              type: 'Logic',
              message: `Total Quantity < Damaged + In Stock for "${item.product_name || item.name}" at row ${idx + 1}`,
              rows: [idx],
            });
          }
        });
        percent = 100;
        setProgress(percent);

        setTimeout(() => {
          setExcelCheckResults(errors);
          setChecking(false);
          setCheckStep('');
        }, 400);
      }, 1400);
    } else {
      setExcelCheckResults([]);
      setSelectedErrorIndex(null);
      setChecking(false);
      setProgress(0);
      setCheckStep('');
    }
    // eslint-disable-next-line
  }, [excelData]);

  return (
    <div className="h-full w-full">
      {/* Backdrop for modal */}
      {showForm && <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />}

      <div className="p-4 md:p-3 mx-auto bg-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
              Product Management
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
                Total Products: {products.length}
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={handleDownloadProducts}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download Products</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
            <Table
              columns={columns}
              rows={rows}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              renderHeaderCell={(col) => {
                // Make all columns except 'actions' sortable
                if (col.key !== 'actions') {
                  return (
                    <button
                      type="button"
                      className={`
                        group
                        flex items-center justify-center gap-2 font-semibold uppercase
                        w-full
                      `}
                      style={{ minWidth: 120 }}
                      onClick={() => {
                        if (sortKey === col.key) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortKey(col.key);
                          setSortOrder('asc');
                        }
                      }}
                    >
                      <span>{col.label}</span>
                      <span className="ml-1 flex flex-col text-xs leading-none">
                        <span
                          className={
                            sortKey === col.key && sortOrder === 'asc'
                              ? 'text-black'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }
                        >
                          ▲
                        </span>
                        <span
                          className={
                            sortKey === col.key && sortOrder === 'desc'
                              ? 'text-black'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }
                        >
                          ▼
                        </span>
                      </span>
                    </button>
                  );
                }
                // Non-sortable (actions) column
                return (
                  <div>
                    {col.label}
                  </div>
                );
              }}
            />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUploadModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl space-y-6 animate-fadeIn"
            style={{ minWidth: 900 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus size={22} className="text-blue-500" />
                Upload Excel File
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Show file upload input if no data and not mapping */}
            {!excelData.length && !showMappingStep ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40">
                {isLoading ? (
                  <p className="text-blue-600 font-semibold">Processing file...</p>
                ) : (
                  <>
                    <Plus size={44} className="text-blue-400 mb-3" />
                    <p className="text-base text-gray-700 font-medium mb-2">Upload your Excel file</p>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer shadow transition"
                    >
                      Browse to Upload
                    </label>
                  </>
                )}
              </div>
            ) : showMappingStep ? (
              <div>
                <h3 className="font-semibold mb-4 text-gray-800 text-lg">Map Excel Columns</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {['product_name', 'quantity', 'damagedQuantity', 'inStock'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold mb-2 capitalize text-gray-700">
                        {field === 'product_name' ? 'Product Name' : field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <select
                        className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                        value={colMapping[field]}
                        onChange={e => setColMapping({ ...colMapping, [field]: e.target.value })}
                      >
                        <option value="">-- Select Column --</option>
                        {excelHeaders.map((h, i) => (
                          <option key={i} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setShowMappingStep(false);
                      setExcelData([]);
                    }}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmMapping}
                    className={`px-5 py-2 rounded-lg font-semibold shadow transition text-white ${
                      (!colMapping.product_name ||
                        !colMapping.quantity ||
                        !colMapping.damagedQuantity ||
                        !colMapping.inStock)
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={
                      !colMapping.product_name ||
                      !colMapping.quantity ||
                      !colMapping.damagedQuantity ||
                      !colMapping.inStock
                    }
                  >
                    Confirm Mapping
                  </button>
                </div>
              </div>
            ) : (
              // Side-by-side preview and errors
              <div className="flex gap-6">
                {/* Preview Table */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Total Products: {excelData.length}
                    </span>
                  </div>
                  <div className="overflow-auto max-h-[400px] border rounded-xl shadow-sm bg-white">
                    <table className="w-full border text-sm">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border px-4 py-2 font-semibold text-gray-700">Product Name</th>
                          <th className="border px-4 py-2 font-semibold text-gray-700">Quantity</th>
                          <th className="border px-4 py-2 font-semibold text-gray-700">Damaged Quantity</th>
                          <th className="border px-4 py-2 font-semibold text-gray-700">In Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.map((item, i) => {
                          // Highlight row if it's part of the selected error
                          let highlight = false;
                          if (selectedErrorIndex !== null && excelCheckResults[selectedErrorIndex]) {
                            highlight = excelCheckResults[selectedErrorIndex].rows.includes(i);
                          }
                          return (
                            <tr
                              key={i}
                              className={`hover:bg-blue-50 transition ${highlight ? 'bg-red-100 !text-red-700 font-semibold' : ''}`}
                            >
                              <td className="border px-4 py-2">{item.product_name || item.name}</td>
                              <td className="border px-4 py-2">{item.quantity}</td>
                              <td className="border px-4 py-2">{item.damagedQuantity}</td>
                              <td className="border px-4 py-2">{item.inStock}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-3 pt-5">
                    <button
                      onClick={() => setShowMappingStep(true)}
                      className="px-5 py-2 border border-blue-400 text-blue-700 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center gap-1"
                    >
                      <span>&larr;</span> Back
                    </button>
                    <button
                      onClick={submitExcelData}
                      className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow ${excelCheckResults.length > 0 || checking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={excelCheckResults.length > 0 || checking}
                    >
                      Submit
                    </button>
                  </div>
                </div>
                {/* Errors/Checks */}
                <div className="w-[350px] flex-shrink-0">
                  <h3 className="font-semibold text-lg mb-2">Test Results</h3>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded min-h-[60px] max-h-[400px] overflow-auto">
                    {checking ? (
                      <div>
                        <div className="mb-2 text-blue-700 font-semibold animate-pulse">{checkStep}...</div>
                        <div className="w-full bg-blue-100 rounded-full h-3 mb-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">{progress}% Checking...</div>
                      </div>
                    ) : excelCheckResults.length === 0 ? (
                      <div className="text-green-700 font-semibold">All checks passed! Ready to submit.</div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2 text-red-700">
                        {excelCheckResults.map((err, i) => (
                          <li
                            key={i}
                            className={`cursor-pointer rounded px-1 py-1 transition ${selectedErrorIndex === i ? 'bg-red-200 font-bold' : 'hover:bg-red-50'}`}
                            onClick={() => setSelectedErrorIndex(i)}
                          >
                            <span className="font-bold">{err.type}:</span> {err.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {!checking && excelCheckResults.length > 0 && selectedErrorIndex !== null && (
                    <div className="mt-2 text-xs text-gray-500">
                      Click error to highlight a row.
                    </div>
                  )}
                </div>
              </div>
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
