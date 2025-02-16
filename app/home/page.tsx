"use client";

import {
  Search,
  QrCode,
  Home,
  CreditCard,
  DollarSign,
  Bitcoin,
  User,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { redirect, useRouter } from "next/navigation";

export default function HomePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Status Bar - For demo purposes */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-20">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 pr-10 py-6 bg-white rounded-full"
            placeholder="People, Business, & Charities"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <QrCode className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-1">
            Welcome to Venmo x Privy!
          </h1>
          <p className="text-gray-500">What would you like to do first?</p>
        </div>

        {/* Payment Card */}
        <Card className="mb-4 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-24 bg-[#4169E1] rounded-b-[100px]" />
            <div className="relative pt-16 pb-6 px-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Image
                  src="/payment-method.png"
                  alt="Payment Icon"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Make your first payment
              </h2>
              <p className="text-gray-500 mb-4">
                Pay someone, request money or send a gift
              </p>
              <Button
                variant="outline"
                className="rounded-full border-[#4169E1] text-[#4169E1] hover:bg-[#4169E1]/10"
              >
                Get started
              </Button>
            </div>
          </div>
        </Card>

        {/* Promo Code Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold">Enter your promo code</h3>
              <p className="text-sm text-gray-500">
                Have a code? Enter it here
              </p>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2">
        <div className="flex justify-between items-center">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Home className="h-5 w-5 text-[#4169E1]" />
            <span className="text-xs text-[#4169E1]">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Card</span>
          </Button>
          <div className="relative -top-5">
            <Button className="h-14 w-14 rounded-full bg-[#4169E1] hover:bg-[#3158D3] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </Button>
          </div>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Bitcoin className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Crypto</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1"
            onClick={() => router.push("/profile")}
          >
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
