"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePrivy, PrivyProvider } from "@privy-io/react-auth"

type AuthContextType = {
  isLoading: boolean
  isLoggedIn: boolean
  login: () => void
  logout: () => void
  user: {
    id: string
    wallet?: {
      address: string
    }
  } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user, login, logout } = usePrivy()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (ready) {
      setIsLoading(false)
    }
  }, [ready])

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
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

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
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  )
}

