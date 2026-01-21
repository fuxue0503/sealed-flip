
export interface ItemSpecifics {
    condition: string;
    game: string;
    set: string;
    cardName: string;
    cardNumber: string;
    professionalGrader: string;
    grade: string;
    year: string;
}

export interface AuctionItem {
    id: string;
    title: string;
    image: string;
    currentBid: number;
    bids: number;
    timeLeft: string; // Simplification for mock: pre-formatted string or object
    timeLeftObject?: { d: number; h: number; m: number; s: number };
    seller: {
        name: string;
        location: string;
    };
    specifics: ItemSpecifics;
}

export const MOCK_AUCTIONS: AuctionItem[] = [
    {
        id: '1',
        title: '1999 Pokemon 1st Edition Shadowless Charizard Base Set Holo Rare #4 PSA 10 GEM MT',
        image: 'https://cdn-ilbccgl.nitrocdn.com/MnevILcxnnUARVvZLzZntmBMtgBymOnO/assets/images/optimized/rev-8436c36/www.oldsportscards.com/wp-content/uploads/2024/11/1999-Pokemon-Spanish-First-Edition-Holographic-Charizard-Card.webp',
        currentBid: 12500.00,
        bids: 24,
        timeLeft: '0d 0h 23m 54s',
        timeLeftObject: { d: 0, h: 0, m: 23, s: 54 },
        seller: {
            name: 'Sealed Vault',
            location: 'Tokyo, Japan'
        },
        specifics: {
            condition: 'Graded - Gem Mint 10',
            game: 'Pokémon TCG',
            set: 'Base Set',
            cardName: 'Charizard',
            cardNumber: '4',
            professionalGrader: 'PSA',
            grade: '10',
            year: '1999'
        }
    },
    {
        id: '2',
        title: '2000 Pokemon Team Rocket Dark Charizard 1st Edition Holo #4 PSA 10',
        image: 'https://d1w8cc2yygc27j.cloudfront.net/2922960435169443157/5196764176960117254.jpg',
        currentBid: 4500.00,
        bids: 18,
        timeLeft: '1d 4h 12m',
        timeLeftObject: { d: 1, h: 4, m: 12, s: 0 },
        seller: {
            name: 'Retro Cards',
            location: 'New York, USA'
        },
        specifics: {
            condition: 'Graded - Gem Mint 10',
            game: 'Pokémon TCG',
            set: 'Team Rocket',
            cardName: 'Dark Charizard',
            cardNumber: '21',
            professionalGrader: 'PSA',
            grade: '10',
            year: '2000'
        }
    },
    {
        id: '3',
        title: '1999 Pokemon Base Set Booster Box Sealed 1st Edition English',
        image: 'https://storage.googleapis.com/images.pricecharting.com/91749045dc974aaeaf9943a17290bb3affadda4fd4e245c1dc58f3de87a9fb10/1600.jpg',
        currentBid: 280000.00,
        bids: 45,
        timeLeft: '3d 12h 05m',
        timeLeftObject: { d: 3, h: 12, m: 5, s: 0 },
        seller: {
            name: 'Sealed Vault',
            location: 'Tokyo, Japan'
        },
        specifics: {
            condition: 'Factory Sealed',
            game: 'Pokémon TCG',
            set: 'Base Set',
            cardName: 'Booster Box',
            cardNumber: 'N/A',
            professionalGrader: 'N/A',
            grade: 'Sealed',
            year: '1999'
        }
    },
    {
        id: '4',
        title: 'Pokemon 1999 Base Set 1st Edition Holo Venusaur #15 PSA 10 GEM MINT',
        image: 'https://s3-us-west-2.amazonaws.com/cu-apr/auctions/3496240671681824744/-8975845084392459197/images/1.jpg',
        currentBid: 8200.00,
        bids: 12,
        timeLeft: '0d 8h 30m',
        timeLeftObject: { d: 0, h: 8, m: 30, s: 0 },
        seller: {
            name: 'PokeMaster',
            location: 'London, UK'
        },
        specifics: {
            condition: 'Graded - Gem Mint 10',
            game: 'Pokémon TCG',
            set: 'Base Set',
            cardName: 'Venusaur',
            cardNumber: '15',
            professionalGrader: 'PSA',
            grade: '10',
            year: '1999'
        }
    }
];
