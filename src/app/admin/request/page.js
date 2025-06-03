'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  CalendarDays,
  Repeat
} from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FacultyorStudentStatus from '../../../components/ui/FacultyorStudentStatus';
import FiltersPanel from '../../../components/FiltersPanel';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [selectedProducts, setselectedProducts] = useState([]);
const [productOptions, setProductOptions] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

              const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/get`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const productData = await productRes.json();

      const productMap = {};
      if (productData?.products) {
        const displayable = productData.products.filter(p => p.product.isDisplay);
        const mappedOptions = displayable.map(p => ({
          id: p.product._id,
          name: p.product.product_name
        }));
        setProductOptions(mappedOptions);

        // Build id-to-name mapping
        mappedOptions.forEach(p => {
          productMap[p.id] = p.name;
        });
      }




        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/get`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Fetched requests:', data);

        if (response.ok && data?.requests) {

          const filtered = data.requests.filter(req => {
          const status = req.requestStatus?.toLowerCase();
          if (status === 'rejected') return false;
          if (status === 'approved' && req.collectedDate) return false;
          return true;
        });

        
          const transformedRequests = filtered.map((req, index) => ({
            id: req._id,
            requestId: req.requestId || `REQ-${index + 1}`,
            name: req.userId?.name || 'Unknown',
            rollNo: req.userId?.rollNo || 'N/A',
            phoneNo: req.userId?.phoneNo || 'N/A', // Not provided
            email: req.userId?.email || 'N/A',
            isFaculty: req.userId?.role === 'faculty', // Update if role is not present
            requestedDate: new Date(req.requestDate).toISOString().split('T')[0],
            requestedDays: req.requestedDays,
            status: req.requestStatus.toLowerCase(),
            isExtended: false, // Assuming not in response
            referenceStaff: {
              name: req.referenceId?.name || 'N/A',
              email: req.referenceId?.email || 'N/A'
            },
            description: req.description || '',
        components: req.requestedProducts.map(product => ({
          id: product.productId, 
          quantity: product.quantity
        }))

          }));

          setRequests(transformedRequests);
        } else {
          setError(data.message || 'Failed to fetch requests.');
        }
      } catch (err) {
        setError('Something went wrong while fetching requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, selectedProducts]);

  const handleReset = () => {
    setFilters({
      role: '',
      status: '',
    });
    setselectedProducts([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleComponentsChange = (components) => {
    setselectedProducts(components);
  };

  const getUniqueComponents = () => {
    const componentSet = new Set();
    console.log('Product options IDs:', mappedOptions.map(p => p.id));
    requests.forEach(request => {
        console.log(`Request ${r.requestId} component IDs:`, r.components.map(c => c.id));
      request.components.forEach(component => {
        componentSet.add(component.name);
      });
    });
    return Array.from(componentSet);
  };

const getFilteredResults = () => {
  return requests.filter(req => {
    // Filter by role
    const matchesRole = filters.role === '' || 
      (filters.role === 'Faculty' ? req.isFaculty : !req.isFaculty);

    // Filter by status
    const filterStatus = filters.status.toLowerCase();
    const requestStatus = req.status.toLowerCase();
    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'accepted' && (requestStatus === 'accepted' || requestStatus === 'approved')) ||
      requestStatus === filterStatus;

    // Filter by selected products
    console.log(`\nChecking request ${req.requestId} components:`, req.components.map(c => c.id));
    console.log('Selected product IDs:', selectedProducts);

const matchesProducts =
  selectedProducts.length === 0 ||
selectedProducts.every(productId =>
  req.components.some(component => component.id === productId)
)



    console.log(`Request ${req.requestId} matchesProducts:`, matchesProducts);

    return matchesRole && matchesStatus && matchesProducts;
  });
};


  const handleViewRequest = (request) => {
    const params = new URLSearchParams();
    params.append('requestId', request.requestId);
    router.push(`/admin/review?${params.toString()}`);
  };


  const filteredRequests = getFilteredResults();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterList = [
    { label: 'Role', key: 'role', options: ['', 'Faculty', 'Student'], value: filters.role },
    { label: 'Status', key: 'status', options: ['', 'Accepted', 'Pending', 'Rejected', 'Extension'], value: filters.status },
  ];

  const columns = [
    { key: 'nameAndRoll', label: 'Name / Roll No' },
    { key: 'requestId', label: 'Request ID' },
    { key: 'emailAndPhone', label: 'Email / Phone No' },
    { key: 'role', label: 'Role' },
    { key: 'requestedDate', label: 'Requested Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = paginatedRequests.map((item) => {
    let statusIcon, statusText, bgColor, textColor;

    switch (item.status) {
      case 'accepted':
      case 'approved':
        statusIcon = <CheckCircle size={16} className="text-green-700" />;
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        statusText = 'Accepted';
        break;
      case 'pending':
        statusIcon = <Clock size={16} className="text-yellow-700" />;
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
        statusText = 'Pending';
        break;
      case 'rejected':
        statusIcon = <XCircle size={16} className="text-red-700" />;
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        statusText = 'Rejected';
        break;
      case 'extension':
        statusIcon = <Repeat size={16} className="text-indigo-700" />;
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-700';
        statusText = 'Extension';
        break;
      default:
        statusIcon = <Clock size={16} className="text-gray-500" />;
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        statusText = 'Unknown';
        break;
    }

    return {
      ...item,
      nameAndRoll: (
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 text-blue-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center">
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            <span className="text-gray-500 text-sm">{item.rollNo}</span>
          </div>
        </div>
      ),
      requestId: <span className="text-xs text-gray-700">{item.requestId}</span>,
      emailAndPhone: (
        <div className="flex flex-col items-center text-center">
          <span className="font-medium">{item.email}</span>
          <span className="text-gray-500 text-sm">{item.phoneNo}</span>
        </div>
      ),
      role: <FacultyorStudentStatus value={item.isFaculty} />,
      requestedDate: (
        <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
          <CalendarDays size={14} />
          {item.requestedDate}
        </div>
      ),
      status: (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-sm ${bgColor} ${textColor}`}>
          {statusIcon}
          {statusText}
        </div>
      ),
      actions: (
        <div className="flex gap-2 justify-center">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            onClick={() => handleViewRequest(item)}
          >
            <Eye size={14} />
            View Request
          </button>
        </div>
      )
    };
  });

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <p className="text-gray-500">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
            Request Management
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
              Requests Received: {requests.length}
            </span>
          </h1>
        </div>
      </div>

      <div className="mb-4 mt-6">
        <FiltersPanel
          filters={filterList}
          onChange={handleFilterChange}
          onReset={handleReset}
          Text="All requests"
            products={productOptions}
          onProductsChange={handleComponentsChange}
          selectedProducts={selectedProducts}
        />
      </div>

      <div className="mb-6 w-full relative bg-white">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search requests..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredRequests.length > 0 ? (
        <>
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
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-inner">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No matching requests found.</p>
        </div>
      )}
    </div>
  );
}
