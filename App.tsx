import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronDown, Package, TrendingUp, Sparkles, Activity,
  ArrowRight, X, Wallet, Truck, History, BarChart3,
  TrendingUp as TrendingUpIcon, Menu, Send, Copy, LogOut, Zap, ChevronRight, Info,
  Bell, Settings, ExternalLink, ArrowUpRight, ArrowDownRight, User, ShieldCheck, Trash2,
  DollarSign, Plus, Shield, Zap as ZapIcon, Globe, RefreshCcw, Rocket, Ticket, Lock, Clock,
  Layers, Trophy, Layout
} from 'lucide-react';
import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MarketState, ViewTab, MarketItem, Side, UserOrder, Trade, OrderRow, PriceData, UserAsset } from './types';
import { analyzeMarket } from './services/geminiService';
import Terminal from './components/Terminal';

// --- MOCK DATA ---
const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: '1',
    name: 'Pokémon 151 Japanese Booster Box',
    category: 'PTCG',
    floor: 185.00,
    change1d: 2.4,
    volume7d: 12400,
    volumeTotal: 450000,
    marketCap: 8500000,
    isTrending: true,
    imageUrl: 'https://vitikaimports.co.za/cdn/shop/files/pokejap151.webp?v=1701803887&width=990'
  },
  {
    id: '2',
    name: 'VSTAR Universe Japanese Booster Box',
    category: 'PTCG',
    floor: 72.50,
    change1d: -1.2,
    volume7d: 8200,
    volumeTotal: 310000,
    marketCap: 4200000,
    isTrending: true,
    imageUrl: 'https://cdn11.bigcommerce.com/s-89ffd/images/stencil/1280x1280/products/119889/432630/4521329373362_b501b208aa29a0ee82b5dfe16b96991e__47893.1669867057.jpg?c=2?imbypass=on'
  },
  {
    id: '3',
    name: 'Evolving Skies English Booster Box',
    category: 'PTCG',
    floor: 680.00,
    change1d: 0.8,
    volume7d: 1500,
    volumeTotal: 120000,
    marketCap: 15200000,
    imageUrl: 'https://packflipps.com/cdn/shop/files/fd8f3024-original.jpg?v=1726515120&width=990'
  },
  {
    id: '4',
    name: 'Shiny Treasure ex Japanese Booster Box',
    category: 'PTCG',
    floor: 45.00,
    change1d: 4.5,
    volume7d: 21000,
    volumeTotal: 180000,
    marketCap: 2100000,
    isTrending: true,
    imageUrl: 'https://k-tcg.com/wp-content/uploads/2023/12/box-logo-2.jpg'
  },
  {
    id: '5',
    name: 'One Piece OP-05 Awakening of the New Era',
    category: 'ONE PIECE OP',
    floor: 145.00,
    change1d: -3.1,
    volume7d: 5400,
    volumeTotal: 88000,
    marketCap: 3500000,
    imageUrl: 'https://product-images.tcgplayer.com/fit-in/437x437/498733.jpg'
  },
];

const MOCK_LAUNCH_PAD_PROJECTS = [
  {
    id: 'lp-1',
    name: 'Pokémon: Surging Sparks Booster Box',
    description: 'The latest Stellar Tera Pokémon ex expansion. Primary offering at MSRP.',
    status: 'LIVE',
    price: 145.00,
    retailPrice: 161.00,
    totalGoalUSD: 500000,
    filledUSD: 342000,
    endsIn: '12:45:10',
    minFlip: 1000,
    imageUrl: 'https://m.media-amazon.com/images/I/91ovYHrKCVL._AC_SL1500_.jpg'
  },
  {
    id: 'lp-2',
    name: 'One Piece: Two Legends [OP-08]',
    description: 'Featuring characters from Skypiea and the Revolutionary Army.',
    status: 'UPCOMING',
    price: 105.00,
    retailPrice: 120.00,
    totalGoalUSD: 800000,
    filledUSD: 0,
    startsIn: '02d 14h',
    minFlip: 5000,
    imageUrl: 'https://m.media-amazon.com/images/I/61au07hWdLL._AC_SL1080_.jpg'
  },
  {
    id: 'lp-3',
    name: 'Weiss Schwarz: Hololive Summer',
    description: 'Highly anticipated reprint of the summer collection.',
    status: 'ENDED',
    price: 65.00,
    retailPrice: 85.00,
    totalGoalUSD: 250000,
    filledUSD: 250000,
    imageUrl: 'https://m.media-amazon.com/images/I/81VcBlIkQUL._AC_SL1500_.jpg'
  }
];

const MOCK_COSTS: Record<string, number> = {
  '1': 155.00,
  '2': 60.00,
  '3': 600.00,
  '4': 40.00,
  '5': 140.00
};

const GENERATE_DEPTH = (basePrice: number, type: 'bid' | 'ask'): OrderRow[] => {
  const rows = Array.from({ length: 6 }).map((_, i) => ({
    price: type === 'ask' ? basePrice + (i * 0.5) : basePrice - (i * 0.5),
    size: Math.floor(Math.random() * 50) + 5,
    total: 0,
    type
  }));
  const sorted = rows.sort((a, b) => type === 'ask' ? a.price - b.price : b.price - a.price);
  let cumulative = 0;
  return sorted.map((row) => {
    cumulative += row.price * row.size;
    return { ...row, total: cumulative };
  });
};

const GENERATE_TRADES = (price: number): Trade[] => {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: Math.random().toString(),
    price: price + (Math.random() * 2 - 1),
    quantity: Math.floor(Math.random() * 20) + 1,
    time: `${i + 1}s ago`,
    side: Math.random() > 0.5 ? 'buy' : 'sell'
  }));
};

const MOCK_CHART_DATA: PriceData[] = [
  { time: '09:00', price: 178, volume: 120 }, { time: '10:00', price: 180, volume: 85 }, { time: '11:00', price: 182, volume: 145 },
  { time: '12:00', price: 179, volume: 210 }, { time: '13:00', price: 185, volume: 110 }, { time: '14:00', price: 188, volume: 165 },
  { time: '15:00', price: 186, volume: 130 }, { time: '16:00', price: 190, volume: 190 }, { time: '17:00', price: 185, volume: 155 },
];

// --- COMPONENTS ---

