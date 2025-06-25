"use client"

import { useState, useEffect } from "react"
import { Package, Activity, Clock, Edit, Save, X, CheckCircle, History, AlertTriangle, GraduationCap, ArrowLeft, Users ,PhoneIcon  } from "lucide-react"
import StatsCard from "../../../components/StatsCard"
import Calendar from "../../../components/user-calander"
import LoadingScreen from "../../../components/loading/loadingscreen"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter();
  const [stats] = useState({
    total_requests: 120,
    active_requests: 34,
    pending_requests: 7
  })
  
  const events = [
    {
      date: '24/06/2025',
      status: 'Issue Date',
      id: 'req-s-20012',
    },
    {
      date: '24/06/2025',
      status: 'Returning Date',
      id: 'req-s-20014',
    },
    {
      date: '24/06/2025',
      status: 'Issue Date',
      id: 'req-s-20015',
    },
    {
      date: '25/06/2025',
      status: 'Issue Date',
      id: 'req-s-20012',
    },
    {
      date: '28/06/2025',
      status: 'Returning Date',
      id: 'req-s-20014',
    },
    {
      date: '1/06/2025',
      status: 'Issue Date',
      id: 'req-s-20015',
    },
    {
      date: '4/06/2025',
      status: 'Issue Date',
      id: 'req-s-20012',
    },
    {
      date: '14/06/2025',
      status: 'Returning Date',
      id: 'req-s-20014',
    },
    {
      date: '15/06/2025',
      status: 'Issue Date',
      id: 'req-s-20015',
    },
    {
      date: '20/06/2025',
      status: 'Issue Date',
      id: 'req-s-20012',
    },
    {
      date: '6/06/2025',
      status: 'Returning Date',
      id: 'req-s-20014',
    },
    {
      date: '9/06/2025',
      status: 'Issue Date',
      id: 'req-s-20015',
    },
  ];

  // --- Profile logic from profile page ---
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phoneNo: "" });

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
        router.push('/auth/login');
      } else {
        const user = data.user;
        if (!user.isActive) {
          router.push('/auth/login');
        }
        fetchUser();
      }
    }
    verifyadmin();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/get-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      if (data && data.user) {
        setUserDetails({
          ...data.user,
          status: data.user.isActive ? "active" : "deactivated",
          damageCount: 0,
          totalHistoryCount: 0,
          requests: [],
        });
        setEditData({ name: data.user.name, phoneNo: data.user.phoneNo });
      }
    } catch (e) {
      setUserDetails(null);
    }
  };

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

  // --- End profile logic ---

  return (
    <div className="mx-auto px-0 sm:px-4 lg:px-6" style={{ maxWidth: '80rem', padding: '1.5rem 0', '@media (min-width: 640px)': { padding: '1.5rem 1rem' } }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-4 mb-4 sm:mb-10 px-2 sm:px-0">
        <StatsCard
          title="Total Requests"
          value={stats.total_requests}
          tooltip="All requests ever made"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Active Requests"
          value={stats.active_requests}
          tooltip="Issued items not yet returned"
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Returned Requests"
          value={stats.pending_requests}
          tooltip="Requests not yet accepted or processed"
          icon={Clock}
          color="yellow"
        />
      </div>
      
      {/* Calendar Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow">
          <Calendar events={events} />
        </div>
        <div className="w-full lg:w-1/3 flex flex-col">
          {/* Profile Card */}
          {!userDetails ? (
            <LoadingScreen />
          ) : (
            <div className="relative bg-white/90 rounded-3xl shadow border border-blue-100 p-0 overflow-hidden flex flex-col items-center group transition-all duration-300">
              {/* Decorative Cover */}
              <div className="w-full h-36 md:h-48 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 relative">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                  alt="cover"
                  className="object-cover w-full h-full opacity-60 blur-[1.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-indigo-500/30" />
                <button
                  onClick={handleEdit}
                  className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white/80 p-2 rounded-full hover:bg-blue-100 transition-colors shadow"
                  title="Edit Profile"
                >
                  <Edit size={18} />
                </button>
              </div>
              {/* Avatar */}
              <div className="relative -mt-20 mb-2">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                  <span className="text-5xl font-extrabold text-white drop-shadow-lg select-none">
                    {userDetails.name
                      ?.split(' ')
                      .map((word) => word[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </span>
                </div>
                {/* Status Badge */}
                <span className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                  ${userDetails.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {userDetails.isActive
                      ? <circle cx="10" cy="10" r="8" />
                      : <path d="M6 6l8 8M6 14L14 6" stroke="white" strokeWidth="2" strokeLinecap="round" />}
                  </svg>
                </span>
              </div>
              {/* Name & Roll */}
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2 tracking-tight">{userDetails.name || 'Loading...'}</h3>
              <p className="text-indigo-400 text-base font-medium">{userDetails.rollNo || ''}</p>
              {/* Info Grid */}
              <div className="w-full px-6 pb-8">
                <div className="grid grid-cols-1 gap-4">
                  {/* Email & Phone */}
                  <div className="flex flex-col md:flex-row justify-between gap-4 bg-white/90 rounded-xl p-4 shadow">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm break-all">{userDetails.email || 'N/A'}</p>
                    </div>
                    <div className="flex-shrink-0 md:text-right">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium">{userDetails.phoneNo || 'N/A'}</p>
                    </div>
                  </div>
                  {/* Status, Role, History, Damage */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {/* Account Status */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-green-50 rounded-xl px-4 py-3 shadow group-hover:scale-105 transition-transform">
                      <CheckCircle size={20} className={userDetails.status === 'active' ? 'text-green-600' : 'text-red-600'} />
                      <div>
                        <span className="block text-xs text-gray-500">Account Status</span>
                        <span className={`font-semibold text-sm ${userDetails.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                          {userDetails.status === 'active' ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                    </div>
                    {/* Role */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl px-4 py-3 shadow group-hover:scale-105 transition-transform">
                      <GraduationCap size={20} className="text-purple-600" />
                      <div>
                        <span className="block text-xs text-gray-500">Role</span>
                        <span className="font-semibold text-sm text-purple-700">
                          {userDetails.isFaculty ? 'Staff' : 'Student'}
                        </span>
                      </div>
                    </div>
                    {/* Total History */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl px-4 py-3 shadow group-hover:scale-105 transition-transform">
                      <History size={20} className="text-blue-600" />
                      <div>
                        <span className="block text-xs text-gray-500">Total History</span>
                        <span className="font-semibold text-sm text-blue-700">
                          {userDetails.totalHistoryCount || 0}
                        </span>
                      </div>
                    </div>
                    {/* Damage Count */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-red-100 to-red-50 rounded-xl px-4 py-3 shadow group-hover:scale-105 transition-transform">
                      <AlertTriangle size={20} className="text-red-600" />
                      <div>
                        <span className="block text-xs text-gray-500">Damage Count</span>
                        <span className="font-semibold text-sm text-red-700">
                          {userDetails.damageCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </div>
  )
}