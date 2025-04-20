"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Generate", href: "/generate" },
  { name: "History", href: "/history" },
  { name: "Comparison", href: "/comparison" },
];

export const NavBar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useUser();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <Disclosure
      as="nav"
      className="bg-white shadow-sm border-b border-gray-200"
    >
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1.5 mr-2 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                      Weather Report
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActiveLink(item.href)
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
                ) : user ? (
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="flex text-sm bg-blue-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1 font-medium">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.username || user.email}
                          </p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left block px-4 py-2 text-sm text-gray-700`}
                            >
                              Log out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 pl-3 pr-4 text-base font-medium ${
                    isActiveLink(item.href)
                      ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                      : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={logout}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex flex-col space-y-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
