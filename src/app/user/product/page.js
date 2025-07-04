'use client';

import { useState, useEffect } from 'react';
import { Package, Search, ArrowRight } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { useRouter } from 'next/navigation';
import LoadingScreen from "../../../components/loading/loadingscreen";
import { apiRequest } from '../../../utils/apiRequest';

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
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  // Initialize products and restore selections from localStorage
  useEffect(() => {

        const verifyadmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/login'); 
      }

      const res = await apiRequest(`/verify-token`, {
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

      if (!user.isActive) {
          router.push('/auth/login'); 
      }


           fetchProducts();
  
    }
  }

    verifyadmin();



 

  }, []);


     const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      router.push('/auth/login');
      return;
    }

    const res = await apiRequest(`/products/get`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // If 404, treat as no products
      if (res.status === 404) {
        setProducts([]);
      }
      console.error('Failed to fetch products:', res.statusText);
      setLoading(false);
      return;
    }

    const data = await res.json();


        const fetchedProducts = data.products.map(p => {
          const prod = p.product;
          const inStock = Math.max(0, prod.inStock - prod.yetToGive);
          return {
            id: prod._id,
            name: prod.product_name,
            inStock: inStock,
            selected: false,
            selectedQuantity: 0
          };
        });

        // Load previous selections from localStorage
        const storedProducts = localStorage.getItem('selectedProducts');
        if (storedProducts) {
          const selectedItems = JSON.parse(storedProducts);

          const mergedProducts = fetchedProducts.map(product => {
            const selected = selectedItems.find(item => item.name === product.name);
            // Only restore selection if inStock > 0
            if (selected && product.inStock > 0) {
              return {
                ...product,
                selected: true,
                selectedQuantity: selected.selectedQuantity
              };
            }
            // Otherwise, ensure not selected
            return {
              ...product,
              selected: false,
              selectedQuantity: 0
            };
          });

          setProducts(mergedProducts);

          const cleanedSelected = mergedProducts
          .filter(p => p.selected && p.inStock > 0)
          .map(p => ({
            id: p.id,
            name: p.name,
            inStock: p.inStock,
            selectedQuantity: p.selectedQuantity
          }));
        localStorage.setItem('selectedProducts', JSON.stringify(cleanedSelected));
        } else {
          
          setProducts(fetchedProducts);
          
        }

      } catch (err) {
        console.error('Failed to fetch or restore products:', err);
        setProducts([]); // treat as no products
        setLoading(false);
      }
      setLoading(false); // Set loading to false after fetch
    };


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Helper function to save current selections to localStorage
  const saveSelectionsToLocalStorage = (updatedProducts) => {
    const selected = updatedProducts
      .filter(p => p.selected && p.inStock > 0) // Only save if in stock
      .map(p => ({
        id: p.id,
        name: p.name,
        inStock: p.inStock,
        selectedQuantity: p.selectedQuantity
      }));
    localStorage.setItem('selectedProducts', JSON.stringify(selected));
  };

  const toggleSelect = (id) => {
    const updated = products.map(product =>
      product.id === id
        ? {
            ...product,
            selected: !product.selected,
            selectedQuantity: !product.selected ? 1 : 0
          }
        : product
    );
    setProducts(updated);
    saveSelectionsToLocalStorage(updated);
  };

  const updateQuantity = (id, delta) => {
    setProducts(prevProducts => {
      const updated = prevProducts.map(product => {
        if (product.id !== id) return product;
        if (!product.selected) return product;
        const newQty = product.selectedQuantity + delta;
        if (delta > 0 && newQty > product.inStock) {
          return { ...product, selectedQuantity: product.inStock };
        } else if (newQty <= 0) {
          return { ...product, selected: false, selectedQuantity: 0 };
        } else {
          return { ...product, selectedQuantity: newQty };
        }
      });
      saveSelectionsToLocalStorage(updated);
      return updated;
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortKey === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortKey === 'inStock') {
      return sortOrder === 'asc'
        ? a.inStock - b.inStock
        : b.inStock - a.inStock;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleProceed = () => {
    // Navigate to checkout page - no need to save to localStorage again as we're already saving on every selection change
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

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="p-0 md:p-3 mx-auto bg-gray-50 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-0 md:px-0 pt-4 md:pt-0">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-blue-600" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span>Products Available</span>
              <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg w-fit">
                Total Products: {products.length}
              </span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-10">
          </div>
        </div>

        <div className="mb-6 w-full relative bg-white rounded-lg shadow-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          />
        </div>

        {filteredProducts.length > 0 ? (
          <div className="px-0 md:px-0">
            <Table
              columns={reorderedColumns}
              rows={paginatedProducts}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              renderHeaderCell={(col) => {
                if (col.key === 'name' || col.key === 'inStock') {
                  return (
                    <button
                      type="button"
                      className="group flex items-center justify-center gap-2 font-semibold uppercase w-full text-xs sm:text-sm"
                      style={{ minWidth: '10rem' }}
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
                return col.label;
              }}
              renderCell={(colKey, row) => {
                if (colKey === 'quantity') {
                  return row.selected ? (
                    <div className="inline-flex items-center border border-gray-300 rounded-md bg-white overflow-hidden">
                      {/* Minus Button */}
                      <button
                        className="text-gray-500 hover:text-gray-700 flex items-center justify-center"
                        style={{ width: '2rem', height: '2rem' }}
                        onClick={() => updateQuantity(row.id, -1)}
                      >
                        -
                      </button>

                      {/* Editable Quantity */}
                      <input
                        type="text"
                        value={row.selectedQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const newQuantity = Math.max(0, Math.min(value, row.inStock));
                          const updated = products.map(product => {
                            if (product.id !== row.id) return product;
                            if (newQuantity === 0) {
                              return { ...product, selected: false, selectedQuantity: 0 };
                            } else {
                              return { ...product, selected: true, selectedQuantity: newQuantity };
                            }
                          });
                          setProducts(updated);
                          saveSelectionsToLocalStorage(updated);
                        }}
                        className="text-center bg-transparent border-x border-gray-300 focus:outline-none text-gray-700"
                        style={{ width: '2.5rem' }}
                        min="0"
                        max={row.inStock}
                      />

                      {/* Plus Button */}
                      <button
                        className="text-gray-500 hover:text-gray-700 flex items-center justify-center"
                        style={{ width: '2rem', height: '2rem' }}
                        onClick={() => updateQuantity(row.id, 1)}
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
                        onChange={() => toggleSelect(row.id)}
                        disabled={row.inStock === 0}
                        title={row.inStock === 0 ? "Out of stock" : ""}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
                  style={{ padding: '1rem' }}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow text-center" style={{ padding: '1.5rem' }}>
            <Package size={48} className="mx-auto text-gray-300" style={{ marginBottom: '0.75rem' }} />
            <p className="text-gray-500" style={{ marginBottom: '1rem' }}>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}