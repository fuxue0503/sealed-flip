
export interface PriceData {
  time: string;
  price: number;
  volume?: number;
}

export interface Listing {
  id: number;
  price: number;
  seller: string;
  quantity: number;
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  time: string;
  side: 'buy' | 'sell';
}

export interface OrderRow {
  price: number;
  size: number;
  total: number;
  type: 'bid' | 'ask';
}

export interface UserOrder {
  id: string;
  type: 'bid' | 'list';
  price: number;
  quantity: number;
}

export interface MarketItem {
  id: string;
  name: string;
  category: string;
  floor: number;
  change1d: number;
  volume7d: number;
  volumeTotal: number;
  marketCap: number;
  isTrending?: boolean;
  imageUrl?: string;
}

export interface UserAsset {
  id: string;
  name: string;
  balance: number;
  avgCost: number;
  floor: number;
  pnl: number;
}

export interface MarketState {
  asset: string;
  price: number;
  change24h: number;
  volume24h: number;
  floorPrice: number;
  topBid: number;
  listedCount: number;
  orderBook: {
    asks: OrderRow[];
    bids: OrderRow[];
  };
}

export type ViewTab = 'home' | 'market' | 'terminal' | 'launch_pad' | 'portfolio' | 'rewards' | 'auction';
export type Side = 'buy' | 'sell';
export type OrderType = 'instant' | 'limit';