const PriceTicker: React.FC = () => {
  return (
    <div className="bg-[#0f172a] border-b border-white/5 h-10 overflow-hidden flex items-center shrink-0 z-40">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...MOCK_MARKET_ITEMS, ...MOCK_MARKET_ITEMS].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-3 px-8 border-r border-white/5 group cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-black text-white/40 uppercase italic tracking-tighter group-hover:text-white transition-colors">{item.name}</span>
            <span className="text-[11px] font-black font-mono text-white">${item.floor.toFixed(2)}</span>
            <span className={`text-[9px] font-black flex items-center gap-0.5 ${item.change1d >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {item.change1d >= 0 ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
              {Math.abs(item.change1d)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderBookWidget: React.FC<{ marketState: MarketState }> = ({ marketState }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col w-full">
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5">
        <Activity size={10} /> Live Order
      </span>
      <span className="text-[9px] font-bold text-gray-300 uppercase">{marketState.asset}</span>
    </div>
    <div className="grid grid-cols-2 divide-x divide-gray-100 min-h-[180px]">
      {/* Bids (Left) */}
      <div className="flex flex-col p-2 bg-green-50/10">
        <div className="text-[9px] font-black text-emerald-600 uppercase mb-2 px-1 tracking-widest italic">Buy</div>
        <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-2 px-1">
          <span>Price</span>
          <span>Size</span>
        </div>
        {marketState.orderBook.bids.slice(0, 6).map((bid, i) => (
          <div key={i} className="flex justify-between text-[10px] font-mono py-1 px-1 hover:bg-green-100/30 transition-colors">
            <span className="text-emerald-600 font-bold">${bid.price.toFixed(2)}</span>
            <span className="text-gray-400">{bid.size}</span>
          </div>
        ))}
      </div>
      {/* Asks (Right) */}
      <div className="flex flex-col p-2 bg-red-50/10">
        <div className="text-[9px] font-black text-rose-500 uppercase mb-2 px-1 tracking-widest italic">Sell</div>
        <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-2 px-1">
          <span>Price</span>
          <span>Size</span>
        </div>
        {marketState.orderBook.asks.slice(0, 6).map((ask, i) => (
          <div key={i} className="flex justify-between text-[10px] font-mono py-1 px-1 hover:bg-red-100/30 transition-colors">
            <span className="text-red-500 font-bold">${ask.price.toFixed(2)}</span>
            <span className="text-gray-400">{ask.size}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ActiveOrdersWidget: React.FC<{ activeOrders: UserOrder[], onCancel: (id: string) => void }> = ({ activeOrders, onCancel }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col w-full">
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5">
        <History size={10} /> Active Orders
      </span>
      <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">{activeOrders.length}</span>
    </div>
    <div className="overflow-y-auto max-h-[300px]">
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 opacity-20">
          <Package size={20} />
          <span className="text-[8px] font-black uppercase mt-1">No Open Orders</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {activeOrders.map(order => (
            <div key={order.id} className="p-3 hover:bg-gray-50 transition-colors flex justify-between items-center group">
              <div className="flex flex-col gap-0.5">
                <span className={`text-[8px] font-black uppercase tracking-widest ${order.type === 'bid' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {order.type === 'bid' ? 'Buy Limit' : 'Sell Limit'}
                </span>
                <span className="text-xs font-black font-mono text-slate-800">${order.price.toFixed(2)} <span className="text-[10px] text-slate-400">x{order.quantity}</span></span>
              </div>
              <button
                onClick={() => onCancel(order.id)}
                className="p-1.5 text-gray-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const HomeView: React.FC<{
  onSelect: (item: MarketItem) => void;
  onTradeNow: () => void;
  onGoToLaunchPad: () => void;
}> = ({ onSelect, onTradeNow, onGoToLaunchPad }) => (
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500">
    {/* Hero Banner */}
    <div className="mb-12 md:mb-16 relative overflow-hidden bg-[#1e2b38] rounded-3xl p-6 md:p-12 text-white shadow-2xl border border-white/5 group">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-600/10 blur-[120px] rounded-full"></div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <Sparkles size={14} className="text-green-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Featured Collections</span>
          </div>
          <h2 className="text-xl md:text-5xl font-black italic uppercase tracking-tighter leading-[1.15] md:leading-tight">
            Turn Cardboard <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"> into Liquid Capital.</span>
          </h2>
          <p className="text-gray-400 font-bold text-xs md:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed italic">
            Our T+0 settlement engine removes the physical burden of trading. Own the underlying value, redeem whenever you're ready for delivery.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 md:pt-4">
            <button
              onClick={onTradeNow}
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-[#1e2b38] rounded-xl font-black uppercase italic text-xs md:text-sm tracking-widest hover:bg-green-400 transition-all flex items-center gap-2"
            >
              Trade Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-3 md:gap-4">
          {MOCK_MARKET_ITEMS.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`relative p-3 md:p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-green-500/50 transition-all cursor-pointer group/card ${idx % 2 !== 0 ? 'translate-y-2 md:translate-y-8' : ''}`}
            >
              <div className="absolute top-4 right-4 text-white/20 group-hover/card:text-green-400 transition-colors hidden md:block">
                <TrendingUp size={24} />
              </div>
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg overflow-hidden mb-2 md:mb-4 group-hover/card:scale-110 transition-transform shadow-lg border border-white/10 bg-white mx-auto md:mx-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10"><Package size={20} className="text-gray-400" /></div>
                )}
              </div>
              <h4 className="text-[10px] md:text-sm font-black uppercase italic tracking-tighter mb-1 line-clamp-1">{item.name}</h4>
              <div className="flex justify-between items-end">
                <span className="font-mono font-black text-sm md:text-lg text-white">${item.floor.toFixed(0)}</span>
                <span className={`text-[8px] md:text-[9px] font-black ${item.change1d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change1d > 0 ? '+' : ''}{item.change1d}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Platform Introduction Section */}
    <div className="mb-24 space-y-12 md:space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3 md:space-y-4">
        <h3 className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic">The Future of Collectibles</h3>
        <h2 className="text-xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight px-4 md:px-0">
          Modernizing the Sealed <br /> Assets Ecosystem
        </h2>
        <div className="w-10 md:w-12 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-2 md:px-0">
        {[
          {
            icon: <RefreshCcw size={28} className="text-blue-500" />,
            title: "Zero Friction Trading",
            description: "No packing, no shipping labels, no mail delays. Flip box value instantly without handling physical products."
          },
          {
            icon: <ShieldCheck size={28} className="text-emerald-500" />,
            title: "Physically Backed",
            description: "Every digital unit is 1:1 backed by real booster boxes held in our high-security, climate-controlled vault."
          },
          {
            icon: <Truck size={28} className="text-orange-500" />,
            title: "Redeem Anytime",
            description: "Own the digital asset? Burn it to initiate physical delivery to your doorstep anywhere in the world."
          },
          {
            icon: <ZapIcon size={28} className="text-yellow-500" />,
            title: "T+0 Settlements",
            description: "Sell instantly into deep liquidity pools. No 21-day holding periods or payment disputes common on eBay."
          }
        ].map((feature, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl hover:shadow-xl hover:border-blue-500/20 transition-all group text-center md:text-left">
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-xl inline-block group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              {feature.icon}
            </div>
            <h4 className="text-base md:text-lg font-black uppercase italic tracking-tighter mb-2 md:mb-3 text-slate-900 leading-tight">
              {feature.title}
            </h4>
            <p className="text-gray-500 text-[11px] md:text-sm font-bold uppercase italic opacity-70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-6 md:p-12 flex flex-col items-center text-center overflow-hidden relative mx-2 md:mx-0">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity hidden md:block">
          <Globe size={300} strokeWidth={0.5} />
        </div>
        <div className="max-w-3xl space-y-4 md:space-y-6 relative z-10">
          <h3 className="text-lg md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
            Bridging Physical Utility <br className="hidden md:block" /> with Digital Speed
          </h3>
          <p className="text-gray-600 text-xs md:text-base font-bold italic leading-relaxed">
            Sealed Flip acts as a clearing house for physical booster boxes. By digitizing redemption rights, we enable a global order book that never sleeps, providing deep liquidity for assets that were previously stagnant in closets and warehouses.
          </p>
          <div className="flex flex-row items-center justify-center gap-6 md:gap-16 pt-2 md:pt-4">
            <div className="text-center">
              <span className="block text-xl md:text-3xl font-black text-blue-600 font-mono italic">0%</span>
              <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">SALES TAX</span>
            </div>
            <div className="w-[1px] h-8 md:h-10 bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-xl md:text-3xl font-black text-blue-600 font-mono italic">INSTANT</span>
              <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Ownership Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Launch Pad Explanatory Section (Bottom) */}
    <div className="mb-24 relative overflow-hidden bg-white border border-gray-200 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-16 shadow-sm group mx-2 md:mx-0">
      <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700 hidden md:block">
        <Rocket size={400} />
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 relative z-10">
        <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <Rocket size={14} className="text-blue-600 md:w-4 md:h-4" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Primary Market Access</span>
          </div>
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-5xl font-black italic uppercase tracking-tighter leading-[1] text-slate-900">
              Introducing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">The Launch Pad.</span>
            </h2>
            <h3 className="text-xs md:text-2xl font-black italic uppercase tracking-tighter text-slate-500">
              Grab the Drop at Original MSRP.
            </h3>
          </div>
          <p className="text-gray-500 font-bold text-[11px] md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed italic">
            Stop fighting bots and scalpers. The Launch Pad grants you direct access to primary inventory drops at original MSRP. No secondary markups.
          </p>
          <div className="space-y-4 md:space-y-6 pt-2">
            {[
              { icon: <Ticket className="text-blue-500" />, title: "Lottery Participation", text: "Hold FLIP tokens to earn lottery tickets for exclusive drop allocations." },
              { icon: <Lock className="text-indigo-500" />, title: "Fair Distribution", text: "Verified primary inventory direct from wholesalers, distributed fairly to our community." },
              { icon: <Trophy className="text-emerald-500" />, title: "Guaranteed MSRP", text: "Purchase at the base retail price before secondary market inflation begins." }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start text-left max-w-md mx-auto lg:mx-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">{step.icon}</div>
                <div>
                  <h4 className="text-[11px] md:text-sm font-black uppercase italic text-slate-800 leading-tight">{step.title}</h4>
                  <p className="text-[9px] md:text-xs font-bold text-slate-400 italic uppercase leading-tight opacity-70 mt-1">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onGoToLaunchPad}
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-xs md:text-sm tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95"
          >
            Explore Drops <ArrowRight size={20} />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 w-full">
          <div className="space-y-3 md:space-y-4 pt-4 md:pt-12">
            <div className="bg-blue-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-blue-100 shadow-inner">
              <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1 md:mb-2">Total Funded</span>
              <span className="text-sm md:text-2xl font-black font-mono text-blue-900 italic">$1.4M+</span>
            </div>
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 md:mb-2">Drops Live</span>
              <span className="text-sm md:text-2xl font-black font-mono text-slate-800 italic">42</span>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="bg-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-100">
              <span className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1 md:mb-2">Avg. Saving</span>
              <span className="text-sm md:text-2xl font-black font-mono text-indigo-900 italic">28%</span>
            </div>
            <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-100">
              <span className="text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1 md:mb-2">Users</span>
              <span className="text-sm md:text-2xl font-black font-mono text-emerald-900 italic">8.2k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ParticipateModal: React.FC<{
  project: any;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  flipBalance: number;
}> = ({ project, onClose, onConfirm, flipBalance }) => {
  const [amount, setAmount] = useState<string>("");
  const isValid = flipBalance >= project.minFlip && parseFloat(amount) > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase italic tracking-tight">Participate Drop</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-white border rounded overflow-hidden p-1">
              <img src={project.imageUrl} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase italic tracking-tighter leading-tight">{project.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Price: ${project.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter USD amount"
                className="w-full bg-gray-50 border border-gray-200 p-4 pl-12 rounded-2xl font-black font-mono text-xl outline-none"
              />
            </div>
          </div>
          <div className="p-4 rounded-2xl space-y-3 bg-blue-50">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Required FLIP</span>
              <span className="text-xs font-black font-mono text-blue-900">{project.minFlip} FLIP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Your Balance</span>
              <span className={`text-xs font-black font-mono ${flipBalance >= project.minFlip ? 'text-emerald-600' : 'text-rose-600'}`}>{flipBalance} FLIP</span>
            </div>
          </div>
          {flipBalance < project.minFlip && (
            <p className="text-[9px] font-black text-rose-500 uppercase text-center">Insufficient FLIP balance for this tier.</p>
          )}
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 font-black uppercase italic text-xs tracking-widest text-gray-500">Cancel</button>
          <button
            disabled={!isValid}
            onClick={() => onConfirm(parseFloat(amount))}
            className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase italic text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            Confirm Pledge
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Launch Pad View component
const LaunchPadView: React.FC<{ flipBalance: number }> = ({ flipBalance }) => {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleParticipate = (project: any) => {
    setSelectedProject(project);
  };

  const handleConfirmParticipation = (amount: number) => {
    alert(`Successfully pledged $${amount.toLocaleString()} to ${selectedProject.name}. Initial Lottery ticket issued.`);
    setSelectedProject(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500">
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0f172a] text-white p-6 md:p-8 rounded-3xl overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 hidden md:block">
          <Rocket size={200} />
        </div>
        <div className="space-y-4 relative z-10 w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full">
            <Rocket size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Launch Pad Offerings</span>
          </div>
          <h2 className="text-xl md:text-5xl font-black italic uppercase tracking-tighter leading-[1.15] md:leading-tight">
            Grab the Drop <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">at Original MSRP.</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-base font-bold italic leading-relaxed max-w-lg">
            Hold FLIP tokens to qualify for early access lottery.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl backdrop-blur-md relative z-10 w-full md:w-auto min-w-[240px]">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">My Staking Intel</span>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black font-mono italic">{flipBalance.toLocaleString()}</span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">FLIP HELD</span>
            </div>
            <div className="p-2 md:p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <Ticket size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
          <div className="text-[9px] font-black uppercase text-slate-400 leading-tight">
            Odds Factor: <span className="text-white">x{(1 + flipBalance / 1000).toFixed(1)}</span> <br />
            Staked since: <span className="text-white">12 DAYS AGO</span>
          </div>
        </div>
      </div>

      <div className="space-y-10 md:space-y-12">
        <div className="flex flex-row items-center justify-between gap-4 px-1 md:px-0">
          <h3 className="text-base md:text-xl font-black uppercase italic tracking-tighter text-slate-900">Featured Offerings</h3>
          <div className="flex gap-1 md:gap-2">
            {['ALL', 'ACTIVE'].map(f => (
              <button key={f} className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${f === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-1 md:px-0">
          {MOCK_LAUNCH_PAD_PROJECTS.map(project => {
            const isLive = project.status === 'LIVE';
            const isUpcoming = project.status === 'UPCOMING';
            const isEnded = project.status === 'ENDED';
            const progress = (project.filledUSD / project.totalGoalUSD) * 100;

            return (
              <div key={project.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="relative aspect-[4/3] bg-gray-100 p-6 md:p-8 flex items-center justify-center overflow-hidden">
                  <img src={project.imageUrl} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isLive ? 'bg-emerald-100 text-emerald-700' :
                      isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {isLive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                      {project.status}
                    </span>
                  </div>
                  {isLive && (
                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Clock size={10} className="text-blue-400" />
                      <span className="text-[9px] md:text-[10px] font-black font-mono uppercase">{project.endsIn}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col space-y-5 md:space-y-6">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-tight mb-2 line-clamp-1">{project.name}</h4>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase italic leading-relaxed">{project.description}</p>
                  </div>

                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase block mb-1">MSRP</span>
                    <span className="text-base md:text-lg font-black font-mono text-slate-900">${project.price.toFixed(2)}</span>
                  </div>

                  {(isLive || isEnded) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase italic tracking-widest text-slate-500">
                        <span className="truncate mr-2">Funded: ${project.filledUSD.toLocaleString()}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 md:pt-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase block">Requirements</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Lock size={10} className="text-blue-500" />
                        <span className="text-[10px] md:text-xs font-black font-mono text-slate-700">{project.minFlip} <span className="text-[8px] md:text-[9px] text-slate-400">FLIP</span></span>
                      </div>
                    </div>
                    <button
                      onClick={() => isLive && handleParticipate(project)}
                      className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-black uppercase italic text-[10px] md:text-xs tracking-[0.15em] shadow-lg transition-all ${isLive ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-95' :
                        isUpcoming ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                          'bg-slate-900 text-white opacity-40'
                        }`}
                    >
                      {isLive ? 'PARTICIPATE' : isUpcoming ? project.startsIn : 'ENDED'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProject && (
        <ParticipateModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onConfirm={handleConfirmParticipation}
          flipBalance={flipBalance}
        />
      )}
    </div>
  );
};

