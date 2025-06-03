'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Edit, CheckCircle, Eye, XCircle, Clock, Save, X, GraduationCap, History, ArrowLeft, FileX, Loader2 } from 'lucide-react';
import DropdownFilter from '../../../components/DropdownFilter';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingScreen from '../../../components/loading/loadingscreen';
import Link from 'next/link';

const columns = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'totalComponents', label: 'Total Components' },
  { key: 'status', label: 'Status' },
  { key: 'isReturned', label: 'Returned Status' },
  { key: 'viewMore', label: 'View More' }
];

const UserProfilePageView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get rollNo from URL parameters
  
  
  const [userDetails, setUserDetails] = useState({});
  const [userStatus, setUserStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const [returnedStatusFilter, setReturnedStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 7;

  console.log('UserProfilePage rendered');

  useEffect(() => {
    console.log('UserProfilePage useEffect triggered');
    const rollNo = searchParams.get('rollNo');
    console.log('UserProfilePage useEffect triggered');
    console.log('rollNo from URL:', rollNo);
    
    // If no rollNo is provided, show error
    if (!rollNo) {
      console.error('No rollNo provided in URL');
      setError('No user specified in URL');
      router.push('/admin/users'); 
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        router.push('/auth/login');
        return false;
      }
      console.log('Verifying token:', token);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        console.log('Token verification response:', data);
        if (!res.ok) {
          console.error('Token verification failed:', data.message);
          router.push('/auth/login');
          return false;
        }
        
        const user = data.user;
        if (!user.isAdmin || !user.isActive) {
          router.push('/auth/login');
          return false;
        }
        fetchUserData(); // Fetch user data after successful token verification
        console.log('Token verified successfully');
        return true;
      } catch (err) {
        console.error('Token verification error:', err);
        router.push('/auth/login');
        return false;
      }
    };

  const fetchUserData = async () => {
    

    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let endpoint = `${baseUrl}/api/users/get/${rollNo}`;
    console.log('Fetching user data from endpoint:', endpoint);

    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('User data response:', data);

      if (!res.ok) {
        // If the first endpoint fails, try alternative approaches
        if (res.status === 404) {
          // Try getting all users and filter by rollNo
          const allUsersRes = await fetch(`${baseUrl}/api/users/get`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (allUsersRes.ok) {
            const allUsersData = await allUsersRes.json();
            const user = allUsersData.users?.find(u => u.rollNo === rollNo);
            
            if (user) {
              setUserDetails(user);
              setUserStatus(user.isActive ? 'active' : 'deactivated');
              setEditProfileData({ ...user });
              setLoading(false);
              return;
            }
          }
        }
        
        setError(data.message || `Failed to fetch user data. Status: ${res.status}`);
        return;
      }

      // Handle the response based on your API structure
      const userData = data.user || data; // Adjust based on your API response structure
      
      setUserDetails(userData);
      setUserStatus(userData.isActive ? 'active' : 'deactivated');
      setEditProfileData({ ...userData });
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

verifyToken();

  }, [ router]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProfileData({ ...userDetails });
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // Use the user's ID for update, not rollNo
    const userId = userDetails._id || userDetails.id;
    let endpoint = `${baseUrl}/api/users/update/${rollNo}`;
    
    // If your API uses rollNo for updates
   
    try {
      setError('');
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editProfileData,
          isActive: userStatus === 'active'
        }),
      });

      const data = await res.json();
      console.log('Update response:', data);

      if (!res.ok) {
        setError(data.message || 'Failed to update profile.');
        return;
      }

      const updatedUser = data.user || editProfileData;
      setUserDetails(updatedUser);
      setUserStatus(updatedUser.isActive ? 'active' : 'deactivated');
      setIsEditing(false);
      
      // Show success message (optional)
      console.log('Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditProfileData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleStatusToggle = () => {
    const newStatus = userStatus === 'active' ? 'deactivated' : 'active';
    setUserStatus(newStatus);
    setEditProfileData((prev) => ({ 
      ...prev, 
      isActive: newStatus === 'active' 
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 text-lg">Loading user data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user data
  if (!userDetails || Object.keys(userDetails).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">User not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const requests = userDetails.requests || [];
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const filteredRequests = requests.filter((item) => {
    const matchesSearchQuery =
      item.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === '' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesReturnedStatusFilter =
      returnedStatusFilter === '' ||
      (returnedStatusFilter === 'returned' && item.isReturned) ||
      (returnedStatusFilter === 'not returned' && !item.isReturned);

    return matchesSearchQuery && matchesStatusFilter && matchesReturnedStatusFilter;
  });

  const hasRequests = filteredRequests.length > 0;
  const showEmptyState = !hasRequests;

  const paginatedRows = filteredRequests
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((item) => ({
      requestId: item.requestId,
      totalComponents: item.totalComponents,
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
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
        </div>
      ),
      isReturned: (
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-sm ${
            item.isReturned === true
              ? 'bg-green-100 text-green-700'
              : item.isReturned === false
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.isReturned === true && <CheckCircle size={16} />}
          {item.isReturned === false && <XCircle size={16} />}
          {item.isReturned === null && <Clock size={16} />}
          {item.isReturned === true
            ? 'Returned'
            : item.isReturned === false
            ? 'Not Returned'
            : 'Null'}
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
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>

          <div className="flex items-center">
            <Users className="text-blue-600 h-6 w-6 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: User Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 xl:col-span-1 relative">
          <button
            onClick={handleEditProfile}
            className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Edit size={16} />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-24 h-24 bg-blue-500 text-white text-3xl font-bold rounded-full mb-4">
              {userDetails.name
                ?.split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase() || 'U'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{userDetails.name || 'Loading...'}</h3>
            <p className="text-gray-500 text-sm">{userDetails.rollNo || ''}</p>
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userDetails.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{userDetails.phoneNo || 'N/A'}</p>
              </div>
            </div>

            {/* Status Section */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${userStatus === 'active' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <CheckCircle size={20} className={userStatus === 'active' ? 'text-green-600' : 'text-red-600'} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">Account Status</span>
                    <span className={`text-sm font-medium ${userStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {userStatus === 'active' ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
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
                  <span className="text-gray-700 font-medium">Role</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                  {userDetails.isFaculty ? 'Staff' : 'Student'}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <History size={20} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Total History</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {userDetails.totalHistoryCount || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-full">
                    <XCircle size={20} className="text-red-600" />
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

        {/* Right Section: User Requests Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 xl:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Requests</h2>

          <div className="flex sm:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-1/3">
              <DropdownFilter
                label="Status"
                options={['', 'Accepted', 'Pending', 'Rejected']}
                selectedValue={statusFilter}
                onSelect={(value) => setStatusFilter(value.toLowerCase())}
              />
            </div>

            {/* Returned Status Filter */}
            <div className="w-full sm:w-1/3">
              <DropdownFilter
                label="Returned Status"
                options={['', 'Returned', 'Not Returned']}
                selectedValue={returnedStatusFilter}
                onSelect={(value) => setReturnedStatusFilter(value.toLowerCase())}
              />
            </div>
          </div>

          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-50 p-4 rounded-full">
                <FileX className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter || returnedStatusFilter
                  ? "Try adjusting your filters or search term"
                  : "This user hasn't made any requests yet"}
              </p>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={paginatedRows}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCancelEdit}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <Edit size={18} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {['name', 'email', 'rollNo', 'phoneNo', 'totalHistoryCount', 'damageCount'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field === 'totalHistoryCount' ? 'Total History' : 
                     field === 'damageCount' ? 'Damage Count' : 
                     field === 'phoneNo' ? 'Phone Number' :
                     field === 'rollNo' ? 'Roll Number' : field}
                  </label>
                  <input
                    name={field}
                    type={['totalHistoryCount', 'damageCount'].includes(field) ? 'number' : 'text'}
                    placeholder={`Enter ${field}`}
                    value={editProfileData[field] ?? ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isFaculty"
                    checked={editProfileData.isFaculty || false}
                    onChange={handleInputChange}
                  />
                  Faculty
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={editProfileData.isAdmin || false}
                    onChange={handleInputChange}
                  />
                  Admin
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
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
export default function UserProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UserProfilePageView />
    </Suspense>
  );
}