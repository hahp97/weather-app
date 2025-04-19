"use client";

import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/UserContext";
import {
  CloudRain,
  LockIcon,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReturnUrl, setAuthReturnUrl] = useState("");
  const [authFeatureName, setAuthFeatureName] = useState("");

  const navItems = [
    { href: "/generate", label: "Generate Report", requiresAuth: false },
    { href: "/history", label: "History", requiresAuth: true },
    { href: "/comparison", label: "Comparison", requiresAuth: true },
  ];

  const handleProtectedNavClick = (
    e: React.MouseEvent,
    item: { href: string; label: string }
  ) => {
    if (!user) {
      e.preventDefault();
      setAuthReturnUrl(item.href);
      setAuthFeatureName(item.label);
      setShowAuthModal(true);
    }
  };

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl={authReturnUrl}
        featureName={authFeatureName}
      />

      <nav className="shadow border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <CloudRain className="h-6 w-6" />
                <span>Weather Report System</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="hidden sm:ml-6 sm:flex">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isAuthRequired = item.requiresAuth && !user;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) =>
                        isAuthRequired && handleProtectedNavClick(e, item)
                      }
                      className={`inline-flex items-center px-3 py-2 mx-1 text-sm font-medium rounded-md transition-all ${
                        isActive
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      } ${isAuthRequired ? "opacity-70" : ""}`}
                    >
                      {item.label}
                      {isAuthRequired && (
                        <LockIcon size={14} className="ml-1 text-gray-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="ml-6 flex items-center">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                          <UserCircle className="h-4 w-4 mr-1.5 text-gray-500" />
                          <span>{user.name}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3">
                        <div className="space-y-3">
                          <div className="border-b pb-3">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Link
                              href="/profile"
                              className="flex items-center p-2 rounded-md hover:bg-gray-100 text-sm transition-colors"
                            >
                              <UserCircle className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center p-2 rounded-md hover:bg-gray-100 text-sm transition-colors"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Link>
                            <button
                              onClick={logout}
                              className="flex w-full items-center p-2 rounded-md hover:bg-gray-100 text-sm text-red-500 transition-colors"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <Button size="sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
