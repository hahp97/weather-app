"use client";

import { GetMeGql } from "@/libs/apollo/queries";
import { ApolloError, useQuery } from "@apollo/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface PhoneNumber {
  code: string;
  country: string;
  number: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  isEmailVerified?: boolean;
  lastSignedInAt?: string;
  mobile?: PhoneNumber;
  active?: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: ApolloError | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { loading, error, data } = useQuery(GetMeGql, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);

  const logout = () => {
    // Clear tokens from cookies or localStorage
    document.cookie = "x-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "x-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error: error || null,
        setUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
