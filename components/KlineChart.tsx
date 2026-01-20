
import React, { useEffect, useRef, useState, useMemo } from 'react';

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const generateMockData = (): ChartData[] => {
  const data: ChartData[] = [];
  let prevClose = 165;
  const now = Math.floor(Date.now() / 1000);
  const fiveMin = 300;

  for (let i = 0; i < 500; i++) {
    const time = (now - (500 - i) * fiveMin);
    const open = prevClose + (Math.random() * 4 - 2);
    const close = open + (Math.random() * 10 - 5);
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const volume = Math.floor(Math.random() * 1000) + 200;
    
    data.push({ time, open, high, low, close, volume });
    prevClose = close;
  }
  return data;
};

const calculateMA = (data: ChartData[], period: number) => {
  const ma = new Array(data.length).fill(null);
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    ma[i] = sum / period;
  }
  return ma;
};

const KlineChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => generateMockData(), []);
  const ma5 = useMemo(() => calculateMA(data, 5), [data]);
  const ma10 = useMemo(() => calculateMA(data, 10), [data]);
  const ma20 = useMemo(() => calculateMA(data, 20), [data]);

  // View state
  const [barWidth, setBarWidth] = useState(10);
  const [rightOffset, setRightOffset] = useState(10); // Bars from the right
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);

  // Interaction State
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [cursorY, setCursorY] = useState<number | null>(null);
  const [hoveredData, setHoveredData] = useState<ChartData | null>(null);

  const colors = {
    bg: '#0b0e11',
    grid: '#1e222d',
    up: '#089981',
    down: '#f23645',
    text: '#707a8a',
    ma5: '#ffffff',
    ma10: '#eab308',
    ma20: '#60a5fa',
    crosshair: '#758696'
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const paddingRight = 60; // Space for price axis
    const paddingBottom = 25; // Space for time axis
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Calculate which bars are visible
    const visibleBarCount = Math.ceil(chartWidth / barWidth);
    const endIndex = Math.max(0, data.length - Math.floor(rightOffset));
    const startIndex = Math.max(0, endIndex - visibleBarCount);
    
    const visibleData = data.slice(startIndex, endIndex);
    if (visibleData.length === 0) return;

    // Find price range for scaling
    const minPrice = Math.min(...visibleData.map(d => d.low));
    const maxPrice = Math.max(...visibleData.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const priceScale = (chartHeight * 0.8) / (priceRange || 1); // Use 80% height for price
    const priceOffset = chartHeight * 0.1; // 10% top margin

    const getY = (price: number) => {
      return chartHeight - ((price - minPrice) * priceScale + priceOffset);
    };

    const getX = (index: number) => {
      // index is relative to data array
      const relativeIndex = index - startIndex;
      return chartWidth - (endIndex - index) * barWidth - (barWidth / 2);
    };

    const getPriceFromY = (y: number) => {
      const value = (chartHeight - y - priceOffset) / priceScale + minPrice;
      return value;
    };

    // Draw Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]); // Dashed grid
    ctx.beginPath();
    // Horz Grid & Price Labels
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = (chartHeight / gridSteps) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      
      const priceAtY = getPriceFromY(y);
      ctx.fillStyle = colors.text;
      ctx.font = '10px JetBrains Mono';
      // Right align text in price column
      // ctx.textAlign = 'left';
      ctx.fillText(priceAtY.toFixed(2), chartWidth + 5, y + 4);
    }
    // Vert Grid
    visibleData.forEach((d, i) => {
      if (i % 20 === 0) { // Every 20 bars
        const x = getX(startIndex + i);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
      }
    });

    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Candles & Volume
    visibleData.forEach((d, i) => {
      const globalIndex = startIndex + i;
      const x = getX(globalIndex);
      const isUp = d.close >= d.open;
      const color = isUp ? colors.up : colors.down;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;

      // Candle Wick
      ctx.beginPath();
      ctx.moveTo(x, getY(d.high));
      ctx.lineTo(x, getY(d.low));
      ctx.stroke();

      // Candle Body
      const bodyTop = getY(Math.max(d.open, d.close));
      const bodyBottom = getY(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      const bodyWidth = Math.max(1, barWidth * 0.7);
      
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

      // Volume Bars
      const maxVol = Math.max(...visibleData.map(v => v.volume));
      const volY = getY(minPrice) + 15; // Just below min price visual area
      const volHeight = (d.volume / maxVol) * (chartHeight * 0.15);
      ctx.globalAlpha = 0.3; // Transparent volume
      ctx.fillRect(x - bodyWidth / 2, chartHeight - volHeight, bodyWidth, volHeight);
      ctx.globalAlpha = 1.0;
    });

    // Draw Moving Averages
    const drawMA = (maData: (number | null)[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      let first = true;
      for (let i = startIndex; i < endIndex; i++) {
        const val = maData[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          // Dont draw if point is outside roughly
          if (first) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          first = false;
        }
      }
      ctx.stroke();
    };

    drawMA(ma5, colors.ma5);
    drawMA(ma10, colors.ma10);
    drawMA(ma20, colors.ma20);

    // Current Price Line
    const lastPrice = data[data.length - 1].close;
    const lastY = getY(lastPrice);
    if (lastY > 0 && lastY < chartHeight) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = colors.down;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(chartWidth, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Price Label bg
      ctx.fillStyle = colors.down;
      ctx.fillRect(chartWidth, lastY - 9, paddingRight, 18);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(lastPrice.toFixed(2), chartWidth + 5, lastY + 4);
    }

    // Time Labels (X Axis)
    ctx.fillStyle = colors.text;
    ctx.font = '10px JetBrains Mono';
    visibleData.forEach((d, i) => {
      if (i % 20 === 0) {
        const x = getX(startIndex + i);
        const date = new Date(d.time * 1000);
        const label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillText(label, x - 15, chartHeight + 15);
      }
    });

    // Crosshair
    if (cursorX !== null && cursorY !== null) {
      // Draw Crosshair Lines
      ctx.strokeStyle = colors.crosshair;
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 0.8;
      
      // Vertical
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, chartHeight);
      ctx.stroke();

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, cursorY);
      ctx.lineTo(chartWidth, cursorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on Price Axis
      const priceAtCursor = getPriceFromY(cursorY);
      ctx.fillStyle = '#1e222d';
      ctx.fillRect(chartWidth, cursorY - 9, paddingRight, 18);
      ctx.fillStyle = '#fff';
      ctx.fillText(priceAtCursor.toFixed(2), chartWidth + 5, cursorY + 4);

      // Label on Time Axis (Find closest candle)
      // Reverse map X to index
      // x = chartWidth - (endIndex - i) * barWidth - barWidth/2
      // (chartWidth - x - barWidth/2) / barWidth = endIndex - i
      // i = endIndex - ((chartWidth - x - barWidth/2) / barWidth)
      
      const distFromRight = chartWidth - cursorX;
      const barsFromEnd = Math.floor(distFromRight / barWidth);
      const dataIndex = endIndex - barsFromEnd - 1; // -1 adjustment
      
      if (dataIndex >= startIndex && dataIndex < endIndex && data[dataIndex]) {
        const d = data[dataIndex];
        const date = new Date(d.time * 1000);
        const timeLabel = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        const labelX = cursorX;
        
        ctx.fillStyle = '#1e222d';
        ctx.fillRect(labelX - 20, chartHeight, 40, 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(timeLabel, labelX - 15, chartHeight + 14);

        // Update hovered data for react text overlay
        if (hoveredData !== d) {
             // We do this in draw loop often, optimally we should do this in mousemove logic but 
             // for simple sync, we can trigger effect or set state if actually changed.
             // But setting state in draw loop is bad. 
             // We will handle data identification in mouseMove instead.
        }
      }
    }
  };

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, barWidth, rightOffset, cursorX, cursorY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Crosshair logic
    // Restrict to chart area
    const chartWidth = rect.width - 60;
    const chartHeight = rect.height - 25;
    
    if (x < chartWidth && y < chartHeight) {
      setCursorX(x);
      setCursorY(y);

      // Find data point
      const visibleBarCount = Math.ceil(chartWidth / barWidth);
      const endIndex = Math.max(0, data.length - Math.floor(rightOffset));
      
      const distFromRight = chartWidth - x;
      const barsFromEnd = Math.floor(distFromRight / barWidth);
      const dataIndex = endIndex - barsFromEnd - 1;
      
      if (dataIndex >= 0 && data[dataIndex]) {
        setHoveredData(data[dataIndex]);
      } else {
        setHoveredData(null);
      }

    } else {
      setCursorX(null);
      setCursorY(null);
      setHoveredData(null);
    }

    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const barsMoved = deltaX / barWidth;
    setRightOffset(prev => Math.max(-5, prev + barsMoved));
    setLastMouseX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    setCursorX(null);
    setCursorY(null);
    setHoveredData(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) {
      setBarWidth(prev => Math.min(50, prev * (1 + zoomSpeed)));
    } else {
      setBarWidth(prev => Math.max(2, prev * (1 - zoomSpeed)));
    }
  };

  const displayData = hoveredData || data[data.length - 1];

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0b0e11] relative overflow-hidden cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      <div className="absolute top-2 left-4 z-10 flex flex-wrap gap-4 text-[10px] pointer-events-none">
        {/* OHLCV Legend */}
        <div className="flex gap-3 font-mono">
           <span className="text-gray-400">O: <span className={displayData.open > displayData.close ? 'text-rose-500' : 'text-emerald-500'}>{displayData.open.toFixed(2)}</span></span>
           <span className="text-gray-400">H: <span className={displayData.open > displayData.close ? 'text-rose-500' : 'text-emerald-500'}>{displayData.high.toFixed(2)}</span></span>
           <span className="text-gray-400">L: <span className={displayData.open > displayData.close ? 'text-rose-500' : 'text-emerald-500'}>{displayData.low.toFixed(2)}</span></span>
           <span className="text-gray-400">C: <span className={displayData.open > displayData.close ? 'text-rose-500' : 'text-emerald-500'}>{displayData.close.toFixed(2)}</span></span>
           <span className="text-gray-400">Vol: <span className='text-yellow-500'>{displayData.volume}</span></span>
        </div>

        {/* MA Legend */}
        <div className="flex items-center gap-1 font-bold ml-4">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          <span className="text-white">MA(5)</span>
        </div>
        <div className="flex items-center gap-1 font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <span className="text-yellow-500">MA(10)</span>
        </div>
        <div className="flex items-center gap-1 font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <span className="text-blue-400">MA(20)</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default KlineChart;
