# Chess Clash Frontend

A Next.js 14 frontend for the Chess Clash token-backed challenges platform, built with TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

- **Token-Backed Challenges**: Create and participate in challenges between chess players
- **Player Tokens**: Each chess player has their own ERC20 token
- **Staking System**: Stake tokens on either side of a challenge
- **AMM Integration**: Automatic market making for token price discovery
- **Admin Panel**: Resolve challenges and manage the platform
- **Embedded Wallet**: Simple wallet connection for demo purposes

## 🏗️ Architecture

### Smart Contracts
- `PlayerTokenFactory`: Creates and manages player tokens
- `ChallengeEscrow`: Manages challenges, staking, and resolution
- `MockOracle`: Provides challenge results (for demo)
- `MockAMMRouter`: Simulates AMM swaps for price discovery

### Frontend Structure
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **Custom Embedded Wallet** for wallet interactions
- **Zustand** for state management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chess-clash/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your contract addresses:
   ```env
   # Contract Addresses (Base Sepolia)
   NEXT_PUBLIC_FACTORY_ADDR=0x4e5cb2996Fa9529381FC4277DAeEC8A59BbBe1FC
   NEXT_PUBLIC_ESCROW_ADDR=0x... # Your ChallengeEscrow address
   NEXT_PUBLIC_ORACLE_ADDR=0x... # Your MockOracle address
   NEXT_PUBLIC_AMM_ROUTER_ADDR=0x... # Your MockAMMRouter address
   
   # Network Configuration
   NEXT_PUBLIC_CHAIN_ID=84532 # Base Sepolia
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   ```

4. **Add player images** (optional)
   ```bash
   # Create the images directory
   mkdir -p public/images/players
   
   # Add player images named 1.jpg, 2.jpg, etc.
   # Or run the helper script:
   chmod +x scripts/prepare-images.sh
   ./scripts/prepare-images.sh
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎮 Usage

### Creating a Challenge
1. Connect your wallet
2. Click "Create Challenge"
3. Select two players (Player A vs Player B)
4. Enter a description and duration
5. Stake tokens for Player A
6. Submit the challenge

### Participating in Challenges
1. Browse active challenges on the home page
2. Click "View Details" to see challenge information
3. Stake tokens for either Player A or Player B
4. Wait for the challenge to end and be resolved

### Admin Functions
1. Navigate to `/admin` (owner only)
2. View ended challenges that need resolution
3. Select the winner (Player A or Player B)
4. Click "Resolve" to finalize the challenge

### Claiming Winnings
1. After a challenge is resolved, participants can claim their tokens
2. Click "Claim" on resolved challenges
3. Tokens are returned to participants (no pot splitting)

## 🔧 Development

### Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── challenge/[id]/    # Challenge detail page
│   ├── players/           # Players roster
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ChallengeCard.tsx # Challenge display
│   ├── CreateChallengeForm.tsx
│   ├── Navigation.tsx
│   └── PlayerCard.tsx
├── lib/                   # Utilities and configurations
│   ├── contracts/        # Contract ABIs and hooks
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
    └── images/players/   # Player images
```

### Key Components

#### Challenge System
- **Challenge Creation**: Users create challenges between two players
- **Staking**: Users stake tokens on either side
- **Resolution**: Admin resolves challenges and determines winners
- **AMM Integration**: Losing tokens are swapped for winning tokens

#### Player Tokens
- Each chess player has their own ERC20 token
- Tokens can be minted via faucet for testing
- Token prices are influenced by challenge outcomes

### State Management
- **Zustand Store**: Manages global application state
- **Contract Hooks**: Custom hooks for contract interactions
- **Embedded Wallet**: Simplified wallet for demo purposes

## 🧪 Testing

### Manual Testing Checklist
- [ ] Wallet connection
- [ ] Player token faucet
- [ ] Challenge creation
- [ ] Staking on challenges
- [ ] Challenge resolution (admin)
- [ ] Token claiming
- [ ] Player image display

### Demo Flow
1. **Setup**: Deploy contracts and update environment variables
2. **Player Creation**: Ensure PlayerTokenFactory has players
3. **Challenge Creation**: Create a test challenge
4. **Staking**: Stake tokens on both sides
5. **Resolution**: Use admin panel to resolve challenge
6. **Claiming**: Test token claiming functionality

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_FACTORY_ADDR=0x...
NEXT_PUBLIC_ESCROW_ADDR=0x...
NEXT_PUBLIC_ORACLE_ADDR=0x...
NEXT_PUBLIC_AMM_ROUTER_ADDR=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## 📝 Notes

### Contract Integration
- ABIs are automatically copied from the contracts build output
- Contract addresses must be updated in `.env.local`
- All contract interactions use the custom embedded wallet

### Limitations (Demo Version)
- Uses mock oracle for challenge resolution
- Simplified AMM router for token swaps
- Basic embedded wallet (not production-ready)
- No subgraph indexing (events loaded directly)

### Production Considerations
- Implement proper wallet connection (MetaMask, WalletConnect)
- Add subgraph for efficient event indexing
- Implement proper oracle integration
- Add proper AMM integration
- Add pagination for large datasets
- Implement proper error handling and loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.