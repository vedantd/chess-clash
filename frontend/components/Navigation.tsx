"use client";

import Link from "next/link";
import { PrivyWalletButton } from "./PrivyWalletButton";

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Chess Clash
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Home
              </Link>
              <Link
                href="/challenges"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Challenges
              </Link>
              <Link
                href="/my-challenges"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Challenges
              </Link>
              <Link
                href="/players"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Players
              </Link>
              <Link
                href="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin
              </Link>
            </div>
          </div>
          <PrivyWalletButton />
        </div>
      </div>
    </nav>
  );
}
