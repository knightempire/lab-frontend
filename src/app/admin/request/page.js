'use client';

import { useState,useEffect } from 'react';
import { Users, Search, Eye, CheckCircle, Clock, XCircle, CalendarDays ,Repeat } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FacultyorStudentStatus from '../../../components/ui/FacultyorStudentStatus';
import FiltersPanel from '../../../components/FiltersPanel';

const requests = [
  { name: "Alice Kumar", rollNo: "2023123", phoneNo: "9876543210", email: "alice@example.com", isFaculty: false, requestedDate: "2025-05-05", isExtended: false },
  { name: "Rahul Mehta", rollNo: "2023456", phoneNo: "9123456789", email: "rahul@example.com", isFaculty: false, requestedDate: "2025-05-06", isExtended: true },
  { name: "Priya Sen", rollNo: "2023789", phoneNo: "9876501234", email: "priya@example.com", isFaculty: true, requestedDate: "2025-05-07", isExtended: false }
];

const columns = [
  { key: 'nameAndRoll', label: 'Name / Roll No' },
  { key: 'emailAndPhone', label: 'Email / Phone No' },
  { key: 'role', label: 'Role' },
  { key: 'requestedDate', label: 'Requested Date' },
  { key: 'requestType', label: 'Request Type' },
  { key: 'actions', label: 'Actions' }
];

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    requestType: ''
  });

  const itemsPerPage = 10;

  const handleReset = () => {
    setFilters({
      role: '',
      requestType: '',
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);
  
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getFilteredResults = () => {
    return requests.filter(req => {
      const matchesRole = filters.role === '' || (filters.role === 'Faculty' ? req.isFaculty : !req.isFaculty);
      const matchesRequestType = filters.requestType === '' || (filters.requestType === 'Extension' && req.isExtended) || (filters.requestType === 'New' && !req.isExtended);
      return matchesRole && matchesRequestType;
    }).filter(req =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredRequests = getFilteredResults();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterList = [
    { label: 'Role', key: 'role', options: ['', 'Faculty', 'Student'], value: filters.role },
    { label: 'Request Type', key: 'requestType', options: ['', 'New', 'Extension'], value: filters.requestType },
  ];

  const rows = paginatedRequests.map((item) => {
    let statusIcon, statusText, bgColor, textColor;

    switch (item.status) {
      case 'accepted':
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
      requestType: (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-sm ${
          item.isExtended ? 'bg-indigo-100 text-indigo-700' : 'bg-cyan-100 text-cyan-700'
        }`}>
          {item.isExtended ? (
            <>
              <Repeat size={16} className="text-indigo-700" />
              Extension
            </>
          ) : (
            <>
              <CheckCircle size={16} className="text-cyan-700" />
              New
            </>
          )}
        </div>
      ),
      actions: (
        <div className="flex gap-2 justify-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
            <Eye size={14} />
            View Request
          </button>
        </div>
      )
    };
  });

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50 ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
            Request Management
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
              Request Received: {requests.length}
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
