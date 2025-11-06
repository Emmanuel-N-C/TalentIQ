import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/admin';
import UserTable from '../../components/admin/UserTable';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(currentPage, pageSize, 'createdAt', 'desc');
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
      // Reload users to reflect changes
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      // Reload users to reflect changes
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all platform users ({totalElements} total)
        </p>
      </div>

      <UserTable
        users={users}
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