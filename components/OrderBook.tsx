import React from 'react';
import { MarketState, OrderRow } from '../types';

const OrderRowItem: React.FC<{ row: OrderRow; maxVolume: number; color: string }> = ({ row, maxVolume, color }) => {
  const depthPercentage = (row.size / maxVolume) * 100;
  
  return (
    <div className="group flex justify-between text-[10px] py-0.5 hover:bg-white/5 cursor-pointer font-mono px-4 relative overflow-hidden">
      <div 
        className="absolute inset-y-0 right-0 transition-all duration-300 pointer-events-none opacity-20" 
        style={{ width: `${depthPercentage}%`, backgroundColor: color }}
      />
      <span className="relative z-10 font-bold" style={{ color: color }}>
        {row.price.toFixed(2)}
      </span>
      <span className="relative z-10 text-gray-300 font-bold">{row.size}</span>
      <span className="relative z-10 text-gray-500 text-right w-20">
        {row.total.toLocaleString()}
      </span>
    </div>
  );
};

const OrderBook: React.FC<{ state: MarketState }> = ({ state }) => {
  const maxVolume = Math.max(
    ...state.orderBook.asks.map(a => a.size),
    ...state.orderBook.bids.map(b => b.size)
  );

  const spread = state.orderBook.asks[0].price - state.orderBook.bids[0].price;

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden select-none">
      <div className="h-8 flex items-center justify-between px-4 bg-[#15191e] border-b border-white/5 shrink-0">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Order Book</span>
        <div className="flex gap-2">
           <div className="w-3 h-3 border border-white/10 bg-emerald-500/20"></div>
           <div className="w-3 h-3 border border-white/10 bg-rose-500/20"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 text-[8px] text-gray-600 font-black px-4 py-1.5 uppercase border-b border-white/5 bg-black/20">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Sum</span>
      </div>

      {/* Asks (Sellers) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {[...state.orderBook.asks].reverse().slice(0, 15).map((ask, idx) => (
          <OrderRowItem 
            key={`ask-${idx}`} 
            row={ask} 
            maxVolume={maxVolume} 
            color="#f43f5e"
          />
        ))}
      </div>

      {/* Spread Bar */}
      <div className="h-10 flex flex-col items-center justify-center border-y border-white/5 bg-[#0b0e11] shrink-0">
         <div className="flex items-center gap-2">
           <span className="text-sm font-black font-mono text-emerald-500">${state.price.toFixed(2)}</span>
           <span className="text-[9px] font-bold text-emerald-500/60 flex items-center">↑ 1.51%</span>
         </div>
         <span className="text-[8px] font-bold text-gray-600 uppercase">Spread: {spread.toFixed(2)}</span>
      </div>

      {/* Bids (Buyers) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {state.orderBook.bids.slice(0, 15).map((bid, idx) => (
          <OrderRowItem 
            key={`bid-${idx}`} 
            row={bid} 
            maxVolume={maxVolume}
            color="#10b981"
          />
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
