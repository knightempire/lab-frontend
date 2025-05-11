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

  // Initialize products and restore selections from localStorage
  useEffect(() => {
    // First initialize with default state (all products, none selected)
    let initializedProducts = initialProducts.map(p => ({ 
      ...p, 
      selected: false, 
      selectedQuantity: 0 
    }));
    
    // Try to restore selections from localStorage
    try {
      const storedProducts = localStorage.getItem('selectedProducts');
      if (storedProducts) {
        const selectedItems = JSON.parse(storedProducts);
        
        // Update the products with stored selection state
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
    } catch (error) {
      console.error('Failed to restore product selections:', error);
    }
    
    setProducts(initializedProducts);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleSelect = (index) => {
    const updated = [...products];
    const product = updated[index];
    product.selected = !product.selected;
    product.selectedQuantity = product.selected ? 1 : 0;
    setProducts(updated);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...products];
    const product = updated[index];

    if (!product.selected) return;

    const newQty = product.selectedQuantity + delta;

    if (newQty <= 0) {
      product.selected = false;
      product.selectedQuantity = 0;
    } else {
      product.selectedQuantity = newQty;
    }

    setProducts(updated);
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
    const selected = getSelectedProducts();
    // Store selected products in localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(selected));
    // Navigate to checkout page
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
                          const newQuantity = Math.max(0, Math.min(e.target.value, row.inStock));
                          if (newQuantity === 0) {
                            updateQuantity(globalIndex, -1);
                          } else {
                            const updated = [...products];
                            updated[globalIndex].selectedQuantity = parseInt(newQuantity);
                            setProducts(updated);
                          }
                        }}
                        className="w-10 text-center bg-transparent border-x border-gray-300 focus:outline-none text-gray-700"
                        min="0"
                        max={row.inStock}
                      />
                
                      {/* Plus Button */}
                      <button
                        className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
                        onClick={() => updateQuantity(globalIndex, 1)}
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