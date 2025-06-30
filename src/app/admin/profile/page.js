'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Edit, CheckCircle, Repeat, XCircle, Clock, Save, X, GraduationCap, History, ArrowLeft, FileX, AlertTriangle, Undo } from 'lucide-react';
import DropdownFilter from '../../../components/DropdownFilter';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingScreen from '../../../components/loading/loadingscreen';
import { apiRequest } from '../../../utils/apiRequest';
import Link from 'next/link';

const columns = [
  { key: 'requestId', label: 'Request ID' },
  { key: 'totalComponents', label: 'Total Components' },
  { key: 'status', label: 'Status' },
  { key: 'viewMore', label: 'View More' }
];

const UserProfilePageView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get rollNo from URL parameters
  
  
  const [userDetails, setUserDetails] = useState({});
  const [userStats, setUserStats] = useState({});
  const [userStatus, setUserStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 1. Add new state for user requests
  const [userRequests, setUserRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const itemsPerPage = 7;

  const [validationErrors, setValidationErrors] = useState({});

  console.log('UserProfilePage rendered');

  // 3. Helper function to map request status
  const mapRequestStatus = (apiStatus) => {
    switch(apiStatus?.toLowerCase()) {
      case 'approved':
        return 'accepted';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      case 'returned':
        return 'accepted'; // Returned requests were previously accepted
      case 'closed':
        return 'closed';
      case 'reissued':
        return 'reissued';
      default:
        return apiStatus?.toLowerCase() || 'pending';
    }
  };


  // 2. Create function to fetch user requests
  const fetchUserRequests = async (rollNo) => {
    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let endpoint = `/request/user-get/${encodeURIComponent(rollNo)}`;
    
    try {
      setRequestsLoading(true);
      setRequestsError('');
      
      const res = await apiRequest(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User requests response status:', res.status);
      const data = await res.json();
      console.log('User requests data:', data);

      if (!res.ok) {
        setRequestsError(data.message || `Failed to fetch user requests. Status: ${res.status}`);
        return;
      }

      // Transform the API data to match your table structure
      const transformedRequests = data.requests?.map(request => ({
        requestId: request.requestId,
        totalComponents: request.requestedProducts?.length || 0,
        status: mapRequestStatus(request.requestStatus),
        originalData: request // Keep original data for detailed view
      })) || [];

      setUserRequests(transformedRequests);
      
    } catch (err) {
      console.error('Error fetching user requests:', err);
      setRequestsError('Network error. Please check your connection and try again.');
    } finally {
      setRequestsLoading(false);
    }
  };

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
        const res = await apiRequest(`/verify-token`, {
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

  // 5. Modify the fetchUserData function to also fetch requests
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let endpoint = `/users/get/${rollNo}`;
    console.log('Fetching user data from endpoint:', endpoint);

    try {
      setLoading(true);
      setError('');
      
      const res = await apiRequest(endpoint, {
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
          const allUsersRes = await apiRequest(`/users/get`, {
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
              // Note: stats won't be available from the all users endpoint, so set defaults
              setUserStats({ 
                requestsCount: data.requestsCount || 0, 
                damagedItemsCount: data.damagedItemsCount || 0 
              });
              setUserStatus(user.isActive ? 'active' : 'deactivated');
              setEditProfileData({ ...user });
              
              // Fetch user requests after successfully getting user data
              await fetchUserRequests(rollNo);
              
              setLoading(false);
              return;
            }
          }
        }
        
        setError(data.message || `Failed to fetch user data. Status: ${res.status}`);
        return;
      }

      const userData = data.user || data;
      const statsData = {
        requestsCount: data.requestsCount || 0,
        damagedItemsCount: data.damagedItemsCount || 0
      };
      console.log('User data:', userData);
      console.log('Stats data:', statsData);

      setUserDetails(userData);
      setUserStats(statsData);
      setUserStatus(userData.isActive ? 'active' : 'deactivated');
      setEditProfileData({ ...userData });

      // Fetch user requests after successfully getting user data
      await fetchUserRequests(rollNo);
      
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
    setValidationErrors({}); // Clear validation errors when canceling
  };

  const handleSaveProfile = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const rollNo = searchParams.get('rollNo');
    
    let endpoint = `/users/update/${rollNo}`;
    
    try {
      setError('');
      
      const updateData = {
        userName: editProfileData.name.trim(),
        userIsAdmin: editProfileData.isAdmin || false,
        userEmail: editProfileData.email.trim(),
        userRollNo: editProfileData.rollNo.trim(),
        userPhoneNo: editProfileData.phoneNo.trim(),
        userIsFaculty: editProfileData.isFaculty || false,
        userIsActive: userDetails.isActive
      };

      console.log('Sending update data:', updateData);

      const res = await apiRequest(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      console.log('Update response:', data);

      if (!res.ok) {
        setError(data.message || 'Failed to update profile.');
        return;
      }

      const updatedUserData = data.user || data;
      const updatedUser = {
        ...userDetails,
        name: updatedUserData.name || updateData.userName,
        isAdmin: updatedUserData.isAdmin !== undefined ? updatedUserData.isAdmin : updateData.userIsAdmin,
        email: updatedUserData.email || updateData.userEmail,
        rollNo: updatedUserData.rollNo || updateData.userRollNo,
        phoneNo: updatedUserData.phoneNo || updateData.userPhoneNo,
        isFaculty: updatedUserData.isFaculty !== undefined ? updatedUserData.isFaculty : updateData.userIsFaculty,
        isActive: updatedUserData.isActive !== undefined ? updatedUserData.isActive : updateData.userIsActive,
      };

      setUserDetails(updatedUser);
      setUserStatus(updatedUser.isActive ? 'active' : 'deactivated');
      setIsEditing(false);
      setValidationErrors({}); // Clear validation errors on successful save
      
      console.log('Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for phone number - restrict to 10 digits only
    if (name === 'phoneNo') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Special handling for name - remove numbers and special characters as user types
    if (name === 'name') {
      newValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setEditProfileData((prev) => ({ 
      ...prev, 
      [name]: newValue
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStatusToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const newStatus = userStatus === 'active' ? 'deactivated' : 'active';
    const newIsActive = newStatus === 'active';

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const rollNo = searchParams.get('rollNo');
    let endpoint = `/users/update/${rollNo}`;

    try {
      setError('');
      
      // Prepare the data for status update
      const updateData = {
        userName: userDetails.name,
        userIsAdmin: userDetails.isAdmin || false,
        userEmail: userDetails.email,
        userRollNo: userDetails.rollNo,
        userPhoneNo: userDetails.phoneNo,
        userIsFaculty: userDetails.isFaculty || false,
        userIsActive: newIsActive
      };

      console.log('Updating status to:', newIsActive);

      const res = await apiRequest(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      console.log('Status update response:', data);

      if (!res.ok) {
        setError(data.message || 'Failed to update status.');
        return;
      }

      // Update local state
      const updatedUserData = data.user || data; // Handle nested user object
      setUserStatus(newStatus);
      setUserDetails(prev => ({ 
        ...prev, 
        isActive: updatedUserData.isActive !== undefined ? updatedUserData.isActive : newIsActive 
      }));
      setEditProfileData(prev => ({ 
        ...prev, 
        isActive: updatedUserData.isActive !== undefined ? updatedUserData.isActive : newIsActive 
      }));
      console.log('Status updated successfully');
      
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Network error. Please try again.');
    }
  };

  // 9. Update the loading state to consider both user data and requests loading
  if (loading || requestsLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <LoadingScreen />
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

  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Name is required';
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Name should only contain letters and spaces';
    }
    if (name.trim().length < 2) {
      return 'Name should be at least 2 characters long';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@cb.students.amrita.edu') && !trimmedEmail.endsWith('@cb.amrita.edu')) {
      return 'Email must be from @cb.students.amrita.edu or @cb.amrita.edu domain';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const validateRollNo = (rollNo) => {
    if (!rollNo || rollNo.trim() === '') {
      return 'Roll number is required';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    errors.name = validateName(editProfileData.name);
    errors.email = validateEmail(editProfileData.email);
    errors.phoneNo = validatePhoneNumber(editProfileData.phoneNo);
    errors.rollNo = validateRollNo(editProfileData.rollNo);
    
    // Remove empty error messages
    Object.keys(errors).forEach(key => {
      if (!errors[key]) {
        delete errors[key];
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  // 6. Update the requests variable to use the new state
  const requests = userRequests || [];
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // 7. Update the filteredRequests logic to use the transformed data
  const filteredRequests = requests.filter((item) => {
    const matchesSearchQuery =
      item.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatusFilter =
      statusFilter === '' || item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearchQuery && matchesStatusFilter;
  });

  const hasRequests = filteredRequests.length > 0;
  const showEmptyState = !hasRequests;

  // 8. Update the paginatedRows mapping to handle the new data structure
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
              : item.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : item.status === 'returned'
              ? 'bg-blue-100 text-blue-700'
              : item.status === 'closed'
              ? 'bg-amber-100 text-amber-700'
              : item.status === 'reissued'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.status === 'accepted' && <CheckCircle size={16} />}
          {item.status === 'pending' && <Clock size={16} />}
          {item.status === 'rejected' && <XCircle size={16} />}
          {item.status === 'returned' && <Undo size={16} />}
          {item.status === 'closed' && <AlertTriangle size={16} />}
          {item.status === 'reissued' && <Repeat size={16} />}
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
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

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 md:p-3 mx-auto bg-gray-50">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 10. Update error handling to show requests errors */}
      {requestsError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600">Requests Error: {requestsError}</p>
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
<div className="relative bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-0 overflow-hidden flex flex-col items-center group transition-all duration-300 hover:shadow-blue-200">
  {/* Decorative Cover */}
  <div className="w-full h-36 md:h-48 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 relative">
    <img
      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
      alt="cover"
      className="object-cover w-full h-full opacity-60 blur-[1.5px]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-indigo-500/30" />
    {/* <svg className="absolute bottom-0 left-0 w-full" height="56" viewBox="0 0 500 56" fill="none">
      <path d="M0 0C150 56 350 0 500 56V56H0V0Z" fill="#fff" fillOpacity="0.8"/>
    </svg> */}
    <button
      onClick={handleEditProfile}
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
  {/* <span className={`mt-2 mb-4 px-4 py-1 rounded-full text-xs font-semibold shadow-sm uppercase tracking-wide
    ${userDetails.isFaculty ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
    {userDetails.isFaculty ? 'Staff' : 'Student'}
  </span> */}
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
          <CheckCircle size={20} className={userStatus === 'active' ? 'text-green-600' : 'text-red-600'} />
          <div>
            <span className="block text-xs text-gray-500">Account Status</span>
            <span className={`font-semibold text-sm ${userStatus === 'active' ? 'text-green-700' : 'text-red-700'}`}>
              {userStatus === 'active' ? 'Active' : 'Deactivated'}
            </span>
          </div>
          <button
            onClick={handleStatusToggle}
            className="ml-auto relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ backgroundColor: userStatus === 'active' ? '#10B981' : '#6B7280' }}
            title="Toggle Status"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                userStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
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
              {userStats.requestsCount || 0}
            </span>
          </div>
        </div>
        {/* Damage Count */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-100 to-red-50 rounded-xl px-4 py-3 shadow group-hover:scale-105 transition-transform">
          <XCircle size={20} className="text-red-600" />
          <div>
            <span className="block text-xs text-gray-500">Damage Count</span>
            <span className="font-semibold text-sm text-red-700">
              {userStats.damagedItemsCount ?? 0}
            </span>
          </div>
        </div>
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
                options={['', 'Accepted', 'Pending', 'Rejected', 'Returned', 'Closed', 'Reissued']}
                selectedValue={statusFilter}
                onSelect={(value) => setStatusFilter(value.toLowerCase())}
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
                {searchQuery || statusFilter
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
  {/* Name Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Name <span className="text-red-500">*</span>
    </label>
    <input
      name="name"
      type="text"
      placeholder="Enter name"
      value={editProfileData.name ?? ''}
      onChange={handleInputChange}
      className={`w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    />
    {validationErrors.name && (
      <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
    )}
  </div>

  {/* Email Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email <span className="text-red-500">*</span>
    </label>
    <input
      name="email"
      type="email"
      placeholder="Enter email (@cb.students.amrita.edu or @cb.amrita.edu)"
      value={editProfileData.email ?? ''}
      onChange={handleInputChange}
      className={`w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    />
    {validationErrors.email && (
      <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
    )}
  </div>

  {/* Roll Number Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Roll Number <span className="text-red-500">*</span>
    </label>
    <input
      name="rollNo"
      type="text"
      placeholder="Enter roll number"
      value={editProfileData.rollNo ?? ''}
      onChange={handleInputChange}
      className={`w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        validationErrors.rollNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    />
    {validationErrors.rollNo && (
      <p className="mt-1 text-xs text-red-600">{validationErrors.rollNo}</p>
    )}
  </div>

  {/* Phone Number Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Phone Number <span className="text-red-500">*</span>
    </label>
    <input
      name="phoneNo"
      type="tel"
      placeholder="Enter 10-digit phone number"
      value={editProfileData.phoneNo ?? ''}
      onChange={handleInputChange}
      maxLength="10"
      className={`w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        validationErrors.phoneNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    />
    {validationErrors.phoneNo && (
      <p className="mt-1 text-xs text-red-600">{validationErrors.phoneNo}</p>
    )}
  </div>
  
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