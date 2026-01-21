
import { GoogleGenAI } from "@google/genai";
import { MarketState } from "../types";

export const analyzeMarket = async (state: MarketState) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As the Sealed Flip AI "Market Scout", analyze the pricing for ${state.asset}.
    
    Current Stats:
    - Last Sale: $${state.floorPrice}
    - 24h Price Change: ${state.change24h}%
    
    Context:
    Traditional eBay sellers charge $25-40 for shipping and local tax is often 8-10%. 
    On Sealed Flip, there is $0 shipping and deferred tax since it's an RWA transfer.
    
    Provide a "Buyer's Intel" report for an e-commerce user:
    1. Value Analysis: (Is this a good time to buy compared to historicals?)
    2. Savings Insight: Calculate total savings vs traditional physical delivery.
    3. Buy Recommendation: (e.g., "Highly Recommended for entry-level investors")
    
    Format it as a clean, helpful guide for a casual collector or professional investor. Stay professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.6,
        topP: 0.9,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "MARKET INTEL CURRENTLY UNAVAILABLE.";
  }
};
