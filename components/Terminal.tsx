import React, { useState } from 'react';
import { Sparkles, TrendingUp, Search, Star, Clock, List, History, ChevronDown } from 'lucide-react';
import OrderBook from './OrderBook';
import TradePanel from './TradePanel';
import KlineChart from './KlineChart';
import { MarketState, UserAsset, Trade } from '../types';

const PositionsTable: React.FC<{ userAsset: UserAsset }> = ({ userAsset }) => (
  <div className="flex-1 flex flex-col bg-[#0b0e11] overflow-hidden">
    <div className="flex border-b border-white/5 bg-[#15191e] px-4">
      {['Positions', 'Open Orders(0)', 'Trade History', 'Assets'].map((tab, i) => (
        <button key={tab} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
          {tab}
        </button>
      ))}
    </div>
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#0b0e11] sticky top-0">
          <tr className="text-[9px] text-gray-500 uppercase font-black border-b border-white/5">
            <th className="px-4 py-2">Asset</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Entry Price</th>
            <th className="px-4 py-2">Mark Price</th>
            <th className="px-4 py-2">PNL (ROE%)</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-[10px] font-bold text-gray-300">
          {userAsset.balance > 0 ? (
            <tr className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 text-blue-400">{userAsset.name}</td>
              <td className="px-4 py-3">{userAsset.balance} BOX</td>
              <td className="px-4 py-3 font-mono">${userAsset.avgCost.toFixed(2)}</td>
              <td className="px-4 py-3 font-mono">${userAsset.floor.toFixed(2)}</td>
              <td className={`px-4 py-3 font-mono ${userAsset.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {userAsset.pnl >= 0 ? '+' : ''}${userAsset.pnl.toFixed(2)} ({((userAsset.pnl / (userAsset.avgCost * userAsset.balance)) * 100).toFixed(2)}%)
              </td>
              <td className="px-4 py-3 text-right">
                <button className="text-rose-500 hover:underline">Market Close</button>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-600 italic">No active positions</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Terminal: React.FC<{ state: MarketState; userAsset: UserAsset }> = ({ state, userAsset }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'depth'>('chart');
  const [mobileTab, setMobileTab] = useState<'chart' | 'depth' | 'trade'>('chart');

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-gray-300 font-sans select-none overflow-hidden relative">
      {/* 1. Top Ticker Bar */}
      <div className="h-14 border-b border-white/5 bg-[#15191e] flex items-center px-4 gap-4 md:gap-8 shrink-0 relative z-20 justify-between md:justify-start">
        <div className="flex items-center gap-2 group cursor-pointer min-w-0">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0"><Star size={16} fill="currentColor" /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-white italic tracking-tighter uppercase flex items-center gap-1 truncate">
              {state.asset} <ChevronDown size={14} className="text-gray-500" />
            </span>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest hidden md:block">Live 24*7</span>
          </div>
        </div>

        <div className="flex flex-col text-right md:text-left shrink-0">
          <span className={`text-lg font-black font-mono leading-none ${state.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${state.price.toFixed(2)}
          </span>
          <span className="text-[10px] text-gray-500 font-bold italic hidden md:block">${state.price.toFixed(2)}</span>
          <span className={`text-[10px] font-bold font-mono md:hidden ${state.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {state.change24h >= 0 ? '+' : ''}{state.change24h}%
          </span>
        </div>

        <div className="hidden md:flex gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">24h Change</span>
            <span className={`text-[11px] font-bold font-mono ${state.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {state.change24h >= 0 ? '+' : ''}{state.change24h}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">24h High</span>
            <span className="text-[11px] font-bold font-mono text-gray-300">${(state.price * 1.05).toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">24h Low</span>
            <span className="text-[11px] font-bold font-mono text-gray-300">${(state.price * 0.98).toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">24h Volume(BOX)</span>
            <span className="text-[11px] font-bold font-mono text-gray-300">1.24k</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 border-b border-white/5 overflow-hidden relative">
        {/* 2. Main Content (Chart + Bottom Panels) 
            On Mobile: Only show if mobileTab is 'chart'
            On Desktop: Always show
        */}
        <div className={`flex-1 flex-col min-w-0 border-r border-white/5 h-full relative ${mobileTab === 'chart' ? 'flex' : 'hidden md:flex'}`}>
          {/* Chart Section */}
          <div className="flex-1 flex flex-col min-h-0 relative z-0">
            <div className="h-9 border-b border-white/5 flex items-center px-4 bg-[#0b0e11] gap-4 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-0.5 shrink-0">
                {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                  <button key={tf} className={`px-2 py-1 text-[10px] font-bold hover:bg-white/5 rounded ${tf === '1H' ? 'text-blue-400' : 'text-gray-500'}`}>{tf}</button>
                ))}
              </div>
              <div className="h-4 w-[1px] bg-white/10 shrink-0"></div>
              <button className="text-[10px] font-bold text-gray-500 flex items-center gap-1 hover:text-white shrink-0"><List size={12} /> Indicators</button>
            </div>
            <div className="flex-1 bg-[#0b0e11] w-full h-full relative overflow-hidden">
              <KlineChart currentPrice={state.price} />
            </div>
          </div>

          {/* Bottom Panels (Positions) */}
          <div className="h-64 shrink-0 border-t border-white/5 bg-[#0b0e11] relative z-10 hidden md:block">
            <PositionsTable userAsset={userAsset} />
          </div>
          {/* Mobile Position Info (Simplified or same) */}
          <div className="h-48 shrink-0 border-t border-white/5 bg-[#0b0e11] relative z-10 block md:hidden">
            <PositionsTable userAsset={userAsset} />
          </div>
        </div>

        {/* 3. Order Book & Recent Trades 
            On Mobile: Only show if mobileTab is 'depth'
            On Desktop: Always show
        */}
        <div className={`w-full md:w-72 flex-col border-r border-white/5 shrink-0 bg-[#0b0e11] ${mobileTab === 'depth' ? 'flex' : 'hidden xl:flex'}`}>
          <div className="flex-1 min-h-0 flex flex-col">
            <OrderBook state={state} />
          </div>
          <div className="h-64 border-t border-white/5 flex flex-col bg-[#0b0e11]">
            <div className="h-8 border-b border-white/5 flex items-center px-4 bg-[#15191e] shrink-0">
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic">Latest Trades</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="text-[8px] text-gray-600 font-black uppercase border-b border-white/5 sticky top-0 bg-[#0b0e11]">
                  <tr>
                    <th className="px-4 py-1">Price</th>
                    <th className="px-4 py-1 text-right">Size</th>
                    <th className="px-4 py-1 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono font-bold">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className={`px-4 py-0.5 ${i % 3 === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>${(state.price + (Math.random() * 2 - 1)).toFixed(2)}</td>
                      <td className="px-4 py-0.5 text-right text-gray-300">{(Math.random() * 10).toFixed(0)}</td>
                      <td className="px-4 py-0.5 text-right text-gray-600">02:07:3{i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Trade Entry Panel 
            On Mobile: Only show if mobileTab is 'trade'
            On Desktop: Always show
        */}
        <div className={`w-full md:w-80 shrink-0 bg-[#15191e] flex-col p-4 overflow-y-auto z-20 ${mobileTab === 'trade' ? 'flex' : 'hidden md:flex'}`}>
          <TradePanel state={state} userAsset={userAsset} />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden h-14 bg-[#15191e] border-t border-white/10 flex items-center justify-around px-2 shrink-0 z-50">
        <button
          onClick={() => setMobileTab('chart')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'chart' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <TrendingUp size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Chart</span>
        </button>
        <button
          onClick={() => setMobileTab('depth')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'depth' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <List size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Depth</span>
        </button>
        <button
          onClick={() => setMobileTab('trade')}
          className={`flex flex-col items-center gap-1 p-2 ${mobileTab === 'trade' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <Sparkles size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Trade</span>
        </button>
      </div>

      {/* 5. Status Bar - Hidden on mobile to save space */}
      <div className="hidden md:flex h-6 bg-[#0b0e11] border-t border-white/5 px-3 items-center justify-between text-[9px] font-black uppercase text-gray-600 tracking-widest shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Stable Connection</span>
          <span>Latency: 12ms</span>
        </div>
        <div className="flex gap-4">
          <span>Order Routing: NY4</span>
          <span>SGT 01/14 02:07:38</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;