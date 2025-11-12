import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/admin';
import UserTable from '../../components/admin/UserTable';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const role = roleFilter !== 'all' ? roleFilter.toUpperCase().replace('SEEKER', '_SEEKER') : null;
      const response = await getAllUsers(currentPage, pageSize, 'createdAt', 'desc', role);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(0);
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Manage all platform users ({totalElements} total)
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Roles</option>
              <option value="jobseeker">Job Seekers</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      <UserTable
        users={searchTerm ? filteredUsers : users}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onRoleUpdate={handleRoleUpdate}
        onDeleteUser={handleDeleteUser}
        loading={loading}
      />
    </div>
  );
}