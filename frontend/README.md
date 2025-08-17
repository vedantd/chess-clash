# Chess Clash Frontend

A Next.js 14 frontend for the "Token-Backed Challenges" application on Base Sepolia with embedded wallet integration. Users can create and participate in token-backed challenges using player tokens without needing browser extensions.

## Features

- **Embedded Wallet**: Seamless wallet integration without browser extensions
- **Player Tokens**: View all available player tokens with faucet functionality
- **Challenge Creation**: Create new challenges with token staking
- **Challenge Participation**: Stake on existing challenges (Side A or Side B)
- **Admin Panel**: Resolve challenges and manage the platform (owner only)
- **Real-time Updates**: Live challenge feed with status updates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Custom embedded wallet + viem
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Base Sepolia testnet access

## Setup

1. **Clone and install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Copy the example environment file and fill in your contract addresses:
   ```bash
   cp env.example .env.local
   ```

   Update `.env.local` with your deployed contract addresses:
   ```env
   # Chain Configuration
   NEXT_PUBLIC_CHAIN_ID=84532

   # Contract Addresses (Base Sepolia)
   NEXT_PUBLIC_FACTORY_ADDR=0x... # Your PlayerTokenFactory address
   NEXT_PUBLIC_ESCROW_ADDR=0x...  # Your ChallengeEscrow address
   NEXT_PUBLIC_USDC_ADDR=0x...    # Your USDC address
   NEXT_PUBLIC_SWAP_ADAPTER_ADDR=0x... # Your SwapAdapter address

   # RPC Configuration
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Embedded Wallet Implementation

This project uses a custom embedded wallet that eliminates the need for browser extensions like MetaMask.

### Key Features:

- **No Browser Extensions**: Works without MetaMask or other wallet extensions
- **Mock Wallet**: Demo implementation with a mock wallet account
- **Full Functionality**: All blockchain interactions work seamlessly
- **Easy Integration**: Simple React context-based implementation

### How it works:

1. **Wallet Provider**: `components/WagmiProvider.tsx` provides wallet context
2. **Mock Wallet**: Creates a mock wallet account for demonstration
3. **Transaction Support**: All contract interactions work through viem
4. **State Management**: Wallet state is managed through React context

### Current Implementation:

The embedded wallet currently uses a mock implementation for demonstration purposes:

```typescript
// Mock wallet account
const mockAccount: Account = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f7E123",
  type: "json-rpc",
};
```

### For Production CDP Integration:

To integrate with Coinbase Developer Platform (CDP) embedded wallets, replace the mock implementation:

1. **Install CDP packages**:
   ```bash
   npm install @coinbase/cdp-react @coinbase/cdp-core @coinbase/cdp-hooks
   ```

2. **Update WagmiProvider.tsx**:
   ```typescript
   import { CDPReactProvider } from "@coinbase/cdp-react";
   
   const CDP_CONFIG = {
     projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
   };
   
   const APP_CONFIG = {
     name: "Chess Clash",
     logoUrl: "https://your-logo.com/logo.png",
     authMethods: ["email"],
   };
   
   export function WagmiProvider({ children }) {
     return (
       <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG}>
         {children}
       </CDPReactProvider>
     );
   }
   ```

3. **Add CDP environment variable**:
   ```env
   NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id
   ```

4. **Update hooks to use CDP**:
   Replace `useEmbeddedWallet()` calls with CDP hooks:
   ```typescript
   import { useEvmAddress, useIsSignedIn, useSendEvmTransaction } from '@coinbase/cdp-hooks';
   ```

## Demo Flow

### 1. Connect Wallet
1. Click "Connect Wallet" to initialize the embedded wallet
2. The mock wallet will be automatically connected

### 2. Faucet Tokens
1. Navigate to `/players`
2. For each player token you want to use:
   - Enter amount (e.g., 1000)
   - Click "Faucet" to mint tokens
   - Click "Approve" to allow staking

## Player Images Setup

The application includes support for player profile images. To add images:

1. **Run the setup script**:
   ```bash
   ./scripts/prepare-images.sh
   ```

2. **Add your images** to `public/images/players/`:
   - `1.jpg` - Magnus Carlsen
   - `2.jpg` - Gukesh D
   - `3.jpg` - Hikaru Nakamura
   - `4.jpg` - Ding Liren
   - `5.jpg` - Fabiano Caruana
   - `6.jpg` - R Praggnanandhaa
   - `7.jpg` - Alireza Firouzja
   - `8.jpg` - Ian Nepomniachtchi
   - `placeholder.jpg` - Fallback image

3. **Image requirements**:
   - Format: JPG
   - Size: 256x256 pixels (square)
   - File size: Under 100KB

4. **Restart the development server** after adding images

### 3. Create a Challenge
1. Go to the home page (`/`)
2. Click "Create Challenge"
3. Fill in:
   - Challenge statement (e.g., "Magnus Carlsen will win the next World Chess Championship")
   - Select Token A (your preferred token)
   - Enter stake amount
4. Click "Create & Stake"

### 4. Counter a Challenge
1. On the home page, find an open challenge
2. Click "Counter" or "Stake B"
3. Select Token B (different from Token A)
4. Enter stake amount
5. Click "Counter with B"

### 5. Resolve Challenge (Admin)
1. Navigate to `/admin` (must be contract owner)
2. Select winner (Side A or Side B)
3. Click "Resolve Challenge"

### 6. Claim Winnings
1. Go to challenge detail page
2. If you staked on the winning side, click "Claim Winnings"
3. Verify your balance increased

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Navigation.tsx    # Main navigation
│   ├── WalletConnectButton.tsx
│   ├── PlayerCard.tsx
│   ├── ChallengeCard.tsx
│   └── CreateChallengeForm.tsx
├── lib/                  # Utilities and configuration
│   ├── contracts/        # Contract ABIs and addresses
│   ├── hooks.ts          # Custom wagmi hooks
│   ├── store.ts          # Zustand store
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Utility functions
│   └── wagmi.ts          # wagmi configuration
└── public/               # Static assets
```

## Contract Integration

The frontend integrates with these smart contracts:

- **PlayerTokenFactory**: Manages player token creation and roster
- **PlayerToken**: Individual ERC20 tokens with faucet functionality
- **ChallengeEscrow**: Core challenge management and staking
- **SwapAdapter**: Token swapping (for future use)

## Development

### Adding New Components
1. Create component in `components/`
2. Import and use in pages
3. Follow shadcn/ui patterns for consistency

### Contract Interactions
1. Add new hooks in `lib/contracts/hooks.ts`
2. Use viem's `publicClient.readContract` and `walletClient.sendTransaction`
3. Handle loading states and errors

### State Management
- Use Zustand store for global state
- Use React state for component-specific state
- Use embedded wallet context for blockchain state

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Deploy to your preferred hosting platform

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Check if the embedded wallet provider is properly configured
   - Try refreshing the page
   - Check browser console for errors

2. **Contract Calls Fail**
   - Verify contract addresses in `.env.local`
   - Check if contracts are deployed on Base Sepolia
   - Ensure you have sufficient gas fees

3. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run lint`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details