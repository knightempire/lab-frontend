'use client';

import { useState } from 'react';
import { Plus, X, Edit2, Trash2, Save, Users, Search } from 'lucide-react';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import FacultyorStudentStatus from '../../../components/ui/FacultyorStudentStatus';
import ActiveStatus from '../../../components/ui/ActiveStatus';
import DropdownFilter from '../../../components/DropdownFilter';

const initialUsers = [
  { name: "John Doe", email: "johndoe@example.com", rollNo: "12345", phoneNo: "9876543210", isFaculty: false, isAdmin: false, isActive: true, borrowedComponents: 4 },
  { name: "Jane Smith", email: "janesmith@example.com", rollNo: "23456", phoneNo: "8765432109", isFaculty: true, isAdmin: false, isActive: true, borrowedComponents: 7 },
  { name: "Alice Johnson", email: "alicej@example.com", rollNo: "34567", phoneNo: "7654321098", isFaculty: false, isAdmin: false, isActive: false, borrowedComponents: 0 },
  { name: "Bob Brown", email: "bobbrown@example.com", rollNo: "45678", phoneNo: "6543210987", isFaculty: true, isAdmin: false, isActive: true, borrowedComponents: 2 },
  { name: "Charlie Davis", email: "charlied@example.com", rollNo: "56789", phoneNo: "5432109876", isFaculty: false, isAdmin: true, isActive: true, borrowedComponents: 6 },
  { name: "Eva Green", email: "evagreen@example.com", rollNo: "67890", phoneNo: "4321098765", isFaculty: true, isAdmin: false, isActive: false, borrowedComponents: 0 },
  { name: "Frank Harris", email: "frankh@example.com", rollNo: "78901", phoneNo: "3210987654", isFaculty: false, isAdmin: false, isActive: true, borrowedComponents: 1 },
  { name: "Grace Lee", email: "gracelee@example.com", rollNo: "89012", phoneNo: "2109876543", isFaculty: true, isAdmin: true, isActive: true, borrowedComponents: 5 },
  { name: "Henry Adams", email: "henrya@example.com", rollNo: "90123", phoneNo: "1098765432", isFaculty: false, isAdmin: false, isActive: false, borrowedComponents: 0 },
  { name: "Ivy Clark", email: "ivyc@example.com", rollNo: "11223", phoneNo: "1987654321", isFaculty: false, isAdmin: false, isActive: true, borrowedComponents: 3 },
  { name: "Jack White", email: "jackw@example.com", rollNo: "22334", phoneNo: "8765432190", isFaculty: true, isAdmin: true, isActive: true, borrowedComponents: 8 },
  { name: "Kara Black", email: "karab@example.com", rollNo: "33445", phoneNo: "7654321980", isFaculty: false, isAdmin: false, isActive: true, borrowedComponents: 2 },
  { name: "Leo King", email: "leok@example.com", rollNo: "44556", phoneNo: "6543219870", isFaculty: false, isAdmin: true, isActive: false, borrowedComponents: 0 },
  { name: "Mia Scott", email: "mias@example.com", rollNo: "55667", phoneNo: "5432198760", isFaculty: true, isAdmin: false, isActive: true, borrowedComponents: 6 },
  { name: "Nathan Young", email: "nathany@example.com", rollNo: "66778", phoneNo: "4321987650", isFaculty: true, isAdmin: false, isActive: false, borrowedComponents: 0 }
];

const columns = [
  { key: 'nameAndRoll', label: 'Name / Roll No' },
  { key: 'emailAndPhone', label: 'Email / Phone' },
  { key: 'isFaculty', label: 'Role' },
  { key: 'isActive', label: 'Status' },
  { key: 'borrowedComponents', label: 'Borrowed' },
  { key: 'actions', label: 'Actions' }
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', rollNo: '', phoneNo: '', isFaculty: false, isActive: true });
  const [editIndex, setEditIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    isFaculty: '',
    isActive: '',
  });
  const itemsPerPage = 10;

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
    return users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredByDropdown = getFilteredResults(users, filters);
  const filteredUsers = getSearchResults(filteredByDropdown, searchQuery);

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

  const updateUser = (index) => {
    const updated = [...users];
    updated[index] = newUser;
    setUsers(updated);
    resetForm();
  };

  const startEdit = (user, index) => {
    setEditIndex(index);
    setNewUser(user);
    setShowForm(true);
  };

  const deleteUser = (index) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
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
      <div className="flex flex-col items-center text-center">
        <span className="font-medium">{item.name}</span>
        <span className="text-gray-500 text-sm">{item.rollNo}</span>
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
      <div className="flex justify-center gap-x-4 pt-2 border-t border-gray-100">
        <button onClick={() => startEdit(item, idx)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
        <button onClick={() => deleteUser((currentPage - 1) * itemsPerPage + idx)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm">
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    )
  }));
  
  return (
    <div className="relative">
      {showForm && <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 pointer-events-none" />}

      <div className="p-4 md:p-3 max-w-7xl mx-auto bg-gray-50 relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users size={28} className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-10">
            <DropdownFilter
              label="Role"
              options={['', 'Faculty', 'Student']}
              selectedValue={filters.isFaculty}
              onSelect={(value) => handleFilterChange('isFaculty', value)}
            />
            <DropdownFilter
              label="Active"
              options={['', 'Active', 'Inactive']}
              selectedValue={filters.isActive}
              onSelect={(value) => handleFilterChange('isActive', value)}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="border border-gray-300 rounded-lg pl-30 pr-5 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
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
                onClick={editIndex !== null ? () => updateUser(editIndex) : addUser}
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
