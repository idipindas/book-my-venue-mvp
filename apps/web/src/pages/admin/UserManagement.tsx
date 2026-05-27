import { useState } from 'react';
import { Search, ShieldOff, Trash2, Users, ShieldCheck, Crown, UserCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { type User, Role } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';

const roleConfig: Record<Role, { label: string; icon: React.ReactNode; badge: string }> = {
  [Role.ADMIN]: {
    label: 'Admin',
    icon: <Crown size={12} />,
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  [Role.OWNER]: {
    label: 'Owner',
    icon: <ShieldCheck size={12} />,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [Role.USER]: {
    label: 'User',
    icon: <UserCircle size={12} />,
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const avatarColors: Record<Role, string> = {
  [Role.ADMIN]: 'bg-violet-600',
  [Role.OWNER]: 'bg-primary',
  [Role.USER]: 'bg-slate-500',
};

export default function UserManagement() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => { const { data } = await api.get('/admin/users'); return data.data; },
  });
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { mutate: suspend, isPending: suspending } = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User suspended'); },
    onError: () => toast.error('Failed to suspend user'),
  });

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User removed'); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete user'),
  });

  const filtered = users?.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  }) ?? [];

  const counts = {
    all: users?.length ?? 0,
    [Role.USER]: users?.filter((u) => u.role === Role.USER).length ?? 0,
    [Role.OWNER]: users?.filter((u) => u.role === Role.OWNER).length ?? 0,
    [Role.ADMIN]: users?.filter((u) => u.role === Role.ADMIN).length ?? 0,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">User Management</h1>
        <p className="text-sm text-muted mt-0.5">{users?.length ?? 0} registered accounts</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: Role.USER, label: 'Members', color: 'bg-slate-50 border-slate-200' },
          { role: Role.OWNER, label: 'Venue Owners', color: 'bg-blue-50 border-blue-200' },
          { role: Role.ADMIN, label: 'Admins', color: 'bg-violet-50 border-violet-200' },
        ].map((item) => {
          const rc = roleConfig[item.role];
          return (
            <button
              key={item.role}
              onClick={() => setFilterRole(filterRole === item.role ? 'all' : item.role)}
              className={cn(
                'rounded-2xl border p-4 text-left transition-all',
                item.color,
                filterRole === item.role ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
              )}
            >
              <p className="text-2xl font-bold text-navy">{counts[item.role]}</p>
              <p className="text-sm text-muted mt-0.5">{item.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        {filterRole !== 'all' && (
          <Button variant="outline" size="sm" onClick={() => setFilterRole('all')} className="shrink-0">
            Clear filter
          </Button>
        )}
      </div>

      {/* User table */}
      {isLoading ? (
        <div className="py-14 flex justify-center"><PageSpinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-14 text-center">
          <Users size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-navy">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">User</span>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Role</span>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide text-right">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const rc = roleConfig[u.role];
              const ac = avatarColors[u.role];
              return (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${ac} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-navy text-sm truncate">{u.name}</p>
                        {u.isSuspended && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Role badge */}
                  <span className={cn('hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0', rc.badge)}>
                    {rc.icon} {rc.label}
                  </span>

                  {/* Status */}
                  <span className={cn('hidden sm:block text-xs font-semibold px-2.5 py-1 rounded-full shrink-0',
                    u.isSuspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  )}>
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>

                  {/* Actions */}
                  {u.role !== Role.ADMIN && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!u.isSuspended && (
                        <button
                          onClick={() => suspend(u.id)}
                          disabled={suspending}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Suspend user"
                        >
                          <ShieldOff size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove User" size="sm">
        <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4 mb-5">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">{deleteTarget?.name}</p>
            <p className="text-xs text-red-600">{deleteTarget?.email}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">This will permanently remove this account and all associated data. This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={() => deleteUser(deleteTarget!.id)}>
            Remove User
          </Button>
        </div>
      </Modal>
    </div>
  );
}