const MarketView: React.FC<{
  onSelect: (item: MarketItem) => void;
  marketState: MarketState;
}> = ({ onSelect, marketState }) => (
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500">
    <div className="mb-6 md:mb-8 flex flex-row items-center justify-between">
      <div>
        <h2 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Market Dashboard</h2>
        <h3 className="text-base md:text-2xl font-extrabold text-[#2c3e50] tracking-tight italic uppercase">Collectible Asset</h3>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black text-green-600 bg-green-50 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
        <Activity size={10} className="animate-pulse" />
        live
      </div>
    </div>

    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 space-y-6">
        {/* Desktop Table */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                <th className="px-5 md:px-8 py-3 md:py-5">Asset Class</th>
                <th className="px-3 md:px-6 py-3 md:py-5">Live Index</th>
                <th className="px-3 md:px-6 py-3 md:py-5">24h Change</th>
                <th className="px-5 md:px-8 py-3 md:py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {MOCK_MARKET_ITEMS.map(item => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group ${marketState.asset === item.name ? 'bg-blue-50/30' : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <td className="px-5 md:px-8 py-3 md:py-6 flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-300 shrink-0 overflow-hidden shadow-inner">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Package size={18} />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-900 block group-hover:text-blue-600 transition-colors text-[11px] md:text-sm leading-tight font-black uppercase italic tracking-tighter truncate max-w-[120px] md:max-w-none">{item.name}</span>
                      <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase truncate">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-6 font-mono text-gray-900 text-xs md:text-base">
                    ${item.floor.toFixed(2)}
                  </td>
                  <td className={`px-3 md:px-6 py-3 md:py-6 font-mono text-xs md:text-sm ${item.change1d > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {item.change1d > 0 ? '+' : ''}{item.change1d}%
                  </td>
                  <td className="px-5 md:px-8 py-3 md:py-6 text-right">
                    <button className="px-3 md:px-6 py-1.5 md:py-2 bg-slate-900 text-white rounded font-black text-[8px] md:text-[10px] uppercase italic tracking-widest group-hover:bg-blue-600 transition-all shadow-sm">
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Grid */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {MOCK_MARKET_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg p-1">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <Package />}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{item.category}</span>
                    <h4 className="text-xs font-black uppercase italic text-gray-900 line-clamp-1">{item.name}</h4>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black font-mono ${item.change1d >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.change1d >= 0 ? '+' : ''}{item.change1d}%
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Floor Price</span>
                  <span className="text-lg font-black font-mono text-slate-800">${item.floor.toFixed(2)}</span>
                </div>
                <button className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase italic tracking-widest rounded-lg">
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 md:p-6 bg-blue-600 rounded-2xl text-white flex flex-row items-center gap-4 md:gap-6 shadow-xl shadow-blue-600/20">
          <div className="p-3 md:p-4 bg-white/10 rounded-xl shrink-0">
            <ShieldCheck size={24} className="md:w-8 md:h-8" />
          </div>
          <div className="flex-1 space-y-0.5 md:space-y-1">
            <h4 className="text-sm md:text-lg font-black uppercase italic tracking-tighter leading-tight">Verified Vault Assets</h4>
            <p className="text-[9px] md:text-xs font-bold text-blue-100 opacity-80 leading-tight uppercase">Every digital unit is backed 1:1 by physical supply.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TerminalView: React.FC<{
  selectedItem: MarketItem;
  marketState: MarketState;
  recentTrades: Trade[];
  side: Side;
  setSide: (s: Side) => void;
  orderPrice: string;
  setOrderPrice: (p: string) => void;
  tradeQty: string;
  setTradeQty: (q: string) => void;
  handlePlaceOrder: () => void;
  activeOrders: UserOrder[];
  cancelOrder: (id: string) => void;
  handleRunAnalysis: () => void;
  isAnalyzing: boolean;
  analysis: string | null;
  currentBalance: number;
  avgCost: number;
  onSelectAsset: (item: MarketItem) => void;
  isProMode: boolean;
  setIsProMode: (pro: boolean) => void;
}> = ({
  selectedItem, marketState, recentTrades, side, setSide,
  orderPrice, setOrderPrice, tradeQty, setTradeQty,
  handlePlaceOrder, activeOrders, cancelOrder,
  handleRunAnalysis, isAnalyzing, analysis, currentBalance, avgCost,
  onSelectAsset, isProMode, setIsProMode
}) => {
    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsAssetDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalValue = useMemo(() => {
      const p = parseFloat(orderPrice) || 0;
      const q = parseInt(tradeQty) || 0;
      return p * q;
    }, [orderPrice, tradeQty]);

    // If Pro Mode is on, we render the professional terminal component
    if (isProMode) {
      const userAssetData: UserAsset = {
        id: selectedItem.id,
        name: selectedItem.name,
        balance: currentBalance,
        avgCost: avgCost,
        floor: selectedItem.floor,
        pnl: (selectedItem.floor - avgCost) * currentBalance
      };

      return (
        <div className="h-[calc(100vh-104px)] md:h-[calc(100vh-104px)] bg-[#0b0e11] overflow-hidden flex flex-col">
          <div className="h-10 bg-[#15191e] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Professional Terminal</span>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white italic uppercase">{selectedItem.name}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">${selectedItem.floor.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setIsProMode(false)}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all"
            >
              <RefreshCcw size={12} /> Standard View
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Terminal state={marketState} userAsset={userAssetData} />
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500 grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
            <div className="flex items-center gap-2 md:gap-3 relative" ref={dropdownRef}>
              <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded shrink-0">SEALED FLIP</span>
              <div
                onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                className="flex items-center gap-2 md:gap-3 cursor-pointer group/trigger hover:bg-gray-100/50 p-1 px-2 rounded-lg transition-all min-w-0"
              >
                {selectedItem.imageUrl && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded border border-gray-200 overflow-hidden shrink-0 shadow-sm bg-white">
                    <img src={selectedItem.imageUrl} alt="" className="w-full h-full object-contain p-0.5" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                  <h2 className="text-sm md:text-xl font-black text-[#2c3e50] uppercase italic tracking-tight truncate max-w-[140px] md:max-w-none">{selectedItem.name}</h2>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 shrink-0 ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {isAssetDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-white/5 bg-[#0f1216]">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Trade Pair</span>
                  </div>
                  <div className="max-h-[350px] md:max-h-[400px] overflow-y-auto">
                    {MOCK_MARKET_ITEMS.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectAsset(item);
                          setIsAssetDropdownOpen(false);
                        }}
                        className={`p-3 md:p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors ${selectedItem.id === item.id ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-white overflow-hidden p-0.5 shrink-0">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] md:text-[11px] font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-1">{item.name}</span>
                            <span className={`text-[8px] md:text-[9px] font-bold ${item.change1d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {item.change1d >= 0 ? '▲' : '▼'} {Math.abs(item.change1d)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] md:text-[12px] font-black font-mono text-white">${item.floor.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button
                onClick={() => setIsProMode(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#0f172a] text-white rounded-lg text-[10px] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-600/10"
              >
                <Layout size={14} /> PRO MODE
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 card-shadow">
            <div className="flex flex-row justify-between items-center gap-4 mb-4 md:mb-6">
              <h3 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUpIcon size={12} /> Market Chart
              </h3>
              <div className="flex gap-1 bg-gray-50 p-1 rounded-lg shrink-0">
                {['1H', '1D', '1W'].map(tf => (
                  <button key={tf} className={`px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black rounded uppercase tracking-widest transition-all ${tf === '1H' ? 'bg-[#2c3e50] text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>{tf}</button>
                ))}
              </div>
            </div>
            <div className="h-40 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2c3e50" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2c3e50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#cbd5e0" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="price" orientation="right" stroke="#cbd5e0" fontSize={9} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="volume" orientation="left" stroke="transparent" axisLine={false} tickLine={false} domain={[0, (max: number) => max * 4]} />
                  <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }} cursor={{ stroke: '#f0f0f0', strokeWidth: 1 }} />
                  <Bar yAxisId="volume" dataKey="volume" fill="#cbd5e0" opacity={0.3} barSize={15} radius={[2, 2, 0, 0]} />
                  <Area yAxisId="price" type="monotone" dataKey="price" stroke="#2c3e50" strokeWidth={2} fill="url(#colorPrice)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden card-shadow">
            <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <History size={12} /> Last Trades
              </h3>
              <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase italic">Vol: 1.4k</span>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTrades.slice(0, 5).map(trade => (
                <div key={trade.id} className="px-4 md:px-6 py-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-3 md:gap-6">
                    <span className={`font-mono font-bold text-xs ${trade.side === 'buy' ? 'text-green-600' : 'text-red-500'}`}>
                      ${trade.price.toFixed(2)}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">x{trade.quantity}</span>
                  </div>
                  <span className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase shrink-0">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <OrderBookWidget marketState={marketState} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden card-shadow">
              <div className="flex p-1 bg-gray-100">
                <button onClick={() => setSide('buy')} className={`flex-1 py-2.5 md:py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all rounded ${side === 'buy' ? 'bg-[#00a651] text-white' : 'text-gray-400'}`}>Buy</button>
                <button onClick={() => setSide('sell')} className={`flex-1 py-2.5 md:py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all rounded ${side === 'sell' ? 'bg-[#E65100] text-white' : 'text-gray-400'}`}>Sell</button>
              </div>
              <div className="p-4 md:p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Price ($)</label>
                    <input type="number" value={orderPrice} onChange={(e) => setOrderPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg font-black font-mono text-lg md:text-xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                    <input type="number" value={tradeQty} onChange={(e) => setTradeQty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg font-black font-mono text-lg md:text-xl outline-none" />
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      <span>Order Value</span>
                      <span className="text-gray-900 font-mono text-xs md:text-sm">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button onClick={handlePlaceOrder} className={`w-full py-4 rounded-lg font-black italic text-lg md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all ${side === 'buy' ? 'bg-[#00a651] text-white' : 'bg-[#E65100] text-white'}`}>
                    {side === 'buy' ? 'Buy' : 'Sell'}
                  </button>
                </div>
              </div>
            </div>

            {currentBalance > 0 && (
              <div className="bg-[#1a1f26] border border-white/5 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-right-4">
                <div className="px-4 md:px-6 py-2.5 md:py-3 bg-[#0f1216] border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Package size={12} /> Your Position
                  </h3>
                </div>
                <div className="p-4 md:p-5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest block">Holdings</span>
                    <span className="text-lg md:text-2xl font-black font-mono text-white italic">{currentBalance} <span className="text-[9px] text-gray-500 not-italic">BOX</span></span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest block">Avg Cost</span>
                    <span className="text-base md:text-lg font-black font-mono text-white">${avgCost > 0 ? avgCost.toFixed(2) : '--.--'}</span>
                  </div>
                </div>
              </div>
            )}

            <ActiveOrdersWidget activeOrders={activeOrders} onCancel={cancelOrder} />

            <div onClick={handleRunAnalysis} className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 transition-all card-shadow">
              <span className="text-[10px] font-black text-gray-900 uppercase italic tracking-widest flex items-center gap-2">
                <Sparkles size={16} className={`text-blue-500 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Market Intel AI
              </span>
              {analysis && <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase italic line-clamp-3 px-1">{analysis}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

const PortfolioView: React.FC<{
  userHoldings: Record<string, number>;
  portfolioValue: number;
  cashBalance: number;
  flipBalance: number;
  totalAssets: number;
  netPnL: number;
  onSellRequest: (item: MarketItem) => void;
  onRedeemRequest: (item: MarketItem, qty: number) => void;
  onTransferRequest: (item: MarketItem | 'USD' | 'FLIP', qty: number) => void;
  onTopUpRequest: (target: 'USD' | 'FLIP') => void;
}> = ({ userHoldings, portfolioValue, cashBalance, flipBalance, totalAssets, netPnL, onSellRequest, onRedeemRequest, onTransferRequest, onTopUpRequest }) => (
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 border-b border-gray-200 pb-6 gap-6">
      <div>
        <h2 className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Sealed Flip Vault</h2>
        <h1 className="text-xl md:text-3xl font-extrabold text-[#2c3e50] tracking-tight italic uppercase">Vault Inventory</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto">
        <div className="text-left md:text-right md:px-4">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Assets</span>
          <span className="text-lg md:text-2xl font-black font-mono text-gray-900">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="text-right md:px-4 md:border-l border-gray-100">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Net P&L</span>
          <span className={`text-lg md:text-2xl font-black font-mono ${netPnL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {netPnL >= 0 ? '+' : ''}${Math.abs(netPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-left md:text-right md:px-4 md:border-l border-gray-100 hidden sm:block">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Vault Value</span>
          <span className="text-lg md:text-2xl font-black font-mono text-gray-900">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="text-right md:px-4 md:border-l border-gray-100 hidden sm:block">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Cash Balance</span>
          <span className="text-lg md:text-2xl font-black font-mono text-gray-900">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden card-shadow">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-[9px] md:text-[10px] font-black text-gray-400 uppercase border-b border-gray-200">
              <th className="px-5 md:px-8 py-4 md:py-5">Asset</th>
              <th className="px-4 md:px-6 py-4 md:py-5">Qty</th>
              <th className="px-4 md:px-6 py-4 md:py-5">Avg Cost</th>
              <th className="px-4 md:px-6 py-4 md:py-5">Live Price</th>
              <th className="px-4 md:px-6 py-4 md:py-5">PNL</th>
              <th className="px-5 md:px-8 py-4 md:py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            {/* USD Asset Row */}
            <tr className="border-b border-gray-50 bg-blue-50/20 hover:bg-blue-50/40 transition-colors">
              <td className="px-5 md:px-8 py-4 md:py-6 flex items-center gap-4">
                <div className="w-10 h-10 border rounded p-0.5 overflow-hidden shadow-sm shrink-0 bg-white flex items-center justify-center text-blue-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <span className="text-[11px] md:text-xs font-black uppercase italic tracking-tighter leading-tight">USD</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-900 italic text-xs md:text-sm">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-400 text-xs">$1.00</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-900 text-xs md:text-sm">$1.00</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-400 text-xs">$0.00</td>
              <td className="px-5 md:px-8 py-4 md:py-6 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onTopUpRequest('USD')} className="p-1.5 md:p-2 border rounded border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Recharge USD">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => onTransferRequest('USD', cashBalance)} className="p-1.5 md:p-2 border rounded border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Withdraw USD">
                    <Send size={12} />
                  </button>
                </div>
              </td>
            </tr>

            {/* FLIP Asset Row */}
            <tr className="border-b border-gray-50 bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors">
              <td className="px-5 md:px-8 py-4 md:py-6 flex items-center gap-4">
                <div className="w-10 h-10 border rounded p-0.5 overflow-hidden shadow-sm shrink-0 bg-white flex items-center justify-center text-indigo-600">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <span className="text-[11px] md:text-xs font-black uppercase italic tracking-tighter leading-tight">FLIP</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-900 italic text-xs md:text-sm">{flipBalance.toLocaleString()}</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-400 text-xs">$1.00</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-900 text-xs md:text-sm">$1.20</td>
              <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-emerald-600 text-xs">+$250.00</td>
              <td className="px-5 md:px-8 py-4 md:py-6 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onTopUpRequest('FLIP')} className="p-1.5 md:p-2 border rounded border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Recharge FLIP">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => onTransferRequest('FLIP', flipBalance)} className="p-1.5 md:p-2 border rounded border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Transfer FLIP">
                    <Send size={12} />
                  </button>
                </div>
              </td>
            </tr>

            {/* Collectible Assets */}
            {Object.entries(userHoldings).map(([id, qty]) => {
              const item = MOCK_MARKET_ITEMS.find(m => m.id === id);
              if (!item || Number(qty) === 0) return null;
              const avgCostPrice = MOCK_COSTS[id] || 0;
              const currentPNL = (item.floor - avgCostPrice) * Number(qty);
              return (
                <tr key={id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 md:px-8 py-4 md:py-6 flex items-center gap-4">
                    <div className="w-10 h-10 border rounded p-0.5 overflow-hidden shadow-sm shrink-0">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] md:text-xs font-black uppercase italic tracking-tighter leading-tight line-clamp-2 max-w-[120px] md:max-w-none">{item.name}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-600 italic text-xs md:text-sm">{qty} BOX</td>
                  <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-400 text-xs">${avgCostPrice.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-4 md:py-6 font-mono text-gray-900 text-xs md:text-sm">${item.floor.toFixed(2)}</td>
                  <td className={`px-4 md:px-6 py-4 md:py-6 font-mono text-xs md:text-sm ${currentPNL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {currentPNL >= 0 ? '+' : ''}${currentPNL.toFixed(2)}
                  </td>
                  <td className="px-5 md:px-8 py-4 md:py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onRedeemRequest(item, Number(qty))} className="p-1.5 md:p-2 border rounded border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Redeem Physical">
                        <Truck size={12} />
                      </button>
                      <button onClick={() => onTransferRequest(item, Number(qty))} className="p-1.5 md:p-2 border rounded border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Transfer Asset">
                        <Send size={12} />
                      </button>
                      <button onClick={() => onSellRequest(item)} className="px-2 md:px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700 rounded text-[9px] md:text-[10px] font-black uppercase italic hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm shrink-0">
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Asset List */}
      <div className="md:hidden flex flex-col divide-y divide-gray-100">
        {/* USD Card on Mobile */}
        <div className="p-4 bg-blue-50/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border rounded bg-white flex items-center justify-center text-blue-600 shadow-sm"><DollarSign size={20} /></div>
            <div>
              <span className="font-black uppercase italic text-xs">USD Balance</span>
              <div className="font-mono font-black text-lg text-slate-900">${cashBalance.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onTopUpRequest('USD')} className="flex-1 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1"><Plus size={10} /> Deposit</button>
            <button onClick={() => onTransferRequest('USD', cashBalance)} className="flex-1 py-2 bg-white border border-gray-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1"><Send size={10} /> Withdraw</button>
          </div>
        </div>

        {/* FLIP Card on Mobile */}
        <div className="p-4 bg-indigo-50/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border rounded bg-white flex items-center justify-center text-indigo-600 shadow-sm"><Zap size={20} fill="currentColor" /></div>
            <div>
              <span className="font-black uppercase italic text-xs">FLIP Token</span>
              <div className="font-mono font-black text-lg text-slate-900">{flipBalance.toLocaleString()} <span className="text-xs text-gray-400">FLIP</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onTopUpRequest('FLIP')} className="flex-1 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1"><Plus size={10} /> Buy</button>
            <button onClick={() => onTransferRequest('FLIP', flipBalance)} className="flex-1 py-2 bg-white border border-gray-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1"><Send size={10} /> Transfer</button>
          </div>
        </div>

        {/* Collectible Cards Mobile */}
        {Object.entries(userHoldings).map(([id, qty]) => {
          const item = MOCK_MARKET_ITEMS.find(m => m.id === id);
          if (!item || Number(qty) === 0) return null;
          const avgCostPrice = MOCK_COSTS[id] || 0;
          const currentPNL = (item.floor - avgCostPrice) * Number(qty);
          return (
            <div key={id} className="p-4 bg-white/50">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 border bg-white rounded p-1 shrink-0"><img src={item.imageUrl} className="w-full h-full object-contain" /></div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">{item.name}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono font-black text-xl italic">{qty} BOX</span>
                    <span className={`text-[10px] font-bold ${currentPNL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{currentPNL >= 0 ? '+' : ''}${currentPNL.toFixed(0)} PNL</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onRedeemRequest(item, Number(qty))} className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-600/20">Redeem</button>
                <button onClick={() => onSellRequest(item)} className="px-4 py-2 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Sell</button>
                <button onClick={() => onTransferRequest(item, Number(qty))} className="px-3 py-2 border border-slate-200 text-slate-400 rounded-lg hover:text-slate-800"><Send size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// --- MODAL COMPONENTS ---

const RedeemModal: React.FC<{
  item: MarketItem;
  onClose: () => void;
  onConfirm: (qty: number) => void;
  maxQty: number;
}> = ({ item, onClose, onConfirm, maxQty }) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase italic tracking-tight">Redeem Physical</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-white border rounded overflow-hidden p-1">
              <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase italic tracking-tighter leading-tight">{item.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Available: {maxQty} BOX</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity to redeem</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-black font-mono text-xl outline-none"
            />
          </div>
          <p className="text-[10px] font-bold text-blue-600 bg-blue-50 p-4 rounded-xl leading-relaxed uppercase">
            Redeeming will remove the digital asset from your vault and initiate physical shipping. Our logistics team will contact you for delivery details.
          </p>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-black uppercase italic text-xs tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <button
            onClick={() => onConfirm(qty)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase italic text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg"
          >
            Confirm Redemption
          </button>
        </div>
      </div>
    </div>
  );
};

const TransferModal: React.FC<{
  item: MarketItem | 'USD' | 'FLIP';
  onClose: () => void;
  onConfirm: (qty: number, address: string) => void;
  maxQty: number;
}> = ({ item, onClose, onConfirm, maxQty }) => {
  const [qty, setQty] = useState(1);
  const [addr, setAddr] = useState("");
  const isUsd = item === 'USD';
  const isFlip = item === 'FLIP';
  const isAsset = !isUsd && !isFlip;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase italic tracking-tight">{isUsd ? 'Withdraw USD' : isFlip ? 'Transfer FLIP' : 'Transfer Asset'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity {isUsd ? '($)' : isFlip ? '(FLIP)' : ''}</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-black font-mono text-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Wallet Address</label>
              <input
                type="text"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold font-mono text-sm outline-none"
              />
            </div>
          </div>
          <p className={`text-[10px] font-bold ${isUsd ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'} p-4 rounded-xl leading-relaxed uppercase`}>
            {isUsd ? "Withdrawals are processed immediately to your connected Web3 wallet. Base currency settlement is T+0." : isFlip ? "FLIP transfers are processed via standard Web3 protocol. Gas fees may apply on-chain." : "Transfers are instant and permanent. Ensure the recipient's address is correct as this action cannot be undone."}
          </p>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-black uppercase italic text-xs tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <button
            disabled={!addr}
            onClick={() => onConfirm(qty, addr)}
            className={`flex-1 py-3 ${isUsd ? 'bg-blue-600' : 'bg-emerald-600'} text-white rounded-xl font-black uppercase italic text-xs tracking-widest hover:opacity-90 transition-all shadow-lg disabled:opacity-50`}
          >
            Confirm {isUsd ? 'Withdrawal' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TopUpModal: React.FC<{
  target: 'USD' | 'FLIP';
  onClose: () => void;
  onConfirm: (amount: number) => void;
  currentBalance: number;
}> = ({ target, onClose, onConfirm, currentBalance }) => {
  const [amount, setAmount] = useState<string>("100");
  const isUsd = target === 'USD';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase italic tracking-tight">Top Up {target}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-white border rounded shadow-sm flex items-center justify-center text-blue-600">
              {isUsd ? <DollarSign size={24} /> : <Zap size={24} fill="currentColor" />}
            </div>
            <div>
              <h4 className="font-black text-sm uppercase italic tracking-tighter leading-tight">{target} Balance</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Current: {isUsd ? '$' : ''}{currentBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Add</label>
            <div className="relative">
              {isUsd && <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-gray-50 border border-gray-200 p-4 ${isUsd ? 'pl-12' : 'px-4'} rounded-xl font-black font-mono text-xl outline-none`}
              />
            </div>
          </div>
          <p className="text-[10px] font-bold text-blue-600 bg-blue-50 p-4 rounded-xl leading-relaxed uppercase">
            {isUsd ? "Funds will be debited from your connected Web3 wallet or bank account via our secure payment gateway." : "FLIP tokens will be minted to your vault address upon receipt of collateral."}
          </p>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-black uppercase italic text-xs tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <button
            onClick={() => onConfirm(parseFloat(amount) || 0)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase italic text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg"
          >
            Confirm Top Up
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [selectedItem, setSelectedItem] = useState<MarketItem>(MOCK_MARKET_ITEMS[0]);
  const [side, setSide] = useState<Side>('buy');
  const [orderPrice, setOrderPrice] = useState<string>("185.00");
  const [tradeQty, setTradeQty] = useState<string>("1");
  const [activeOrders, setActiveOrders] = useState<UserOrder[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isProMode, setIsProMode] = useState(false);

  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [targetItem, setTargetItem] = useState<MarketItem | 'USD' | 'FLIP' | null>(null);
  const [topUpTarget, setTopUpTarget] = useState<'USD' | 'FLIP' | null>(null);

  // FLIP Token Balance Mock
  const [flipBalance, setFlipBalance] = useState(2500);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [userHoldings, setUserHoldings] = useState<Record<string, number>>({ '1': 120, '2': 45 });
  const [cashBalance, setCashBalance] = useState(12450.00);

  const orderBookState = useMemo(() => ({
    asks: GENERATE_DEPTH(selectedItem.floor, 'ask'),
    bids: GENERATE_DEPTH(selectedItem.floor - 0.5, 'bid')
  }), [selectedItem]);

  const marketState: MarketState = useMemo(() => ({
    asset: selectedItem.name,
    price: selectedItem.floor,
    floorPrice: selectedItem.floor,
    topBid: selectedItem.floor - 0.5,
    listedCount: 100,
    change24h: selectedItem.change1d,
    volume24h: 1000,
    orderBook: orderBookState
  }), [selectedItem, orderBookState]);

  const { portfolioValue, netPnL } = useMemo(() => {
    let valueTotal = 0, costTotal = 0;
    Object.entries(userHoldings).forEach(([id, qty]) => {
      const item = MOCK_MARKET_ITEMS.find(m => m.id === id);
      const q = Number(qty);
      if (item) {
        valueTotal += item.floor * q;
        costTotal += (MOCK_COSTS[id] || 0) * q;
      }
    });
    const flipValueUSD = flipBalance * 1.20;
    const flipCostUSD = flipBalance * 1.00;

    return {
      portfolioValue: valueTotal + flipValueUSD,
      netPnL: (valueTotal - costTotal) + (flipValueUSD - flipCostUSD)
    };
  }, [userHoldings, flipBalance]);

  const totalAssets = portfolioValue + cashBalance;

  const handleAssetSelect = (item: MarketItem) => {
    setSelectedItem(item);
    setOrderPrice(item.floor.toFixed(2));
    setCurrentTab('terminal');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = () => {
    const qtyNum = parseInt(tradeQty);
    const priceNum = parseFloat(orderPrice);
    if (isNaN(qtyNum) || qtyNum <= 0) return;
    if (side === 'sell' && qtyNum > (userHoldings[selectedItem.id] || 0)) { alert("Insufficient vault inventory."); return; }

    const newOrder: UserOrder = {
      id: Math.random().toString(36).substr(2, 9),
      type: side === 'buy' ? 'bid' : 'list',
      price: priceNum,
      quantity: qtyNum
    };

    setActiveOrders(prev => [newOrder, ...prev]);
    alert(`LIMIT ORDER PLACED: ${side === 'buy' ? 'Buy' : 'Sell'} ${qtyNum} ${selectedItem.name} at $${priceNum.toFixed(2)}`);
  };

  const cancelOrder = (id: string) => {
    setActiveOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleRedeemConfirm = (qty: number) => {
    if (!targetItem || targetItem === 'USD' || targetItem === 'FLIP') return;
    const itemId = targetItem.id;
    const itemName = targetItem.name;
    const qtyToRedeem = qty;

    setUserHoldings(prev => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: currentQty - qtyToRedeem };
    });
    setShowRedeemModal(false);
    alert(`Redemption process started for ${qtyToRedeem} boxes of ${itemName}. Check your email for shipping tracking.`);
  };

  const handleTransferConfirm = (qty: number, address: string) => {
    if (!targetItem) return;
    const item = targetItem;
    const qtyToTransfer = qty;

    if (item === 'USD') {
      setCashBalance(prev => prev - qtyToTransfer);
    } else if (item === 'FLIP') {
      setFlipBalance(prev => prev - qtyToTransfer);
    } else {
      const itemId = item.id;
      setUserHoldings(prev => {
        const currentQty = prev[itemId] || 0;
        return { ...prev, [itemId]: currentQty - qtyToTransfer };
      });
    }
    setShowTransferModal(false);
    const targetName = item === 'USD' ? 'USD' : item === 'FLIP' ? 'FLIP' : item.name;
    alert(`Transferred ${qtyToTransfer} ${targetName} to address ${address}.`);
  };

  const handleTopUpConfirm = (amount: number) => {
    if (!topUpTarget) return;
    if (topUpTarget === 'USD') {
      setCashBalance(prev => prev + amount);
    } else {
      setFlipBalance(prev => prev + amount);
    }
    setShowTopUpModal(false);
    setTopUpTarget(null);
    alert(`Successfully topped up ${amount} ${topUpTarget}.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <header className="h-14 md:h-16 bg-[#0f172a] border-b border-white/5 sticky top-0 z-[60] flex flex-col shadow-2xl">
        <div className="max-w-7xl mx-auto h-full w-full px-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => setCurrentTab('home')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Package size={18} fill="currentColor" />
            </div>
            <span className="text-sm md:text-base font-black text-white tracking-widest uppercase italic">SEALED FLIP</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1 flex-1 max-w-lg bg-white/5 p-1 rounded-lg border border-white/5 overflow-x-auto no-scrollbar">
            <button onClick={() => setCurrentTab('home')} className={`flex-1 min-w-[70px] py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Home</button>
            <button onClick={() => setCurrentTab('market')} className={`flex-1 min-w-[70px] py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'market' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Markets</button>
            <button onClick={() => setCurrentTab('terminal')} className={`flex-1 min-w-[70px] py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'terminal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Trade</button>
            <button onClick={() => setCurrentTab('launch_pad')} className={`flex-1 min-w-[80px] py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'launch_pad' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Launch Pad</button>
            <button onClick={() => setCurrentTab('portfolio')} className={`flex-1 min-w-[70px] py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'portfolio' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Vault</button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Balance</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono text-emerald-400">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">USD</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={walletRef}>
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 border border-white/10 ${isWalletDropdownOpen ? 'bg-white text-[#0f172a]' : 'bg-blue-600 text-white hover:bg-blue-50'}`}
                >
                  <Wallet size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">active</span>
                </button>
                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 z-[100] overflow-hidden text-left">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connected Wallet</span></div>
                      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0"><ShieldCheck size={14} className="text-white" /></div>
                        <span className="text-xs font-mono font-bold text-gray-800 truncate">{walletAddress}</span>
                        <button onClick={() => { navigator.clipboard.writeText(walletAddress); alert("Copied!"); }} className="text-gray-400 hover:text-blue-500 p-1 transition-colors"><Copy size={14} /></button>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"><span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Vault Value</span><span className="text-sm font-black text-gray-900">${portfolioValue.toLocaleString()}</span></div>
                        <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"><span className="text-[9px] font-black text-gray-400 uppercase block mb-1">FLIP Tokens</span><span className="text-sm font-black text-gray-900">{flipBalance.toLocaleString()}</span></div>
                      </div>
                      <button className="w-full flex items-center justify-between p-3 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase italic tracking-widest" onClick={() => setIsWalletDropdownOpen(false)}>Disconnect <LogOut size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
              <button className="lg:hidden p-2 text-white/60" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      <PriceTicker />

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[104px] z-[50] bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top-4 p-6">
          <div className="flex flex-col gap-3">
            {['home', 'market', 'terminal', 'launch_pad', 'portfolio'].map(t => (
              <button key={t} onClick={() => { setCurrentTab(t as ViewTab); setIsMobileMenuOpen(false); }} className={`w-full py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest text-left transition-all ${currentTab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60'}`}>
                {t === 'launch_pad' ? 'launch pad' : t === 'portfolio' ? 'vault' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        {currentTab === 'home' && <HomeView onSelect={handleAssetSelect} onTradeNow={() => setCurrentTab('market')} onGoToLaunchPad={() => setCurrentTab('launch_pad')} />}
        {currentTab === 'market' && (
          <MarketView
            onSelect={handleAssetSelect}
            marketState={marketState}
          />
        )}
        {currentTab === 'terminal' && <TerminalView selectedItem={selectedItem} marketState={marketState} recentTrades={GENERATE_TRADES(selectedItem.floor)} side={side} setSide={setSide} orderPrice={orderPrice} setOrderPrice={setOrderPrice} tradeQty={tradeQty} setTradeQty={setTradeQty} handlePlaceOrder={handlePlaceOrder} activeOrders={activeOrders} cancelOrder={cancelOrder} handleRunAnalysis={async () => { setIsAnalyzing(true); setAnalysis(await analyzeMarket(marketState)); setIsAnalyzing(false); }} isAnalyzing={isAnalyzing} analysis={analysis} currentBalance={userHoldings[selectedItem.id] || 0} avgCost={MOCK_COSTS[selectedItem.id] || 0} onSelectAsset={handleAssetSelect} isProMode={isProMode} setIsProMode={setIsProMode} />}
        {currentTab === 'launch_pad' && <LaunchPadView flipBalance={flipBalance} />}
        {currentTab === 'portfolio' && (
          <PortfolioView
            userHoldings={userHoldings} portfolioValue={portfolioValue} cashBalance={cashBalance} flipBalance={flipBalance} totalAssets={totalAssets} netPnL={netPnL}
            onSellRequest={(item) => { setSelectedItem(item); setSide('sell'); setCurrentTab('terminal'); }}
            onRedeemRequest={(item) => { setTargetItem(item); setShowRedeemModal(true); }}
            onTransferRequest={(item) => { setTargetItem(item); setShowTransferModal(true); }}
            onTopUpRequest={(target) => { setTopUpTarget(target); setShowTopUpModal(true); }}
          />
        )}
      </main>

      {/* Modals */}
      {showRedeemModal && targetItem && typeof targetItem !== 'string' && (
        <RedeemModal
          item={targetItem}
          maxQty={userHoldings[targetItem.id] || 0}
          onClose={() => setShowRedeemModal(false)}
          onConfirm={handleRedeemConfirm}
        />
      )}
      {showTransferModal && targetItem && (
        <TransferModal
          item={targetItem}
          maxQty={targetItem === 'USD' ? cashBalance : targetItem === 'FLIP' ? flipBalance : (userHoldings[targetItem.id] || 0)}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransferConfirm}
        />
      )}
      {showTopUpModal && topUpTarget && (
        <TopUpModal
          target={topUpTarget}
          currentBalance={topUpTarget === 'USD' ? cashBalance : flipBalance}
          onClose={() => { setShowTopUpModal(false); setTopUpTarget(null); }}
          onConfirm={handleTopUpConfirm}
        />
      )}

      <footer className="bg-white border-t border-gray-200 py-8 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">SEALED FLIP</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Modern Assets • Real World Utility</span>
          </div>
          <div className="flex gap-8 items-center flex-wrap justify-center font-black uppercase text-[10px] text-slate-400">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
