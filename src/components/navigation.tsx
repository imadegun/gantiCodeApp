'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  Tag,
  ClipboardList,
  Warehouse,
  Home
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Collections',
    href: '/',
    icon: Home,
    description: 'Product catalog and details'
  },
  {
    name: 'Product Codes',
    href: '/product-code',
    icon: Tag,
    description: 'Manage ClientCode assignments'
  },
  {
    name: 'Production',
    href: '/production',
    icon: ClipboardList,
    description: 'PO management and production details'
  },
  {
    name: 'Stock',
    href: '/stock',
    icon: Warehouse,
    description: 'Stock management and tracking'
  }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Ceramic App</h1>
              <p className="text-xs text-muted-foreground">Production Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User/Status indicator */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="hidden sm:inline">System Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}