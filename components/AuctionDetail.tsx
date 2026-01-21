import React, { useState, useEffect } from 'react';
import { Share2, Heart, ShieldCheck, Clock, Truck, Eye } from 'lucide-react';
import { AuctionItem } from './auctionData';

interface AuctionDetailProps {
    auction: AuctionItem;
    onBack: () => void;
}

export const AuctionDetail: React.FC<AuctionDetailProps> = ({ auction, onBack }) => {
    // If we have a specific time object in data, use it, otherwise default
    const initialTime = auction.timeLeftObject || { d: 0, h: 0, m: 24, s: 12 };

    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [currentBid, setCurrentBid] = useState(auction.currentBid);
    const [yourBid, setYourBid] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleBid = () => {
        const bidAmount = parseFloat(yourBid);
        if (bidAmount > currentBid) {
            setCurrentBid(bidAmount);
            setYourBid('');
            alert('Bid placed successfully!');
        } else {
            alert('Bid must be higher than current bid.');
        }
    };

    return (
        <div className="bg-[#f0f0f0] min-h-screen text-[#111820] font-sans">
            {/* Mobile-friendly Back Button (replaces breadcrumbs) */}
            <div className="max-w-[1400px] mx-auto px-4 py-2">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0654ba] bg-white border border-[#e5e5e5] rounded-full hover:bg-[#f8f9fa] hover:border-[#0654ba] transition-all shadow-sm"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Auctions
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 bg-white rounded-lg shadow-sm border border-[#e5e5e5] mb-8">

                {/* Left Column: Media */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="relative aspect-[3/4] flex items-center justify-center bg-black/5 rounded cursor-zoom-in border border-[#e5e5e5]">
                        <img
                            src={auction.image}
                            alt={auction.title}
                            className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button className="p-2 bg-white rounded-full shadow hover:bg-[#f5f5f5]"><Share2 size={16} /></button>
                            <button className="p-2 bg-white rounded-full shadow hover:bg-[#f5f5f5]"><Heart size={16} /></button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-[#555]">Roll over image to zoom in</p>
                </div>

                {/* Center/Right Content */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {/* Title */}
                    <div className="border-b border-[#e5e5e5] pb-4">
                        <h1 className="text-xl md:text-2xl font-bold text-[#111820] leading-snug mb-2">
                            {auction.title}
                        </h1>
                    </div>

                    {/* Auction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bidding Area */}
                        <div className="bg-[#f8f9fa] p-4 rounded border border-[#e5e5e5] h-fit">
                            <div className="mb-4">
                                <div className="text-sm text-[#555] mb-1">Current bid:</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-[#333]">${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-xs text-[#707070]">[ {auction.bids} bids ]</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Enter US $"
                                        value={yourBid}
                                        onChange={e => setYourBid(e.target.value)}
                                        className="flex-1 border border-[#999] rounded px-3 py-2 text-sm focus:border-[#3665f3] outline-none"
                                    />
                                    <button onClick={handleBid} className="bg-[#3665f3] hover:bg-[#2b52cc] text-white font-bold py-2 px-6 rounded-full text-sm">
                                        Place Bid
                                    </button>
                                </div>
                                <div className="text-xs text-[#707070] text-center">Enter ${currentBid + 100} or more</div>
                            </div>

                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex justify-between items-center bg-white p-3 border border-[#e5e5e5] rounded">
                                    <span className="text-sm font-bold text-[#111820]">Time Left:</span>
                                    <div className="flex items-center gap-2 text-[#d11124] font-bold font-mono">
                                        <Clock size={16} />
                                        {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Seller & Shipping Info */}
                        <div className="space-y-6">
                            {/* Seller Box */}
                            <div className="border border-[#e5e5e5] rounded p-4">
                                <h3 className="font-bold text-[#111820] text-sm mb-3">Seller Information</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[#0654ba] rounded-full flex items-center justify-center text-white font-bold text-xs">SV</div>
                                    <div>
                                        <div className="font-bold text-[#0654ba] text-sm cursor-pointer hover:underline">{auction.seller.name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Authenticity Guarantee */}
                            <div className="border border-[#e5e5e5] rounded p-4 bg-[#f8f9fa]">
                                <div className="flex gap-3">
                                    <div className="text-[#0654ba]"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-[#111820] text-sm flex items-center gap-1">Authenticity Guarantee <Eye size={12} className="text-[#707070] cursor-pointer" /></h3>
                                        <p className="text-xs text-[#555] mt-1">Inspected by independent authenticators.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Truck size={16} className="text-[#111820] mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-[#111820]">Free Local Pickup</div>
                                        <div className="text-xs text-[#555]">Located in {auction.seller.location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-[#e5e5e5] rounded bg-white mt-4">
                        <div className="bg-[#f8f9fa] border-b border-[#e5e5e5] px-4 py-3">
                            <h2 className="font-bold text-sm text-[#111820]">Item specifics</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Condition:</span>
                                <span className="text-[#111820] font-bold">{auction.specifics.condition}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Game:</span>
                                <span className="text-[#111820]">{auction.specifics.game}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Set:</span>
                                <span className="text-[#111820]">{auction.specifics.set}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Card Name:</span>
                                <span className="text-[#111820]">{auction.specifics.cardName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Card Number:</span>
                                <span className="text-[#111820]">{auction.specifics.cardNumber}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Professional Grader:</span>
                                <span className="text-[#111820]">{auction.specifics.professionalGrader}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Grade:</span>
                                <span className="text-[#111820]">{auction.specifics.grade}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#707070]">Year:</span>
                                <span className="text-[#111820]">{auction.specifics.year}</span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};
