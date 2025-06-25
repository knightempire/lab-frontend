'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, ClipboardList, CheckCircle, Clock, XCircle, Eye, AlertTriangle,Undo , Repeat} from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FiltersPanel from '../../../components/FiltersPanel';
import LoadingScreen from "../../../components/loading/loadingscreen";

const columns = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'date', label: 'Date' },
  { key: 'items', label: 'Requested Items' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

export default function UserRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  const handleReset = () => setStatusFilter('');

  const handleViewRequest = (request) => {
    const params = new URLSearchParams({ requestId: request.requestId });
    router.push(`/user/review?${params.toString()}`);
  };

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
      if (!user.isActive) {
          router.push('/auth/login'); 
      }

      console.log('User is admin, proceeding with request data fetch');
        fetchRequests();
  
    }
  }

    verifyadmin();

  }, []);

     const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.requests) {
          const formatted = data.requests.map(req => ({
            requestId: req.requestId,
            date: new Date(req.requestDate).toISOString().split('T')[0],
            items: `${req.requestedProducts.length} items`,
            status: req.requestStatus.charAt(0).toUpperCase() + req.requestStatus.slice(1),
            raw: req,
          }));

          setRequests(formatted);
        } else {
          console.error('Failed to fetch requests', data.message);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
      setLoading(false); // Set loading to false after fetch
    };
    
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

const getFilteredRequests = () => {
  return requests
    .filter(req => {
      if (statusFilter === '') return true;
      if (statusFilter.toLowerCase() === 'extension') {
        return req.status.toLowerCase() === 'reissued';
      }
      return req.status.toLowerCase() === statusFilter.toLowerCase();
    })
    .filter(req =>
      req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.items.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const idA = parseInt(a.requestId.replace(/\D/g, ''));
      const idB = parseInt(b.requestId.replace(/\D/g, ''));
      return idB - idA;
    });
};


  const filteredRequests = getFilteredRequests();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterList = [
    { label: 'Status', key: 'status', options: ['', 'Pending', 'Approved', 'Rejected','Returned','Closed' ,'Extension'], value: statusFilter },
  ];

  const rows = paginatedRequests.map((req) => {
    let icon, bg, text;
    
    switch (req.status) {
      case 'Approved':
        icon = <CheckCircle size={16} className="text-green-700" />;
        bg = 'bg-green-100';
        text = 'text-green-700';
        break;
      case 'Pending':
        icon = <Clock size={16} className="text-yellow-700" />;
        bg = 'bg-yellow-100';
        text = 'text-yellow-700';
        break;
      case 'Rejected':
        icon = <XCircle size={16} className="text-red-700" />;
        bg = 'bg-red-100';
        text = 'text-red-700';
        break;
      case 'Returned':
        icon = <Undo size={16} className="text-blue-700" />;
        bg = 'bg-blue-100';
        text = 'text-blue-700';
        break;
      case 'Closed':
       icon = <AlertTriangle size={16} className="text-amber-700" />;
        bg = 'bg-amber-100';
        text = 'text-amber-700';
        break;
        case 'ReIssued':
        icon = <Repeat size={16} className="text-indigo-700" />;
        bg = 'bg-indigo-100';
        text = 'text-indigo-700';
        break;
    }

    return {
      ...req,
      requestId: <span className="text-xs text-gray-700">{req.requestId}</span>,
      status: (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
          {icon}
          {req.status === 'ReIssued' ? 'Extension' : req.status}
        </div>
      ),
      actions: (
        <div className="flex gap-2 justify-center">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            onClick={() => handleViewRequest(req.raw)}
          >
            <Eye size={14} />
            View Request
          </button>
        </div>
      ),
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
    <div className="h-full w-full md:p-3 mx-auto bg-gray-50">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList size={28} className="text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
          My Requests
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
            Requests: {requests.length}
          </span>
        </h1>
      </div>

      <div className="mb-4 mt-6">
        <FiltersPanel
          filters={filterList}
          onChange={(key, value) => setStatusFilter(value)}
          onReset={handleReset}
          Text="All Requests"
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
          <Table columns={columns} rows={rows} currentPage={currentPage} itemsPerPage={itemsPerPage} />
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-inner">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">You haven&apos;t submitted any matching requests.</p>
        </div>
      )}
    </div>
  );
}
