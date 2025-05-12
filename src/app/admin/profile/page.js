'use client';

import { useState } from 'react';
import { Search, Users, Edit, CheckCircle, Eye, XCircle, Save, X, UserCircle2, GraduationCap , History} from 'lucide-react';
import DropdownFilter from '../../../components/DropdownFilter';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialUserDetails = {
  name: "Alice Kumar",
  email: "alice@example.com",
  phoneNo: "9876543210",
  rollNo: "2023123",
  status: "active",
  isFaculty: false,
  totalHistoryCount: 15,
  requests: [
    { requestId: "REQ123", totalComplaints: 3, status: "pending" },
    { requestId: "REQ124", totalComplaints: 1, status: "accepted" },
    { requestId: "REQ125", totalComplaints: 0, status: "rejected" },
    { requestId: "REQ126", totalComplaints: 2, status: "pending" },
    { requestId: "REQ127", totalComplaints: 1, status: "accepted" },
    { requestId: "REQ128", totalComplaints: 0, status: "rejected" }
  ]
};

const columns = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'totalComplaints', label: 'Total Complaints' },
  { key: 'status', label: 'Status' },
  { key: 'viewMore', label: 'View More' }
];

export default function UserProfilePage() {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(initialUserDetails);
  const [userStatus, setUserStatus] = useState(userDetails.status);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ ...userDetails });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const itemsPerPage = 5;

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProfileData({ ...userDetails });
  };

  const handleSaveProfile = () => {
    setUserDetails(editProfileData);
    setIsEditing(false);
    setUserStatus(editProfileData.status);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = () => {
    const newStatus = userStatus === 'active' ? 'deactivated' : 'active';
    setUserStatus(newStatus);
    setEditProfileData((prev) => ({ ...prev, status: newStatus }));
  };

  const totalPages = Math.ceil(userDetails.requests.length / itemsPerPage);

  const filteredRequests = userDetails.requests.filter((item) => {
    const matchesSearchQuery =
      item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === '' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearchQuery && matchesStatusFilter;
  });

  const paginatedRows = filteredRequests
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((item) => ({
      requestId: item.requestId,
      totalComplaints: item.totalComplaints,
      status: (
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-sm ${
            item.status === 'accepted'
              ? 'bg-green-100 text-green-700'
              : item.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {item.status === 'accepted' && <CheckCircle size={16} />}
          {item.status === 'pending' && <Eye size={16} />}
          {item.status === 'rejected' && <XCircle size={16} />}
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </div>
      ),
      viewMore: (
        <Link
            href={`/request-details/${item.requestId}`}
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1 whitespace-nowrap"
        >
            View More
        </Link>
        ),
    }));

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50">
      <div className="flex items-center gap-2 mb-6">
        <Users size={28} className="text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section: User Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative">
        <div className="absolute top-4 right-4">
            <button
            onClick={handleEditProfile}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
            >
            <Edit size={16} />
            </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
            <div className="relative">
            <UserCircle2 size={120} className="text-gray-300 mb-4 border-4 border-blue-50 rounded-full" />
            <div className="absolute bottom-4 right-2 bg-blue-500 text-white rounded-full p-1">
                {userDetails.isFaculty ? <GraduationCap size={16} /> : <Users size={16} />}
            </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{userDetails.name}</h3>
            <p className="text-gray-500 text-sm">{userDetails.rollNo}</p>
        </div>

        <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userDetails.email}</p>
            </div>
            <div className="space-y-2">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{userDetails.phoneNo}</p>
            </div>
            </div>

            {/* Status Section */}
            <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-full">
                    <CheckCircle size={20} className="text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Account Status</span>
                </div>
                <button
                onClick={handleStatusToggle}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ backgroundColor: userStatus === 'active' ? '#10B981' : '#6B7280' }}
                >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-full">
                    <GraduationCap size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Faculty Status</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                {userDetails.isFaculty ? 'Staff' : 'Student'}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-full">
                    <History size={20} className="text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Total History</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {userDetails.totalHistoryCount} actions
                </span>
            </div>
            </div>
        </div>
        </div>

        {/* Right Section: User Requests Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Requests</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative w-full sm:w-2/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dropdown Filter for Status */}
            <div className="w-full sm:w-1/3">
              <DropdownFilter
                label="Status"
                options={['', 'Accepted', 'Pending', 'Rejected']}
                selectedValue={statusFilter}
                onSelect={(value) => setStatusFilter(value)}
              />
            </div>
          </div>
          <Table
            columns={columns}
            rows={paginatedRows}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Name' },
                { key: 'phoneNo', label: 'Phone Number' },
                { key: 'rollNo', label: 'Roll Number' },
                { key: 'email', label: 'Email' },
                { key: 'totalHistoryCount', label: 'Total History' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    name={key}
                    type="text"
                    value={editProfileData[key]}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}