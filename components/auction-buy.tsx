"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ArrowDownRight } from "lucide-react";
import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "@/config/constants";
import { Auction2 } from "./home-page";
import { useDutchAuctionLaunchpadBidMutation } from "@/contract/dutch-auction.react-query";
import { useAuctionClients } from "@/wrappers/connection-wrapper";
import { toast } from "sonner";

export function AuctionBuy({
  data,
  id,
}: {
  data: Auction2;
  id: string;
}) {
  const {
    connect,
    status,
  } = useChain(CHAIN_NAME);
  const connected = status === "Connected";

  const [currentPrice, setCurrentPrice] = useState({
    om: parseFloat(data.starting_price),
    usd: parseFloat(data.starting_price) * 3.6,
  });
  const [tokenAmount, setTokenAmount] = useState("");

  const { signingClient } = useAuctionClients();
  const { mutateAsync: sendBidTx } = useDutchAuctionLaunchpadBidMutation();

  const auctionDetails = useMemo(() => ({
    propertyName: data.info.name || "Property #" + id,
    startTime: parseInt(data.start_time) / 1000000,
    endTime: parseInt(data.end_time) / 1000000,
    startingPrice: {
      om: parseFloat(data.starting_price),
      usd: parseFloat(data.starting_price) * 3.6,
    },
    endPrice: {
      om: parseFloat(data.end_price || data.starting_price),
      usd: parseFloat(data.end_price || data.starting_price) * 3.6,
    },
    totalTokens: parseInt(data.offered_asset.amount),
    availableTokens: parseInt(data.remaining_amount),
    omToUsdRate: 3.6,
    durationInDays: Math.ceil((parseInt(data.end_time) / 1000000000 - parseInt(data.start_time) / 1000000000) / (24 * 60 * 60)),
    maxDropPercentage: ((parseFloat(data.starting_price) - parseFloat(data.end_price || data.starting_price)) / parseFloat(data.starting_price)) * 100
  }), [data, id]);

  const getAuctionStatus = () => {
    const now = Date.now();
    if (now < auctionDetails.startTime) {
      return "upcoming";
    } else if (now > auctionDetails.endTime) {
      return "ended";
    }
    return "live";
  };

  useEffect(() => {
    const updatePrice = () => {
      const now = Date.now();
      const status = getAuctionStatus();

      if (status === "live") {
        const progress = (now - auctionDetails.startTime) / (auctionDetails.endTime - auctionDetails.startTime);
        const currentOmPrice = auctionDetails.startingPrice.om - (progress * (auctionDetails.startingPrice.om - auctionDetails.endPrice.om));
        
        setCurrentPrice({
          om: Number(currentOmPrice.toFixed(6)),
          usd: Number((currentOmPrice * auctionDetails.omToUsdRate).toFixed(2))
        });
      } else if (status === "upcoming") {
        setCurrentPrice(auctionDetails.startingPrice);
      } else {
        setCurrentPrice(auctionDetails.endPrice);
      }
    };

    const timer = setInterval(updatePrice, 1000);
    updatePrice(); // Initial update

    return () => clearInterval(timer);
  }, [auctionDetails]);

  const formatTimeRemaining = () => {
    const now = Date.now();
    const status = getAuctionStatus();

    if (status === "upcoming") {
      const remainingMs = auctionDetails.startTime - now;
      return formatDuration(remainingMs);
    } else if (status === "live") {
      const remainingMs = auctionDetails.endTime - now;
      return formatDuration(remainingMs);
    }
    return "Auction Ended";
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  const calculateTotal = () => {
    if (!tokenAmount) return { om: 0, usd: 0 };
    return {
      om: Number(tokenAmount) * currentPrice.om,
      usd: Number(tokenAmount) * currentPrice.usd,
    };
  };

  const calculatePriceAtDay = (dayNumber: number) => {
    const secondsInDay = 24 * 60 * 60;
    const totalDuration = (auctionDetails.endTime - auctionDetails.startTime) / 1000;
    const progress = (dayNumber * secondsInDay) / totalDuration;
    
    const currentOmPrice = auctionDetails.startingPrice.om - 
      (progress * (auctionDetails.startingPrice.om - auctionDetails.endPrice.om));
    
    return {
      om: Number(currentOmPrice.toFixed(6)),
      usd: Number((currentOmPrice * auctionDetails.omToUsdRate).toFixed(2))
    };
  };

  const handleBuy = async () => {
    if (!signingClient || !connected || !tokenAmount) return;

    try {
      const total = calculateTotal();
      
      const amountInUom = Math.floor(total.om).toString();
      
      console.log("auction id", id);
      await sendBidTx({
        client: signingClient,
        msg: {
          auctionId: parseInt(id),
        },
        args: {
          funds: [
            {
              denom: "uom",
              amount: amountInUom,
            },
          ],
          fee: {
            amount: [
              {
                denom: "uom",
                amount: "2500",
              },
            ],
            gas: "500000",
          },
        },
      });

      toast.success("Successfully purchased tokens!");
      setTokenAmount("");
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast.error("Failed to purchase tokens: " + (error as Error).message);
    }
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
                  src={data.info.image}
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
                          {new Date(auctionDetails.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">End Date</span>
                        <span>
                          {new Date(auctionDetails.endTime).toLocaleString()}
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
                          {data.info.layout1}
                        </div>
                        <div className="text-sm text-slate-400">
                          {data.info.layout2}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Views
                      </h4>
                      <div className="space-y-1">
                        <div className="text-sm text-slate-400">
                          {data.info.views1}
                        </div>
                        <div className="text-sm text-slate-400">
                          {data.info.views2}
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
                          onClick={handleBuy}
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
