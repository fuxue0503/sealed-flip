import React from 'react';
import { Clock } from 'lucide-react';
import { MOCK_AUCTIONS } from './auctionData';

export const AuctionList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
    return (
        <div className="bg-[#f0f0f0] min-h-screen p-4 font-sans text-[#111820]">
            <div className="max-w-[1400px] mx-auto mb-6">
                <h1 className="text-2xl font-bold mb-2">Live Auctions</h1>
                <p className="text-sm text-[#555]">Bid on rare collectibles and sealed product.</p>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_AUCTIONS.map(item => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                    >
                        <div className="aspect-square bg-black/5 relative flex items-center justify-center p-4">
                            <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5em] hover:text-[#0654ba] hover:underline">
                                {item.title}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="font-bold text-lg">${item.currentBid.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-[#555] mb-2">{item.bids} bids</div>
                            <div className="flex items-center gap-1 text-[#d11124] font-bold text-xs">
                                <Clock size={12} />
                                {item.timeLeft}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
