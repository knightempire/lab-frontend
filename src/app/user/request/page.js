'use client';

import { useState, useEffect } from 'react';
import { Users, Search, ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FiltersPanel from '../../../components/FiltersPanel';

const userRequests = [
  { requestId: "REQ103", date: "2025-05-12", items: "Arduino Kit, Breadboard", status: "Pending" },
  { requestId: "REQ102", date: "2025-05-10", items: "Raspberry Pi", status: "Approved" },
  { requestId: "REQ101", date: "2025-05-08", items: "Jumper Wires", status: "Rejected" },
  { requestId: "REQ100", date: "2025-05-01", items: "ESP32 Module", status: "Approved" },
];

const columns = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'date', label: 'Date' },
  { key: 'items', label: 'Requested Items' },
  { key: 'status', label: 'Status' },
];

export default function UserRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const itemsPerPage = 10;

  const handleReset = () => {
    setStatusFilter('');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const getFilteredRequests = () => {
    return userRequests
      .filter(req => 
        statusFilter === '' || req.status.toLowerCase() === statusFilter.toLowerCase()
      )
      .filter(req =>
        req.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.items.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredRequests = getFilteredRequests();
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterList = [
    { label: 'Status', key: 'status', options: ['', 'Pending', 'Approved', 'Rejected'], value: statusFilter },
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
    }

    return {
      ...req,
      status: (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
          {icon}
          {req.status}
        </div>
      )
    };
  });

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList size={28} className="text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
            My Requests
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
            Requests: {userRequests.length}
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
          <p className="text-gray-500">You haven't submitted any matching requests.</p>
        </div>
      )}
    </div>
  );
}
