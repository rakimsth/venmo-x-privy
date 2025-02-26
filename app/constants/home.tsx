import { DollarSign, Users } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const cards = [
  {
    title: "Make your first payment",
    description: "Pay or request money or send a gift",
    buttonText: "Get started",
    color: "#4169E1",
    icon: <DollarSign className="h-8 w-8 text-[#4169E1]" />,
    action: (router: AppRouterInstance) => router.push("/transfers"),
  },
  {
    title: "Find people to pay",
    description: "Invite using your friend's email",
    buttonText: "Invite People",
    color: "#9333EA",
    icon: <Users className="h-8 w-8 text-[#9333EA]" />,
    action: (router: AppRouterInstance) => router.push("/search"),
  },
];
