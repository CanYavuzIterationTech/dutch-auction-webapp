import React from "react";
import {
  Timer,
  Calendar,
  DollarSign,
  ArrowRight,
  Users,
  Building,
  History,
} from "lucide-react";

type Price = {
  om: number;
  usd: number;
};

type Features = {
  layout: string[];
  views: string[];
  outdoor: string[];
  wellness: string[];
  interior: string[];
};

type BaseAuction = {
  id: number;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  startingPrice: Price;
  maxDropPercentage: number;
  totalTokens: number;
  features: Features;
  location: string;
};

type LiveAuction = BaseAuction & {
  status: "live";
  currentPrice: Price;
  availableTokens: number;
};

type UpcomingAuction = BaseAuction & {
  status: "upcoming";
  availableTokens: number;
};

type PastAuction = BaseAuction & {
  status: "past";
  finalPrice: Price;
  soldTokens: number;
  soldAt: string;
};

type Auction = LiveAuction | UpcomingAuction | PastAuction;

const auctions: Auction[] = [
  {
    id: 1,
    status: "live",
    name: "Palm Jumeirah Signature Villa",
    image: "/api/placeholder/800/400",
    startDate: "2024-11-26 10:00:00",
    endDate: "2024-11-29 10:00:00",
    startingPrice: { om: 1000000, usd: 3600000 },
    currentPrice: { om: 966000, usd: 3477600 },
    maxDropPercentage: 20,
    totalTokens: 1000,
    availableTokens: 1000,
    features: {
      layout: ["6 Bedrooms", "5 Bathrooms"],
      views: ["Sea View", "Palm View"],
      outdoor: ["Private Beach", "Infinity Pool"],
      wellness: ["Private Gym", "Sauna"],
      interior: ["Smart Home", "Private Cinema"],
    },
    location: "Palm Jumeirah Frond N",
  },
  {
    id: 2,
    status: "upcoming",
    name: "Downtown Penthouse Suite",
    image: "/api/placeholder/800/400",
    startDate: "2024-12-01 10:00:00",
    endDate: "2024-12-04 10:00:00",
    startingPrice: { om: 750000, usd: 2700000 },
    maxDropPercentage: 15,
    totalTokens: 800,
    availableTokens: 800,
    features: {
      layout: ["4 Bedrooms", "3.5 Bathrooms"],
      views: ["Burj Khalifa View", "Dubai Fountain View"],
      outdoor: ["Private Terrace", "Rooftop Garden"],
      wellness: ["Private Gym", "Spa"],
      interior: ["Smart Home", "Study Room"],
    },
    location: "Downtown Dubai",
  },
  {
    id: 3,
    status: "past",
    name: "Marina Luxury Loft",
    image: "/api/placeholder/800/400",
    startDate: "2024-11-20 10:00:00",
    endDate: "2024-11-23 10:00:00",
    startingPrice: { om: 500000, usd: 1800000 },
    finalPrice: { om: 435000, usd: 1566000 },
    maxDropPercentage: 15,
    totalTokens: 500,
    soldTokens: 500,
    features: {
      layout: ["3 Bedrooms", "2 Bathrooms"],
      views: ["Marina View", "Sea View"],
      outdoor: ["Balcony", "Community Pool"],
      wellness: ["Private Gym", "Yoga Deck"],
      interior: ["Designer Kitchen", "Smart Home"],
    },
    location: "Dubai Marina",
    soldAt: "2024-11-22 15:30:00",
  },
];

export default function HomePage() {
  const formatTimeLeft = (dateString: string) => {
    const now = new Date().getTime();
    const target = new Date(dateString).getTime();
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const AuctionCard = ({ auction }: { auction: Auction }) => {
    const isLive = auction.status === "live";
    const isPast = auction.status === "past";

    return (
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="relative">
          <img
            src={auction.image}
            alt={auction.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isLive
                  ? "bg-green-500"
                  : isPast
                  ? "bg-slate-500"
                  : "bg-blue-500"
              }`}
            >
              {isLive ? "Live Now" : isPast ? "Completed" : "Upcoming"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{auction.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building className="w-4 h-4" />
              <span>{auction.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-slate-400">
                {isLive
                  ? "Current Price"
                  : isPast
                  ? "Final Price"
                  : "Starting Price"}
              </div>
              <div className="text-xl font-mono font-bold">
                {isLive
                  ? auction.currentPrice.om.toLocaleString()
                  : isPast
                  ? auction.finalPrice.om.toLocaleString()
                  : auction.startingPrice.om.toLocaleString()}{" "}
                $OM
              </div>
              <div className="text-sm text-slate-400">
                $
                {(isLive
                  ? auction.currentPrice.usd
                  : isPast
                  ? auction.finalPrice.usd
                  : auction.startingPrice.usd
                ).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400">
                {isLive ? "Ends In" : isPast ? "Sold On" : "Starts In"}
              </div>
              <div className="text-xl font-mono font-bold">
                {isPast
                  ? new Date(auction.soldAt).toLocaleDateString()
                  : formatTimeLeft(
                      isLive ? auction.endDate : auction.startDate
                    )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <DollarSign className="w-4 h-4" />
              <span>
                {isPast
                  ? `Drop: ${(
                      (1 - auction.finalPrice.om / auction.startingPrice.om) *
                      100
                    ).toFixed(1)}%`
                  : `Max Drop: ${auction.maxDropPercentage}%`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="w-4 h-4" />
              <span>
                {isPast
                  ? `${auction.soldTokens} Tokens Sold`
                  : `${auction.availableTokens} Tokens`}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {Object.entries(auction.features).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-slate-300 capitalize mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((feature, index) => (
                    <div
                      key={index}
                      className="text-sm text-slate-400 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            className={`w-full ${
              isPast
                ? "bg-slate-600 hover:bg-slate-700"
                : "bg-blue-500 hover:bg-blue-600"
            } rounded-lg p-4 flex items-center justify-center gap-2 transition-colors`}
          >
            {isLive ? "View Auction" : isPast ? "View Results" : "Set Reminder"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Real Estate Dutch Auctions
          </h1>
          <p className="text-lg text-slate-400">
            Discover exclusive properties with our unique Dutch auction system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Timer className="w-5 h-5 text-green-500" />
              Live Auctions
            </h2>
            <p className="text-slate-400">
              Active auctions with prices dropping in real-time
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Auctions
            </h2>
            <p className="text-slate-400">
              Future auctions you can prepare for
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-slate-500">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Past Auctions
            </h2>
            <p className="text-slate-400">
              View completed auctions and their results
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="font-bold mb-2">Dutch Auction</h3>
            <p className="text-sm text-slate-400">
              Price decreases over time until someone makes a purchase
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-2">Token-Based</h3>
            <p className="text-sm text-slate-400">
              Properties are divided into tokens for fractional ownership
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-2">3-Day Duration</h3>
            <p className="text-sm text-slate-400">
              Each auction runs for exactly 3 days with continuous price drops
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
