"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePrivy, PrivyProvider } from "@privy-io/react-auth";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  user: {
    id: string;
    wallet?: {
      address: string;
    };
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const [isLoading, setIsLoading] = useState(true);

  const updateUserInDatabase = useCallback(async (user: any) => {
    if (user && user.wallet) {
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            fullName: user.name || "Unknown",
            privyWalletAddress: user.wallet.address,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user in database");
        }

        const data = await response.json();
        console.log("User updated in database:", data);
      } catch (error) {
        console.error("Error updating user in database:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (ready) {
        setIsLoading(false);
        if (authenticated && user) {
          console.log("User authenticated:", user);
          await updateUserInDatabase(user);
        }
      }
    };

    handleUserAuthentication();
  }, [ready, authenticated, user, updateUserInDatabase]);

  const authContextValue: AuthContextType = {
    isLoading,
    isLoggedIn: authenticated,
    login,
    logout,
    user: user
      ? {
          id: user.id,
          wallet: user.wallet ? { address: user.wallet.address } : undefined,
        }
      : null,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const PrivyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#4169E1",
        },
        fundingMethodConfig: {
          moonpay: {
            paymentMethod: "credit_debit_card", // Purchase with credit or debit card
            uiConfig: { accentColor: "#696FFD", theme: "light" },
            // useSandbox: true,
          },
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  );
};
