"use client";
import React from "react";
import {
  Timer,
  Calendar,
  DollarSign,
  ArrowRight,
  Users,
  Building,
  History,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { UploadRequestBody } from "@/backend/types";

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

export type Auction2 = {
  index: number;
  info: UploadRequestBody;
  creator: string;
  end_price: string;
  end_time: string;
  in_denom: string;
  offered_asset: {
    amount: string;
    denom: string;
  };
  remaining_amount: string;
  start_time: string;
  starting_price: string;
};

export type Fuck = {
  value: Auction2;
  status: "fulfilled";
};

export default function HomePage({ auctions2 }: { auctions2: Auction2[] }) {
  const formatTimeLeft = (dateString: string) => {
    const now = new Date().getTime();
    const target = new Date(dateString).getTime();
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const convertAuction2ToAuction = (auction2: Auction2): Auction => {
    const startTime = new Date(parseInt(auction2.start_time) * 1000);
    const endTime = new Date(parseInt(auction2.end_time) * 1000);
    const now = new Date();

    const startingPriceNumber = parseFloat(auction2.starting_price);
    const endPriceNumber = auction2.end_price
      ? parseFloat(auction2.end_price)
      : 0;

    console.log("start timeq: ", startTime);
    console.log("end timeq: ", endTime);

    const baseAuction = {
      id: auction2.index,
      name: auction2.info.name || "Unnamed Property",
      image: auction2.info.image || "/api/placeholder/800/400",
      startDate: auction2.info.startDate,
      endDate: auction2.info.endDate,
      startingPrice: {
        om: startingPriceNumber,
        usd: startingPriceNumber * 3.6, // Assuming 1 OM = 3.6 USD
      },
      maxDropPercentage: 20, // Default value
      totalTokens: parseInt(auction2.offered_asset.amount),
      features: {
        layout: [auction2.info.layout1, auction2.info.layout2],
        views: [auction2.info.views1, auction2.info.views2],
        outdoor: [auction2.info.outdoor1, auction2.info.outdoor2],
        wellness: [auction2.info.wellness1, auction2.info.wellness2],
        interior: [auction2.info.interior1, auction2.info.interior2],
      },
      location: "Location not specified",
    };

    if (now < startTime) {
      return {
        ...baseAuction,
        status: "upcoming" as const,
        availableTokens: parseInt(auction2.remaining_amount),
      };
    } else if (now > endTime) {
      return {
        ...baseAuction,
        status: "past" as const,
        finalPrice: {
          om: endPriceNumber,
          usd: endPriceNumber * 3.6,
        },
        soldTokens:
          parseInt(auction2.offered_asset.amount) -
          parseInt(auction2.remaining_amount),
        soldAt: endTime.toISOString(),
      };
    } else {
      const currentPrice = endPriceNumber || startingPriceNumber; // Use end price if available, otherwise starting price
      return {
        ...baseAuction,
        status: "live" as const,
        currentPrice: {
          om: currentPrice,
          usd: currentPrice * 3.6,
        },
        availableTokens: parseInt(auction2.remaining_amount),
      };
    }
  };

  const convertedAuctions = auctions2.map(convertAuction2ToAuction);

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

          <Link
            href={`/auction/${auction.id}`}
            className={`w-full ${
              isPast
                ? "bg-slate-600 hover:bg-slate-700"
                : "bg-blue-500 hover:bg-blue-600"
            } rounded-lg p-4 flex items-center justify-center gap-2 transition-colors`}
          >
            {isLive ? "View Auction" : isPast ? "View Results" : "Set Reminder"}
            <ArrowRight className="w-4 h-4" />
          </Link>
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
          <div className="flex justify-center mb-8">
            <Link
              href="/create-auction"
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Auction
            </Link>
          </div>
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
          {convertedAuctions.map((auction) => (
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
