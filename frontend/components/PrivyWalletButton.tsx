'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

export function PrivyWalletButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">
          {user?.email?.address || formatAddress(user?.wallet?.address || '0x...')}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
