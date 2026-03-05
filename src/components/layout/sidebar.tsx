'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  FileText,
  MessageSquareQuote,
  Navigation,
  Phone,
  Mail,
  Users,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'editeur'] },
  { label: 'Biens Immobiliers', href: '/biens', icon: Building2, roles: ['super_admin', 'admin', 'editeur'] },
  { label: 'Formations', href: '/formations', icon: GraduationCap, roles: ['super_admin', 'admin'] },
  { label: 'Blog', href: '/blog', icon: FileText, roles: ['super_admin', 'admin'] },
  { label: 'Témoignages', href: '/temoignages', icon: MessageSquareQuote, roles: ['super_admin', 'admin'] },
  { label: 'Navigation', href: '/navigation', icon: Navigation, roles: ['super_admin', 'admin'] },
  { label: 'Contact', href: '/contact', icon: Phone, roles: ['super_admin', 'admin'] },
  { label: 'Messages', href: '/messages', icon: Mail, roles: ['super_admin', 'admin'] },
  { label: 'Utilisateurs', href: '/utilisateurs', icon: Users, roles: ['super_admin'] },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar-bg text-sidebar-text transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link href="/" className="text-lg font-bold text-white">
            Idayath Admin
          </Link>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-active/10 text-sidebar-active'
                        : 'text-sidebar-text/70 hover:bg-white/5 hover:text-sidebar-text'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-4">
          {user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-sidebar-text/50">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text/70 transition-colors hover:bg-white/5 hover:text-sidebar-text"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
