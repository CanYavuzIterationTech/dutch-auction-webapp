"use client";
import React, { useState, useEffect } from "react";
import { ArrowDownRight } from "lucide-react";
import { UploadRequestBody } from "@/backend/types";
import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "@/config/constants";

export function AuctionBuy({
  data,
  id,
}: {
  data: UploadRequestBody;
  id: string;
}) {
  const {
    connect,
    // disconnect,
    // address,
    // wallet,
    status,
    // getSigningCosmWasmClient,
  } = useChain(CHAIN_NAME);
  const connected = status === "Connected";

  const [currentPrice, setCurrentPrice] = useState({
    om: Number(data.startingPrice),
    usd: Number(data.startingPrice) * 3.6, // TODO: Get actual exchange rate
  });
  const [tokenAmount, setTokenAmount] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const auctionDetails = {
    propertyName: "Property #" + id, // TODO: Add property name to UploadRequestBody
    startDate: data.startDate,
    endDate: data.endDate,
    startingPrice: {
      om: Number(data.startingPrice),
      usd: Number(data.startingPrice) * 3.6, // TODO: Get actual exchange rate
    },
    maxDropPercentage:
      ((Number(data.startingPrice) - Number(data.minimumPrice)) /
        Number(data.startingPrice)) *
      100,
    totalTokens: Number(data.tokenCount),
    availableTokens: Number(data.tokenCount),
    omToUsdRate: 3.6, // TODO: Get actual exchange rate
    durationInDays: Math.ceil(
      (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  };

  // Calculate auction parameters
  const totalDurationSeconds = Math.floor(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
      1000
  );
  const totalPriceDrop =
    auctionDetails.startingPrice.om * (auctionDetails.maxDropPercentage / 100);
  const priceDropPerSecond = totalPriceDrop / totalDurationSeconds;

  const getAuctionStatus = () => {
    const now = new Date().getTime();
    const startTime = new Date(data.startDate).getTime();
    const endTime = new Date(data.endDate).getTime();

    if (now < startTime) {
      return "upcoming";
    } else if (now > endTime) {
      return "ended";
    }
    return "live";
  };
  useEffect(() => {
    const status = getAuctionStatus();

    if (status === "live") {
      const timer = setInterval(() => {
        setSecondsElapsed((prev) => {
          const newSeconds = prev + 1;
          const priceDrop = priceDropPerSecond * newSeconds;
          const newOmPrice = Math.max(
            auctionDetails.startingPrice.om *
              (1 - auctionDetails.maxDropPercentage / 100),
            auctionDetails.startingPrice.om - priceDrop
          );
          const newUsdPrice = newOmPrice * auctionDetails.omToUsdRate;

          setCurrentPrice({
            om: Number(newOmPrice.toFixed(2)),
            usd: Number(newUsdPrice.toFixed(2)),
          });

          return newSeconds;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (status === "upcoming") {
      const timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);

      setCurrentPrice({
        om: auctionDetails.startingPrice.om,
        usd: auctionDetails.startingPrice.usd,
      });

      return () => clearInterval(timer);
    }
  }, [
    auctionDetails.startingPrice.om,
    auctionDetails.startingPrice.usd,
    auctionDetails.maxDropPercentage,
    auctionDetails.omToUsdRate,
    priceDropPerSecond,
    totalDurationSeconds,
    getAuctionStatus,
  ]);

  const formatTimeRemaining = () => {
    const now = new Date().getTime();
    const status = getAuctionStatus();

    if (status === "upcoming") {
      const startTime = new Date(data.startDate).getTime();
      const remainingSeconds = Math.floor((startTime - now) / 1000);
      const days = Math.floor(remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(remainingSeconds % 60);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (status === "live") {
      const remainingSeconds = totalDurationSeconds - secondsElapsed;
      const days = Math.floor(remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(remainingSeconds % 60);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return "Auction Ended";
  };

  const calculatePriceAtDay = (dayNumber: number) => {
    const secondsInDay = dayNumber * 24 * 60 * 60;
    const priceDrop = priceDropPerSecond * secondsInDay;
    const omPrice = Math.max(
      auctionDetails.startingPrice.om *
        (1 - auctionDetails.maxDropPercentage / 100),
      auctionDetails.startingPrice.om - priceDrop
    );

    return {
      om: Number(omPrice.toFixed(2)),
      usd: Number((omPrice * auctionDetails.omToUsdRate).toFixed(2)),
    };
  };

  const calculateTotal = () => {
    if (!tokenAmount) return { om: 0, usd: 0 };
    return {
      om: Number(tokenAmount) * currentPrice.om,
      usd: Number(tokenAmount) * currentPrice.usd,
    };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="h-64 relative">
                <img
                  src={data.image}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                  {auctionDetails.propertyName}
                </h1>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Auction Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Duration</span>
                        <span>{auctionDetails.durationInDays} Days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Start Date</span>
                        <span>
                          {new Date(auctionDetails.startDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">End Date</span>
                        <span>
                          {new Date(auctionDetails.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Price Drop</span>
                        <span>{auctionDetails.maxDropPercentage}% Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Price Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Starting Price</span>
                        <span>
                          {auctionDetails.startingPrice.om.toLocaleString()} $OM
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">USD Equivalent</span>
                        <span>
                          ${auctionDetails.startingPrice.usd.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Minimum Price</span>
                        <span>
                          {(
                            auctionDetails.startingPrice.om *
                            (1 - auctionDetails.maxDropPercentage / 100)
                          ).toLocaleString()}{" "}
                          $OM
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Tokens</span>
                        <span>
                          {auctionDetails.totalTokens.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Property Features
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Layout
                      </h4>
                      <div className="space-y-1">
                        <div className="text-sm text-slate-400">
                          {data.layout1}
                        </div>
                        <div className="text-sm text-slate-400">
                          {data.layout2}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Views
                      </h4>
                      <div className="space-y-1">
                        <div className="text-sm text-slate-400">
                          {data.views1}
                        </div>
                        <div className="text-sm text-slate-400">
                          {data.views2}
                        </div>
                      </div>
                    </div>
                    {/* Add similar sections for outdoor, wellness, and interior */}
                  </div>
                </div>

                {/* Price Drop Schedule */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Estimated Price Points
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm text-slate-400">Day 1</div>
                      <div className="font-medium">
                        {calculatePriceAtDay(1).om.toLocaleString()} $OM
                      </div>
                      <div className="text-sm text-slate-400">
                        ${calculatePriceAtDay(1).usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm text-slate-400">Day 2</div>
                      <div className="font-medium">
                        {calculatePriceAtDay(2).om.toLocaleString()} $OM
                      </div>
                      <div className="text-sm text-slate-400">
                        ${calculatePriceAtDay(2).usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm text-slate-400">Day 3</div>
                      <div className="font-medium">
                        {calculatePriceAtDay(3).om.toLocaleString()} $OM
                      </div>
                      <div className="text-sm text-slate-400">
                        ${calculatePriceAtDay(3).usd.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Interface */}
          <div className="space-y-6">
            {/* Current Price */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Price Status</h2>
              <div className="space-y-4">
                {getAuctionStatus() === "upcoming" ? (
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                    <div className="text-blue-500 font-medium mb-1">
                      Auction Starts In
                    </div>
                    <div className="text-2xl font-mono font-bold">
                      {formatTimeRemaining()}
                    </div>
                    <div className="text-sm text-blue-400 mt-2">
                      Starting Price: {currentPrice.om.toLocaleString()} $OM
                    </div>
                  </div>
                ) : getAuctionStatus() === "ended" ? (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-slate-400 mb-1">Auction Ended</div>
                    <div className="text-2xl font-mono font-bold">
                      {currentPrice.om.toLocaleString()} $OM
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">
                        Current Price
                      </div>
                      <div className="text-3xl font-mono font-bold">
                        {currentPrice.om.toLocaleString()} $OM
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        ${currentPrice.usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <ArrowDownRight className="w-4 h-4" />
                        <span>Price drops every second</span>
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">
                        Time Remaining
                      </div>
                      <div className="text-2xl font-mono font-bold">
                        {formatTimeRemaining()}
                      </div>
                    </div>

                    {/* Only show buy interface when auction is live */}
                    <div className="mt-6">
                      <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">
                            Available Tokens
                          </span>
                          <span>
                            {auctionDetails.availableTokens.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          placeholder={
                            connected
                              ? "Enter number of tokens"
                              : "Connect wallet to buy tokens"
                          }
                          className="w-full bg-slate-600 rounded p-2 mt-2 disabled:opacity-50"
                          disabled={!connected}
                        />
                      </div>

                      {tokenAmount && (
                        <div className="bg-slate-700 rounded-lg p-4 mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Total Cost</span>
                            <span>
                              {calculateTotal().om.toLocaleString()} $OM
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">
                              USD Equivalent
                            </span>
                            <span>
                              ${calculateTotal().usd.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {connected ? (
                        <button
                          className="w-full bg-green-500 hover:bg-green-600 rounded-lg p-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!tokenAmount || Number(tokenAmount) <= 0}
                        >
                          Buy Now
                        </button>
                      ) : (
                        <div className="mt-4">
                          <div className="text-center text-sm text-slate-400 mb-2">
                            Connect your wallet to participate in the auction
                          </div>
                          <button
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg p-4"
                            onClick={() => connect()}
                          >
                            Connect Wallet
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
