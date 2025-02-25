"use client";

import {
  Search,
  QrCode,
  Home,
  CreditCard,
  DollarSign,
  Bitcoin,
  User,
  Users,
  Gift,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { redirect, useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";

const cards = [
  {
    title: "Make your first payment",
    description: "Pay or request money or send a gift",
    buttonText: "Get started",
    color: "#4169E1", // Blue
    icon: <DollarSign className="h-8 w-8 text-[#4169E1]" />,
    action: () => console.log("Make payment"),
  },
  {
    title: "Find people to pay",
    description: "Invite using your friend's email",
    buttonText: "Invite People",
    color: "#9333EA", // Purple
    icon: <Users className="h-8 w-8 text-[#9333EA]" />,
    action: () => console.log("Sync contacts"),
  },
  {
    title: "Send a gift",
    description: "Surprise someone special with money",
    buttonText: "Send gift",
    color: "#F59E0B", // Yellow
    icon: <Gift className="h-8 w-8 text-[#F59E0B]" />,
    action: () => console.log("Send gift"),
  },
];

export default function HomePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
  });

  useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
          <h1 className="text-2xl font-semibold mb-1">Welcome to PrivyPay!</h1>
          <p className="text-gray-500">What would you like to do first?</p>
        </div>

        {/* Swipeable Cards */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 pl-4 relative first:pl-8 last:pr-8"
              >
                <Card className="overflow-hidden">
                  <div className="relative">
                    <div
                      className="absolute top-0 left-0 right-0 h-24 rounded-b-[100px]"
                      style={{ backgroundColor: card.color }}
                    />
                    <div className="relative pt-16 pb-6 px-6 text-center">
                      <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                        {card.icon}
                      </div>
                      <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                      <p className="text-gray-500 mb-4">{card.description}</p>
                      <Button
                        variant="outline"
                        className="rounded-full border-current text-current hover:bg-current hover:bg-opacity-10"
                        style={{ borderColor: card.color, color: card.color }}
                        onClick={card.action}
                      >
                        {card.buttonText}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
