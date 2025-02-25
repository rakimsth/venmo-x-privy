"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, CreditCard, DollarSign, Bitcoin, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: CreditCard, label: "Card", path: "/card" },
  { icon: DollarSign, Label: "", path: "/transfers" },
  { icon: Bitcoin, label: "Crypto", path: "/balances" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2">
      <div className="flex justify-between items-center">
        {navItems.map((item, index) => (
          <Link key={item.path} href={item.path} passHref>
            {index === 2 ? (
              <div className="relative -top-5">
                <Button
                  className="h-14 w-14 rounded-full bg-[#4169E1] hover:bg-[#3158D3] flex items-center justify-center"
                  onClick={() => router.push(item?.path)}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 ${
                  pathname === item.path ? "text-[#4169E1]" : "text-gray-400"
                }`}
                onClick={() => router.push(item?.path)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
