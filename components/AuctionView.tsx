import React, { useState } from 'react';
import { AuctionList } from './AuctionList';
import { AuctionDetail } from './AuctionDetail';
import { MOCK_AUCTIONS } from './auctionData';

// This component acts as the main view controller for Auctions
export const AuctionView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

    // If we have a selected auction, show the detail view
    if (selectedAuctionId) {
        const auction = MOCK_AUCTIONS.find(a => a.id === selectedAuctionId);
        if (auction) {
            return (
                <AuctionDetail
                    auction={auction}
                    onBack={() => setSelectedAuctionId(null)}
                />
            );
        }
    }

    // Otherwise show the list
    return (
        <AuctionList
            onSelect={(id) => setSelectedAuctionId(id)}
        />
    );
};
