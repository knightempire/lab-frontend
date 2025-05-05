'use client';
import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Save, Package, Search } from 'lucide-react';

const initialProducts = [
  { name: "Widget A", quantity: 100, damagedQuantity: 5, inStock: 90 },
  { name: "Gadget B", quantity: 50, damagedQuantity: 2, inStock: 50 },
];

export default function ProductPage() {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', damagedQuantity: '', inStock: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="relative">
      {showForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="border border-gray-300 rounded-lg pl-30 pr-5 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-4 overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                    <th className="px-6 py-3 text-center">Product Name</th>
                    <th className="px-6 py-3 text-center">Total Quantity</th>
                    <th className="px-6 py-3 text-center">Damaged Quantity</th>
                    <th className="px-6 py-3 text-center">In Stock</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredProducts.map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-center font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-center">{product.quantity}</td>
                    <td className="px-6 py-4 text-center">{product.damagedQuantity}</td>
                    <td className="px-6 py-4 text-center">{product.inStock}</td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-x-2 pt-2 border-t border-gray-100">
                        <button onClick={() => startEdit(product, idx)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                            <Edit2 size={14} />
                            <span>Edit</span>
                        </button>
                        <button onClick={() => deleteProduct(idx)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
                            <Trash2 size={14} />
                            <span>Delete</span>
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow p-6 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No products found. Add some products to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            onClick={(e) => e.stopPropagation()}
          >
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  name="name"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  placeholder="0"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Damaged Quantity</label>
                <input
                  name="damagedQuantity"
                  type="number"
                  placeholder="0"
                  value={newProduct.damagedQuantity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
                <input
                  name="inStock"
                  type="number"
                  placeholder="0"
                  value={newProduct.inStock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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