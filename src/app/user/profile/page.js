'use client';

import { useState, useEffect } from "react";
import { Edit, Save, X, CheckCircle, History, AlertTriangle, BarChart2, GraduationCap, ArrowLeft, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useRouter } from "next/navigation";
import LoadingScreen from "../../../components/loading/loadingscreen";

const dummyUserDetails = {
  name: "Akshay KS",
  rollNo: "CB.SC.U4CSE23104",
  email: "akshay@gmail.com",
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
};

const UserProfile = () => {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(dummyUserDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: dummyUserDetails.name, phoneNo: dummyUserDetails.phoneNo });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // router.push('/auth/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/endpoint`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          localStorage.removeItem('token');
          // router.push('/auth/login');
          return;
        }

        const data = await res.json();
        // Merge API data with dummy data as fallback
        const merged = {
          ...dummyUserDetails,
          ...data,
          requests: Array.isArray(data.requests) && data.requests.length > 0 ? data.requests : dummyUserDetails.requests,
        };
        setUserDetails(merged);
        setEditData({ name: merged.name, phoneNo: merged.phoneNo });
      } catch (e) {
        // On error, fallback to dummy data
        setUserDetails(dummyUserDetails);
        setEditData({ name: dummyUserDetails.name, phoneNo: dummyUserDetails.phoneNo });
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setUserDetails({ ...userDetails, ...editData });
    setIsEditing(false);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update/${userDetails.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: editData.name,
          userPhoneNo: editData.phoneNo,
        }),
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (!userDetails) {
    return <LoadingScreen />;
  }

  // Prepare data for charts
  const requestStatusData = [
    { name: 'Pending', value: userDetails.requests.filter(r => r.status === 'pending').length },
    { name: 'Accepted', value: userDetails.requests.filter(r => r.status === 'accepted').length },
    { name: 'Rejected', value: userDetails.requests.filter(r => r.status === 'rejected').length },
  ];

  const componentBarData = userDetails.requests.map(req => ({
    name: req.requestId,
    components: req.totalComponents
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          {/* Header Title */}
          <div className="flex items-center">
            <Users className="text-blue-600 h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Left Section: User Details */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 xl:col-span-1 relative">
        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Edit size={16} />
        </button>

        {/* Avatar and Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-24 h-24 bg-blue-500 text-white text-3xl font-bold rounded-full mb-4">
            {userDetails.name
              .split(' ')
              .map((word) => word[0])
              .join('')
              .toUpperCase()}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{userDetails.name}</h3>
          <p className="text-gray-500 text-sm">{userDetails.rollNo}</p>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
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
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${userDetails.status === 'active' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <CheckCircle size={20} className={userDetails.status === 'active' ? 'text-green-600' : 'text-red-600'} />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-700 font-medium">Account Status</span>
                  <span className={`text-sm font-medium ${userDetails.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {userDetails.status === 'active' ? 'Active' : 'Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-full">
                  <GraduationCap size={20} className="text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Role</span>
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
                {userDetails.totalHistoryCount}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-full">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <span className="text-gray-700 font-medium">Damage Count</span>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {userDetails.damageCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-6">
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