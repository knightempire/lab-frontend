'use client';

import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Save, Package, Search } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';

const initialProducts = [
  { name: "Widget A", quantity: 100, damagedQuantity: 5, inStock: 90 },
  { name: "Widget B", quantity: 50, damagedQuantity: 2, inStock: 50 },
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
  const itemsPerPage = 10;

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
    setProducts([...products, {
      name: newProduct.name,
      quantity: parseInt(newProduct.quantity) || 0,
      damagedQuantity: parseInt(newProduct.damagedQuantity) || 0,
      inStock: parseInt(newProduct.inStock) || 0
    }]);
    resetForm();
  };

  const updateProduct = (index) => {
    const updated = [...products];
    updated[index] = {
      name: newProduct.name,
      quantity: parseInt(newProduct.quantity) || 0,
      damagedQuantity: parseInt(newProduct.damagedQuantity) || 0,
      inStock: parseInt(newProduct.inStock) || 0
    };
    setProducts(updated);
    resetForm();
  };

  const startEdit = (product, index) => {
    setEditIndex(index);
    setNewProduct({ ...product });
    setShowForm(true);
  };

  const deleteProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const cancelForm = () => {
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditIndex(null);
    setNewProduct({ name: '', quantity: '', damagedQuantity: '', inStock: '' });
  };
  
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'quantity', label: 'Total Quantity' },
    { key: 'damagedQuantity', label: 'Damaged Quantity' },
    { key: 'inStock', label: 'In Stock' },
    { key: 'actions', label: 'Actions' },
  ];
  
  const rows = paginatedProducts.map((item, idx) => ({
    ...item,
    actions: (
      <div className="flex justify-center gap-x-4 pt-2 border-t border-gray-100">
        <button onClick={() => startEdit(item, (currentPage - 1) * itemsPerPage + idx)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
        <button onClick={() => deleteProduct((currentPage - 1) * itemsPerPage + idx)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    )
  }));
  
  return (
    <div className="bg-gray-50">
      {showForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            <Table
              columns={columns}
              rows={rows}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow p-6 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No products found. Add some products to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              <span>Add Your First Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={cancelForm}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn"
            onClick={(e) => e.stopPropagation()}>
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

            <div className="p-4 space-y-4">
              {['name', 'quantity', 'damagedQuantity', 'inStock'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field === 'name' ? 'Product Name *' : field.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                  </label>
                  <input
                    name={field}
                    type={field === 'name' ? 'text' : 'number'}
                    placeholder={field === 'name' ? 'Enter product name' : '0'}
                    value={newProduct[field]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

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
    </div>
  );
}