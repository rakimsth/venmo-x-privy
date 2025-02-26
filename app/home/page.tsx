"use client";

import { useState, type KeyboardEvent } from "react";
import { Search, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { cards } from "../constants/home";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Status Bar */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-20">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 pr-10 py-6 bg-white rounded-full"
            placeholder="Search People, Business, & Charities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={handleKeyPress}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleSearch}
          >
            <QrCode className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-1">Welcome to Privy Pay!</h1>
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
                        onClick={() => card.action(router)}
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
