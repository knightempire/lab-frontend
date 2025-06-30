'use client';

// app/admin/requests/page.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Eye, CheckCircle, Clock, XCircle, CalendarDays, Download, AlertTriangle,Repeat, Undo  } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FacultyorStudentStatus from '../../../components/ui/FacultyorStudentStatus';
import FiltersPanel from '../../../components/FiltersPanel';
import { useRouter } from 'next/navigation';
import LoadingScreen from "../../../components/loading/loadingscreen";
import * as XLSX from 'xlsx';
import { apiRequest } from '../../../utils/apiRequest';
export default function RequestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
const [requests, setRequests] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [productOptions, setProductOptions] = useState([]);

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
      if (!user.isAdmin ) {
        router.push('/auth/login'); 
      }
      if (!user.isActive) {
               router.push('/auth/login'); 
      }
    }
  }

  verifyadmin();

  fetchRequests();
}, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch products
      const productRes = await apiRequest(`/products/get`, {
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

      // Fetch requests
      const res = await apiRequest(`/request/get`, {
        method: 'GET',
        headers:
         {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data?.requests) {
        // Step 1: Filter out pending and not-yet-collected as before
        let filtered = data.requests.filter(req => {
          const status = req.requestStatus?.toLowerCase();
          if (status === 'pending') return false;
          if (status === 'approved' && !req.collectedDate) return false;
          return true;
        });

        // Step 2: For requests with reIssued, check the latest re-issue status
        const token = localStorage.getItem('token');
        const filteredWithReissue = await Promise.all(filtered.map(async req => {
          if (
            req.requestStatus?.toLowerCase() === 'approved' &&
            req.collectedDate &&
            Array.isArray(req.reIssued) &&
            req.reIssued.length > 0
          ) {
            // Get the latest reIssuedId
            const latestReIssuedId = req.reIssued[req.reIssued.length - 1];
            try {
              const reissueRes = await apiRequest(
                `/reIssued/get/${latestReIssuedId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              if (!reissueRes.ok) return req; // If error, keep it
              const reissueData = await reissueRes.json();
              // If re-issue status is pending, filter out (return null)
              if (reissueData?.reIssued?.status === 'pending') return null;
              return req;
            } catch {
              return req; // On error, keep it
            }
          }
          return req;
        }));

        // Remove nulls (those with pending re-issue)
        const finalFiltered = filteredWithReissue.filter(Boolean);

        // Only declare once!
        let formattedRequests = finalFiltered.map(req => ({
          // ...mapping...
          id: req._id,
          requestId: req.requestId,
          name: req.userId.name,
          rollNo: req.userId.rollNo,
          phoneNo: req.userId.phoneNo,
          email: req.userId.email,
          isFaculty: req.userId.isFaculty,
          requestedDate: new Date(req.requestDate).toISOString().split('T')[0],
          requestedDays: req.requestedDays,
          status: req.requestStatus?.toLowerCase() || 'pending',
          isExtended: req.reIssued?.length > 0,
          referenceStaff: {
            name: req.referenceId?.name || 'N/A',
            email: req.referenceId?.email || 'N/A'
          },
          description: req.description,
          components: req.requestedProducts.map(prod => ({
            id: prod.productId,
            name: productMap[prod.productId] || prod.productId,
            quantity: prod.quantity
          }))
        }));

        // Sort after mapping
        const statusOrder = {
          approved: 0,
          accepted: 0,
          reissued: 0,
          returned: 2,
          closed: 3,
          rejected: 4,
        };

        formattedRequests = formattedRequests.sort((a, b) => {
          const statusA = statusOrder[a.status] ?? 99;
          const statusB = statusOrder[b.status] ?? 99;
          if (statusA !== statusB) return statusA - statusB;

          // Extract numeric part of requestId for descending order
          const numA = parseInt(a.requestId.replace(/\D/g, ''), 10);
          const numB = parseInt(b.requestId.replace(/\D/g, ''), 10);
          return numB - numA;
        });

        
        setRequests(formattedRequests);
      }
    } catch (err) {
      console.error('Failed to fetch requests or products:', err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;

  const handleReset = () => {
    setFilters({
      role: '',
      status: '',
    });
    setSelectedProducts([]);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, selectedProducts]);
  
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleProductsChange = (products) => {
    setSelectedProducts(products);
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
    (filterStatus === 'accepted' && (requestStatus === 'accepted' || requestStatus === 'approved' )) ||
    requestStatus === filterStatus;

      
  // Filter by selected products
  const matchesProducts =
    selectedProducts.length === 0 ||
    selectedProducts.every(productId =>
      req.components.some(component => component.id === productId)
    );

    return matchesRole && matchesStatus && matchesProducts;
    }).filter(req =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDownloadIssued = () => {
    const exportData = filteredRequests.map(req => ({
      'request_id': req.requestId,
      'roll_no': req.rollNo,
      'name': req.name,
      'request_date': (() => {
        if (!req.requestedDate) return "-";
        const d = new Date(req.requestedDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      })(),
      'component_name': req.components.map(c => {
        const found = productOptions.find(p => p.id === c.id);
        return found ? found.name : c.id;
      }).join(', '),
      'status': req.statusText || req.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Issued');

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const filename = `issued_requests_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const handleViewRequest = (request) => {
    // Using requestId instead of id for the route parameter
    router.push(`/admin/return?requestId=${encodeURIComponent(request.requestId)}`);
  };

  const filteredRequests = getFilteredResults();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterList = [
    { label: 'Role', key: 'role', options: ['', 'Faculty', 'Student'], value: filters.role },
    { label: 'Status', key: 'status', options: ['', 'Accepted', 'Returned', 'Rejected',"Closed" , "ReIssued"], value: filters.status },
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
        statusIcon = <CheckCircle  size={16} className="text-green-700" />;
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
        case 'returned':
          statusIcon = <Undo size={16} className="text-blue-700" />;
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-700';
          statusText = 'Returned';
          break;
      case 'rejected':
        statusIcon = <XCircle size={16} className="text-red-700" />;
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        statusText = 'Rejected';
        break;
      case 'closed':
        statusIcon = <AlertTriangle size={16} className="text-amber-700" />;
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-700';
        statusText = 'Closed';
        break;
    case 'reissued':
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
      requestId: (
        <span className="text-xs text-gray-700">{item.requestId}</span>
      ),
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
          {(() => {
            if (!item.requestedDate) return "-";
            const d = new Date(item.requestedDate);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
          })()}
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
        <LoadingScreen />
      </div>
    );
  }
  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50 ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
            Issued Requests
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
              Total: {requests.length}
            </span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleDownloadIssued}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 mt-1"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download Issued</span>
          </button>
        </div>
      </div>

      <div className="mb-4 mt-6">
        <FiltersPanel
          filters={filterList}
          onChange={handleFilterChange}
          onReset={handleReset}
          Text="All requests"
          products={productOptions}
          onProductsChange={handleProductsChange}
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
          <Table columns={columns} rows={rows} currentPage={currentPage} itemsPerPage={itemsPerPage}/>
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
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