import { DollarSign, Users, Gift } from "lucide-react";

export const cards = [
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
