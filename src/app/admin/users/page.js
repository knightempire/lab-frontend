'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Edit2, Save, Users, Search, Eye } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FacultyorStudentStatus from '../../../components/ui/FacultyorStudentStatus';
import ActiveStatus from '../../../components/ui/ActiveStatus';
import FiltersPanel from '../../../components/FiltersPanel';
import LoadingScreen from "../../../components/loading/loadingscreen";
import { apiRequest } from '../../../utils/apiRequest';

const columns = [
  { key: 'nameAndRoll', label: 'Name / Roll No' },
  { key: 'emailAndPhone', label: 'Email / Phone' },
  { key: 'isFaculty', label: 'Role' },
  { key: 'isActive', label: 'Status' },
  { key: 'borrowedComponents', label: 'Borrowed' },
  { key: 'actions', label: 'Actions' }
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', rollNo: '', phoneNo: '', isFaculty: false, isActive: true });
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    isFaculty: '',
    isActive: '',
  });
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const verifyadmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
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
        if (!user.isAdmin || !user.isActive) {
          router.push('/auth/login');
        }
      }
    };
    verifyadmin();

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const res = await apiRequest(`/users/get`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        const usersWithBorrowed = data.users.map((user) => ({
          ...user,
          borrowedComponents: 0,
        }));
        setUsers(usersWithBorrowed);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
      setLoading(false); // Set loading to false after fetch
    };
    fetchUsers();

    setCurrentPage(1); // Reset to first page when filters/search change
  }, [searchQuery, filters]);

  const handleReset = () => {
    setFilters({
      isFaculty: '',
      isActive: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({ ...newUser, [name]: type === 'checkbox' ? checked : value });
  };

  const getFilteredResults = (users, filters) => {
    return users.filter((user) => {
      const matchesFacultyFilter = filters.isFaculty === '' || (filters.isFaculty === 'Faculty' ? user.isFaculty : !user.isFaculty);
      const matchesActiveFilter = filters.isActive === '' || (filters.isActive === 'Active' ? user.isActive : !user.isActive);
      return matchesFacultyFilter && matchesActiveFilter;
    });
  };

  const getSearchResults = (users, searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.rollNo.toLowerCase().includes(lowerQuery)
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredByDropdown = getFilteredResults(users, filters);
  const filteredUsers = getSearchResults(filteredByDropdown, searchQuery);

  const filterList = [
    { label: 'Role', key: 'isFaculty', options: ['', 'Faculty', 'Student'], value: filters.isFaculty },
    { label: 'Status', key: 'isActive', options: ['', 'Active', 'Inactive'], value: filters.isActive },
  ];

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, newUser]);
    resetForm();
  };

  const cancelForm = () => resetForm();

  const resetForm = () => {
    setShowForm(false);
    setEditIndex(null);
    setNewUser({ name: '', email: '', rollNo: '', phoneNo: '', isFaculty: false, isActive: true });
  };

  const rows = paginatedUsers.map((item, idx) => ({
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
    isFaculty: <FacultyorStudentStatus value={item.isFaculty} />,
    isActive: <ActiveStatus value={item.isActive} />,
    borrowedComponents: (
      <div className="text-center">
        <span className="font-semibold">{item.borrowedComponents}</span>
      </div>
    ),
    actions: (
      <div className="flex justify-center pt-2 border-t border-gray-100 mb-2">
        <Link
          href={`/admin/profile?rollNo=${item.rollNo}`}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <Eye size={14} />
          <span>View Profile</span>
        </Link>
      </div>
    )
  }));
  
  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-inner">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
    {showForm && <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />}

    <div className="p-4 md:p-3 mx-auto bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users size={28} className="text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
            User Management
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg mt-1">
              Total Users: {users.length}
            </span>
          </h1>
        </div>

        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div> */}
      </div>

      <div className="mb-4">
        <FiltersPanel
          filters={filterList}
          onChange={handleFilterChange}
          onReset={handleReset}
          Text="All users"
        />
      </div>

      <div className="mb-6 w-full relative bg-white">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

        {filteredUsers.length > 0 ? (
          <>
            <Table 
              columns={columns} 
              rows={rows} 
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}/>
            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow p-6 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No users found. Add a user to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              <span>Add User</span>
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={cancelForm}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fadeIn"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  {editIndex !== null ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editIndex !== null ? 'Edit User' : 'Add User'}
                </h2>
              </div>
              <button
                onClick={cancelForm}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {['name', 'email', 'rollNo', 'phoneNo','borrowedComponents'].map((field) => (
                <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field === 'borrowedComponents' ? 'Borrowed Components' : field}
                </label>
                <input
                  name={field}
                  type={field === 'borrowedComponents' ? 'number' : 'text'}
                  placeholder={`Enter ${field}`}
                  value={newUser[field] ?? ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              ))}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isFaculty"
                    checked={newUser.isFaculty}
                    onChange={handleChange}
                  />
                  Faculty
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={newUser.isActive}
                    onChange={handleChange}
                  />
                  Active
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={newUser.isAdmin}
                    onChange={handleChange}
                  />
                  <span>Is Admin</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={cancelForm}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Save size={16} />
                {editIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
