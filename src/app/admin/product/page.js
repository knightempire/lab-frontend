'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, Package, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';

const initialProducts = [
  { name: "Widget A", quantity: 100, damagedQuantity: 5, inStock: 90 },
  { name: "Widget B", quantity: 50, damagedQuantity: 2, inStock: 45 },
  { name: "Widget C", quantity: 70, damagedQuantity: 3, inStock: 65 },
  { name: "Widget D", quantity: 80, damagedQuantity: 4, inStock: 75 },
  { name: "Widget E", quantity: 60, damagedQuantity: 1, inStock: 59 },
  { name: "Widget F", quantity: 40, damagedQuantity: 0, inStock: 40 },
  { name: "Widget G", quantity: 90, damagedQuantity: 6, inStock: 84 },
  { name: "Widget H", quantity: 30, damagedQuantity: 2, inStock: 28 },
  { name: "Widget I", quantity: 55, damagedQuantity: 5, inStock: 50 },
  { name: "Widget J", quantity: 75, damagedQuantity: 3, inStock: 72 },
  { name: "Widget K", quantity: 110, damagedQuantity: 10, inStock: 100 },
  { name: "Widget L", quantity: 45, damagedQuantity: 1, inStock: 44 },
  { name: "Widget M", quantity: 95, damagedQuantity: 8, inStock: 87 },
  { name: "Widget N", quantity: 65, damagedQuantity: 2, inStock: 63 },
  { name: "Widget O", quantity: 85, damagedQuantity: 4, inStock: 81 },
  { name: "Widget P", quantity: 60, damagedQuantity: 6, inStock: 54 },
  { name: "Widget Q", quantity: 100, damagedQuantity: 5, inStock: 95 },
  { name: "Widget R", quantity: 78, damagedQuantity: 3, inStock: 75 },
  { name: "Widget S", quantity: 88, damagedQuantity: 4, inStock: 84 },
  { name: "Widget T", quantity: 92, damagedQuantity: 2, inStock: 90 },
  { name: "Widget U", quantity: 70, damagedQuantity: 1, inStock: 69 },
  { name: "Widget V", quantity: 50, damagedQuantity: 0, inStock: 50 },
  { name: "Widget W", quantity: 80, damagedQuantity: 7, inStock: 73 },
  { name: "Widget X", quantity: 40, damagedQuantity: 3, inStock: 37 },
  { name: "Widget Y", quantity: 60, damagedQuantity: 2, inStock: 58 },
  { name: "Widget Z", quantity: 90, damagedQuantity: 5, inStock: 85 }
];


export default function ProductPage() {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', damagedQuantity: '', inStock: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addProduct = () => {
    if (!newProduct.name) return;
    const quantity = parseInt(newProduct.quantity) || 0;
    const damagedQuantity = parseInt(newProduct.damagedQuantity) || 0;
    const inStock = parseInt(newProduct.inStock) || 0;

    setProducts([...products, { name: newProduct.name, quantity, damagedQuantity, inStock }]);
    resetForm();
  };

  const updateProduct = (index) => {
    const quantity = parseInt(newProduct.quantity) || 0;
    const damagedQuantity = parseInt(newProduct.damagedQuantity) || 0;
    const inStock = parseInt(newProduct.inStock) || 0;

    const updated = [...products];
    updated[index] = { name: newProduct.name, quantity, damagedQuantity, inStock };
    setProducts(updated);
    resetForm();
  };

  const startEdit = (product, index) => {
    setEditIndex(index);
    setNewProduct({ ...product });
    setShowForm(true);
  };

  const cancelForm = () => resetForm();
  const resetForm = () => {
    setShowForm(false);
    setEditIndex(null);
    setNewProduct({ name: '', quantity: '', damagedQuantity: '', inStock: '' });
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'quantity', label: 'Total Quantity' },
    { key: 'issued', label: 'Issued Quantity' },
    { key: 'damagedQuantity', label: 'Damaged Quantity' },
    { key: 'inStock', label: 'In Stock' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={cancelForm}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editIndex !== null ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={cancelForm}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {['name', 'quantity', 'damagedQuantity', 'inStock'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === 'name' ? 'Product Name *' : field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    name={field}
                    type={field === 'name' ? 'text' : 'number'}
                    value={newProduct[field]}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={cancelForm} className="text-gray-600 px-3 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={editIndex !== null ? () => updateProduct(editIndex) : addProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
