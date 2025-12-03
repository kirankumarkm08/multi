
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import DarkmodeBtn from '@/components/admin/DarkmodeBtn';
import ProfileDropdown from '@/components/admin/Profile';
import WalletConnect from '@/components/web3/WalletConnect';
import { useWeb3 } from '@/context/Web3Context';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { isWeb3Enabled } = useWeb3();
  return (
    <div className="flex items-center justify-between px-6 py-4">
      {/* Left side - Mobile menu button + Title */}
      <div className="flex items-center space-x-4">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Page title or breadcrumb can go here */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Right side - Profile dropdown */}
      <div className="flex items-center space-x-4">
        {/* Additional header items can go here (notifications, search, etc.) */}
        
        {/* Web3 Wallet Connect */}
        {/* {isWeb3Enabled && <WalletConnect />} */}
        
        {/* Profile Dropdown - Perfectly aligned to top right */}
        <DarkmodeBtn />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Header;