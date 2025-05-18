'use client';

import { useState, useEffect } from 'react';
import { Package, Search, ArrowRight } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { useRouter } from 'next/navigation';

const initialProducts = [
    { name: "Widget A", inStock: 90 },
    { name: "Widget B", inStock: 50 },
    { name: "Widget C", inStock: 65 },
    { name: "Widget D", inStock: 75 },
    { name: "Widget E", inStock: 59 },
    { name: "Widget F", inStock: 40 },
    { name: "Widget G", inStock: 84 },
    { name: "Widget H", inStock: 28 },
    { name: "Widget I", inStock: 50 },
    { name: "Widget J", inStock: 72 },
    { name: "Widget K", inStock: 100 },
    { name: "Widget L", inStock: 44 },
    { name: "Widget M", inStock: 87 },
    { name: "Widget N", inStock: 63 },
    { name: "Widget O", inStock: 81 },
    { name: "Widget P", inStock: 54 },
    { name: "Widget Q", inStock: 95 },
    { name: "Widget R", inStock: 75 },
    { name: "Widget S", inStock: 84 },
    { name: "Widget T", inStock: 90 },
    { name: "Widget U", inStock: 69 },
    { name: "Widget V", inStock: 50 },
    { name: "Widget W", inStock: 73 },
    { name: "Widget X", inStock: 37 },
    { name: "Widget Y", inStock: 58 },
    { name: "Widget Z", inStock: 85 },      
];

const columns = [
  { key: 'name', label: 'Product Name' },
  { key: 'inStock', label: 'In Stock' },
  { key: 'selected', label: 'Selected' },
];

export default function ProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


useEffect(() => {
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token'); // Adjust key if different

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.products) {
        let initializedProducts = data.products.map(product => ({
          name: product.name,
          inStock: product.inStock,
          selected: false,
          selectedQuantity: 0
        }));

        // Try to restore selections from localStorage
        const storedProducts = localStorage.getItem('selectedProducts');
        if (storedProducts) {
          const selectedItems = JSON.parse(storedProducts);
          initializedProducts = initializedProducts.map(product => {
            const selectedItem = selectedItems.find(item => item.name === product.name);
            if (selectedItem) {
              return {
                ...product,
                selected: true,
                selectedQuantity: selectedItem.selectedQuantity
              };
            }
            return product;
          });
        }

        setProducts(initializedProducts);
      } else {
        console.error('Failed to fetch products:', data.message || res.statusText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  fetchProducts();
}, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Helper function to save current selections to localStorage
  const saveSelectionsToLocalStorage = (updatedProducts) => {
    const selected = updatedProducts.filter(p => p.selected).map(p => ({ 
      name: p.name, 
      inStock: p.inStock, 
      selectedQuantity: p.selectedQuantity 
    }));
    localStorage.setItem('selectedProducts', JSON.stringify(selected));
  };

  const toggleSelect = (index) => {
    const updated = [...products];
    const product = updated[index];
    product.selected = !product.selected;
    product.selectedQuantity = product.selected ? 1 : 0;
    setProducts(updated);
    
    // Save selections immediately when toggling
    saveSelectionsToLocalStorage(updated);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...products];
    const product = updated[index];

    if (!product.selected) return;

    const newQty = product.selectedQuantity + delta;

    // Check if the new quantity exceeds available stock
    if (delta > 0 && newQty > product.inStock) {
      // If trying to exceed inStock, cap at max available
      product.selectedQuantity = product.inStock;
    } else if (newQty <= 0) {
      product.selected = false;
      product.selectedQuantity = 0;
    } else {
      product.selectedQuantity = newQty;
    }

    setProducts(updated);
    
    // Save selections immediately when updating quantity
    saveSelectionsToLocalStorage(updated);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSelectedProducts = () => {
    return products.filter(p => p.selected).map(p => ({ 
      name: p.name, 
      inStock: p.inStock, 
      selectedQuantity: p.selectedQuantity 
    }));
  };

  const handleProceed = () => {
    // Navigate to checkout page - no need to save to localStorage again
    // as we're already saving on every selection change
    router.push('/user/checkout');
  };

  // Check if any products are selected
  const hasSelectedProducts = products.some(p => p.selected);

  // Reordered columns
  const reorderedColumns = [
    ...columns.filter(col => col.key !== 'selected'),
    ...(hasSelectedProducts ? [{ key: 'quantity', label: 'Quantity' }] : []),
    ...columns.filter(col => col.key === 'selected'),
  ];

  return (
    <div className="h-full w-full">
      <div className="p-4 md:p-3 mx-auto bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
              Products Available
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
                Total Products: {initialProducts.length}
              </span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-10">
          </div>
        </div>

        <div className="mb-6 w-full relative bg-white">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <Table
              columns={reorderedColumns}
              rows={paginatedProducts}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              renderCell={(colKey, row, rowIndex) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + rowIndex;
                if (colKey === 'quantity') {
                  return row.selected ? (
                    <div className="inline-flex items-center border border-gray-300 rounded-md bg-white overflow-hidden">
                      {/* Minus Button */}
                      <button
                        className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                        onClick={() => updateQuantity(globalIndex, -1)}
                      >
                        −
                      </button>
                
                      {/* Editable Quantity */}
                      <input
                        type="text"
                        value={row.selectedQuantity}
                        onChange={(e) => {
                          // Parse as integer and ensure it's a valid number
                          const value = parseInt(e.target.value) || 0;
                          // Make sure it doesn't exceed stock and is not negative
                          const newQuantity = Math.max(0, Math.min(value, row.inStock));
                          
                          const updated = [...products];
                          if (newQuantity === 0) {
                            updated[globalIndex].selected = false;
                            updated[globalIndex].selectedQuantity = 0;
                          } else {
                            updated[globalIndex].selectedQuantity = newQuantity;
                          }
                          setProducts(updated);
                          
                          // Save selections immediately when manually editing quantity
                          saveSelectionsToLocalStorage(updated);
                        }}
                        className="w-10 text-center bg-transparent border-x border-gray-300 focus:outline-none text-gray-700"
                        min="0"
                        max={row.inStock}
                      />
                
                      {/* Plus Button */}
                      <button
                        className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                        onClick={() => updateQuantity(globalIndex, 1)}
                        // Disable button if at max stock
                        disabled={row.selectedQuantity >= row.inStock}
                      >
                        +
                      </button>
                    </div>
                  ) : null;
                } 
                else if (colKey === 'selected') {
                  return (
                    <div className="flex justify-center items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleSelect(globalIndex)}
                      />
                    </div>
                  );
                }
                return row[colKey];
              }}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
            {hasSelectedProducts && (
              <div className="fixed bottom-6 right-6 justify-end flex">
                <button
                  onClick={handleProceed}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow p-6 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}