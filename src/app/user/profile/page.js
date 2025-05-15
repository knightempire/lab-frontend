'use client';

import { useState } from "react";
import { Edit, Save, X, History, User, Package, AlertTriangle, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Table from '../../../components/table'; // Import your Table component
import Pagination from '../../../components/pagination'; // Import your Pagination component

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState({
    name: "Akshay KS",
    rollNo: "CB.SC.U4CSE23104",
    email: "akshay@gamil.com.com",
    phoneNo: "9876543210",
    isFaculty: false,
    damageCount: 3,
    totalHistoryCount: 15,
    status: "active",
    requests: [
      { requestId: "REQ123", totalComponents: 3, status: "pending", isReturned: false },
      { requestId: "REQ124", totalComponents: 1, status: "accepted", isReturned: true },
      { requestId: "REQ125", totalComponents: 5, status: "accepted", isReturned: false },
      { requestId: "REQ126", totalComponents: 2, status: "rejected", isReturned: false },
      { requestId: "REQ127", totalComponents: 4, status: "accepted", isReturned: true },
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: userDetails.name, phoneNo: userDetails.phoneNo });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setUserDetails({ ...userDetails, ...editData });
    setIsEditing(false);
  };

  // Calculate pagination data
  const totalPages = Math.ceil(userDetails.requests.length / itemsPerPage);
  const paginatedRequests = userDetails.requests.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Prepare data for charts
  const requestStatusData = [
    { name: 'Pending', value: userDetails.requests.filter(r => r.status === 'pending').length },
    { name: 'Accepted', value: userDetails.requests.filter(r => r.status === 'accepted').length },
    { name: 'Rejected', value: userDetails.requests.filter(r => r.status === 'rejected').length },
  ];

  const returnStatusData = [
    { name: 'Returned', value: userDetails.requests.filter(r => r.isReturned).length },
    { name: 'Not Returned', value: userDetails.requests.filter(r => !r.isReturned).length },
  ];

  const componentBarData = userDetails.requests.map(req => ({
    name: req.requestId,
    components: req.totalComponents
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

  // Define table columns and data for your Table component
  const tableColumns = [
    { key: 'requestId', label: 'Request ID' },
    { key: 'totalComponents', label: 'Components' },
    { key: 'status', label: 'Status' },
    { key: 'isReturned', label: 'Returned' }
  ];

  // Custom cell renderer for the Table component
  const renderTableCell = (key, row) => {
    if (key === 'status') {
      const statusClasses = {
        pending: 'bg-amber-100 text-amber-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[row.status]}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      );
    }
    if (key === 'isReturned') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isReturned ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>
          {row.isReturned ? "Yes" : "No"}
        </span>
      );
    }
    return row[key];
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-6">
      {/* Header with profile image and basic info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <button
            onClick={handleEdit}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          >
            <Edit size={16} />
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 bg-white text-blue-600 text-2xl font-bold rounded-full ring-4 ring-white/20 shadow-lg">
              {userDetails.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{userDetails.name}</h3>
              <p className="text-blue-100">{userDetails.rollNo}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${userDetails.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {userDetails.status === "active" ? "Active" : "Deactivated"}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userDetails.email}</p>
            </div>
            <div className="space-y-1 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{userDetails.phoneNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <User size={20} className="text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm">Role</p>
              <p className="font-medium text-blue-700">{userDetails.isFaculty ? "Staff" : "Student"}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
              <div className="bg-gray-100 p-2 rounded-full mb-2">
                <History size={20} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">Total History</p>
              <p className="font-medium text-gray-700">{userDetails.totalHistoryCount}</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex flex-col items-center">
              <div className="bg-red-100 p-2 rounded-full mb-2">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <p className="text-gray-500 text-sm">Damage Count</p>
              <p className="font-medium text-red-700">{userDetails.damageCount}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <Package size={20} className="text-green-600" />
              </div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <p className="font-medium text-green-700">{userDetails.requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests and Analytics Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Request History</h3>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-full">
              <BarChart2 size={18} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Requests: {userDetails.requests.length}</span>
          </div>
        </div>
        
        <div className="p-6">
          {/* Use your Table component */}
          <Table 
            columns={tableColumns}
            rows={paginatedRequests}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            renderCell={renderTableCell}
          />
          
          {/* Add the Pagination component */}
          {userDetails.requests.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Request Analytics</h3>
          <div className="bg-blue-50 p-2 rounded-full">
            <BarChart2 size={18} className="text-blue-600" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Request Status Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {requestStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Components Per Request</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={componentBarData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="components" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={handleCancel}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <Edit size={18} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {["name", "phoneNo"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field === "phoneNo" ? "Phone Number" : "Name"}
                  </label>
                  <input
                    name={field}
                    value={editData[field]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCancel}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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
};

export default UserProfile;