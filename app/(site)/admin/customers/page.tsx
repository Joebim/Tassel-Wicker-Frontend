'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LuSearch,
  LuFilter,
  LuRefreshCcw,
  LuUser,
  LuShield,
  LuShieldAlert,
  LuCheck,
  LuX,
  LuTrash2,
  LuPencil
} from 'react-icons/lu';
import { useToastStore } from '@/store/toastStore';
import { getUsers, deleteUser, updateUser, type GetUsersResponse, type UpdateUserRequest } from '@/services/backend/users';
import type { User, UserRole } from '@/types/user';
import { useAuthStore } from '@/store/authStore';

export default function AdminCustomersPage() {
  // State
  const [data, setData] = useState<GetUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Modals state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);

  // Fetch Data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setData(res);
    } catch (error) {
      console.error('Failed to load users:', error);
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users list.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page on new search
    loadUsers();
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value as UserRole | '');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingUserId) return;

    try {
      if (deletingUserId === currentUser?.id) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Action Denied',
          message: 'You cannot delete your own account.',
        });
        return;
      }

      await deleteUser(deletingUserId);
      useToastStore.getState().addToast({
        type: 'success',
        title: 'User Deleted',
        message: 'The user has been permanently deleted.',
      });
      setDeletingUserId(null);
      loadUsers();
    } catch (error) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Could not delete user.',
      });
    }
  };

  const handleUpdate = async (formData: UpdateUserRequest) => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, formData);
      useToastStore.getState().addToast({
        type: 'success',
        title: 'User Updated',
        message: 'User profile has been updated.',
      });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Could not update user.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">
            Customers
          </h2>
          <p className="mt-2 text-luxury-cool-grey font-extralight">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
        >
          <LuRefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="md:col-span-8 flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-luxury-warm-grey/20 bg-white focus:outline-none focus:border-brand-purple/50 font-extralight text-luxury-black"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cool-grey" size={18} />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors"
          >
            Search
          </button>
        </form>

        {/* Role Filter */}
        <div className="md:col-span-4 relative">
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-full pl-10 pr-4 py-3 border border-luxury-warm-grey/20 bg-white appearance-none focus:outline-none focus:border-brand-purple/50 font-extralight text-luxury-black cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cool-grey" size={18} />
        </div>
      </div>

      {/* Table */}
      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-luxury-warm-grey/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">User</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Role</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Joined</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-warm-grey/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-luxury-cool-grey font-extralight">
                    Loading users...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-luxury-cool-grey font-extralight">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.items.map((user) => (
                  <tr key={user.id} className="hover:bg-luxury-warm-grey/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-light uppercase">
                          {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-luxury-black">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-luxury-cool-grey font-extralight">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 border border-green-200 bg-green-50 px-2 py-1 rounded">
                          <LuCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 border border-yellow-200 bg-yellow-50 px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-luxury-cool-grey font-extralight">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-luxury-cool-grey hover:text-brand-purple hover:bg-brand-purple/10 rounded-full transition-colors"
                          title="Edit User"
                        >
                          <LuPencil size={18} />
                        </button>
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => setDeletingUserId(user.id)}
                            className="p-2 text-luxury-cool-grey hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <LuTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-luxury-warm-grey/20 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Page {data.page} of {data.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-black uppercase text-xs font-extralight hover:border-brand-purple hover:text-brand-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-black uppercase text-xs font-extralight hover:border-brand-purple hover:text-brand-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-xl animate-scale-in">
            <h3 className="text-xl font-extralight text-luxury-black uppercase mb-4 flex items-center gap-2">
              <LuShieldAlert className="text-red-500" /> Confirm Deletion
            </h3>
            <p className="text-luxury-cool-grey font-extralight mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-black font-extralight uppercase hover:bg-luxury-warm-grey/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white font-extralight uppercase hover:bg-red-600 transition-colors"
                autoFocus
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Role Badge Component
function RoleBadge({ role }: { role: UserRole }) {
  const styles = {
    admin: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
    moderator: 'bg-blue-50 text-blue-600 border-blue-200',
    customer: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const icons = {
    admin: <LuShield size={12} />,
    moderator: <LuUser size={12} />, // Using user icon for mod distinct from shield
    customer: <LuUser size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${styles[role] || styles.customer}`}>
      {icons[role] || icons.customer}
      {role}
    </span>
  );
}

// Edit User Modal
function EditUserModal({
  user,
  onClose,
  onSave
}: {
  user: User;
  onClose: () => void;
  onSave: (data: UpdateUserRequest) => Promise<void>;
}) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-luxury-warm-grey/10 flex items-center justify-between bg-luxury-warm-grey/5">
            <h3 className="text-lg font-extralight text-luxury-black uppercase tracking-wide">Edit User</h3>
            <button type="button" onClick={onClose} className="text-luxury-cool-grey hover:text-luxury-black">
              <LuX size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-luxury-cool-grey mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-luxury-cool-grey mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-luxury-cool-grey mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight bg-white"
              >
                <option value="customer">Customer</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-luxury-cool-grey font-extralight">
                Admins have full access. Moderators can manage products/orders but not users.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="emailVerified"
                checked={formData.isEmailVerified}
                onChange={e => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                className="w-4 h-4 text-brand-purple border-luxury-warm-grey/20 rounded focus:ring-brand-purple"
              />
              <label htmlFor="emailVerified" className="text-sm font-extralight text-luxury-black select-none cursor-pointer">
                Email Verified
              </label>
            </div>
          </div>

          <div className="px-6 py-4 bg-luxury-warm-grey/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-black font-extralight uppercase hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-purple text-luxury-white font-extralight uppercase hover:bg-brand-purple-light transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
