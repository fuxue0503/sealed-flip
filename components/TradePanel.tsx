import React, { useState } from 'react';
import { MarketState, Side, UserAsset } from '../types';
import { Info } from 'lucide-react';

const TradePanel: React.FC<{ state: MarketState; userAsset: UserAsset }> = ({ state, userAsset }) => {
  const [side, setSide] = useState<Side>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(state.price.toString());
  const [amount, setAmount] = useState('1');
  const [sliderValue, setSliderValue] = useState(0);

  const isBuy = side === 'buy';
  const colorClass = isBuy ? 'bg-[#089981] hover:bg-[#067d6a]' : 'bg-[#f23645] hover:bg-[#d12e3b]';
  
  const availableUSDT = 13748.21;
  const maxBuyAmount = availableUSDT / parseFloat(price || state.price.toString());
  const maxSellAmount = userAsset.balance;

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    const max = isBuy ? maxBuyAmount : maxSellAmount;
    const newAmount = (max * (val / 100)).toFixed(2);
    setAmount(newAmount);
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Side Switcher */}
      <div className="flex bg-[#0b0e11] rounded p-0.5 border border-white/5 shrink-0">
        <button 
          onClick={() => { setSide('buy'); setSliderValue(0); }}
          className={`flex-1 py-2 text-xs font-black uppercase rounded transition-all ${isBuy ? 'bg-[#089981]/20 text-[#089981]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => { setSide('sell'); setSliderValue(0); }}
          className={`flex-1 py-2 text-xs font-black uppercase rounded transition-all ${!isBuy ? 'bg-[#f23645]/20 text-[#f23645]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Sell
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex gap-4 text-[10px] font-black uppercase text-gray-500 border-b border-white/5 pb-2">
        <button 
          onClick={() => setOrderType('limit')}
          className={orderType === 'limit' ? 'text-blue-400' : ''}
        >
          Limit
        </button>
        <button 
          onClick={() => setOrderType('market')}
          className={orderType === 'market' ? 'text-blue-400' : ''}
        >
          Market
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 italic uppercase">
            <span>Price</span>
            <span>USDT</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={orderType === 'market' ? 'Market Price' : price}
              disabled={orderType === 'market'}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#0b0e11] border border-white/10 rounded px-3 py-2 text-sm font-mono font-bold focus:border-blue-500 outline-none text-white disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 italic uppercase">
            <span>Amount</span>
            <span>BOX</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0b0e11] border border-white/10 rounded px-3 py-2 text-sm font-mono font-bold focus:border-blue-500 outline-none text-white"
            />
          </div>
        </div>

        {/* Percentage Slider */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-3">
             {[0, 25, 50, 75, 100].map(p => (
               <button 
                key={p} 
                onClick={() => handleSliderChange(p)}
                className={`w-10 h-4 border rounded-[2px] text-[8px] font-black transition-all ${sliderValue === p ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/10 text-gray-600 hover:text-gray-300 hover:border-white/20'}`}
               >
                {p}%
               </button>
             ))}
          </div>
          <div className="relative flex items-center">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
            <div className="absolute right-0 -top-6 text-[10px] font-mono text-blue-400 font-bold">{sliderValue}%</div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="space-y-2 text-[10px] font-bold uppercase text-gray-500">
           <div className="flex justify-between">
              <span>Available</span>
              <span className="text-gray-300 font-mono">{availableUSDT.toLocaleString()} USDT</span>
           </div>
           <div className="flex justify-between">
              <span>Max {isBuy ? 'Buy' : 'Sell'}</span>
              <span className="text-gray-300 font-mono">{isBuy ? maxBuyAmount.toFixed(2) : maxSellAmount.toFixed(2)} BOX</span>
           </div>
        </div>

        {/* Execution Button */}
        <button className={`w-full py-4 rounded-lg text-base font-black uppercase italic tracking-[0.3em] text-white transition-all shadow-lg active:scale-95 ${colorClass}`}>
          {isBuy ? 'BUY' : 'SELL'}
        </button>
      </div>

      <div className="flex-1"></div>

      {/* Simplified Info Box */}
      <div className="border-t border-white/5 pt-4">
         <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded flex gap-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-[9px] font-medium leading-relaxed text-gray-500">
              PHYSICALLY BACKED ASSETS ARE SETTLED T+0. REDEEM PHYSICAL VIA VAULT ANYTIME. ASSETS ARE HELD IN CLIMATE-CONTROLLED STORAGE.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TradePanel;