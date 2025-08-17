# Chess Clash - Token-Backed Challenges

A Next.js 14 application for creating and participating in token-backed chess challenges on Base Sepolia.

## Features

- **Embedded Wallets**: Seamless wallet creation and management using Privy
- **Email/SMS Authentication**: Easy login with email or phone number
- **Player Tokens**: Get test tokens for chess players (Magnus, Gukesh, etc.)
- **Challenge Creation**: Create challenges between two player tokens
- **Staking System**: Stake tokens on either side of a challenge
- **Admin Panel**: Resolve challenges and manage the platform
- **Real-time Updates**: Live data from Base Sepolia testnet

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Wallet Integration**: Privy (embedded wallets + authentication)
- **Blockchain**: Base Sepolia testnet
- **Smart Contracts**: Solidity with OpenZeppelin
- **State Management**: Zustand
- **Notifications**: react-hot-toast

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd chess-clash/frontend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_FACTORY_ADDR=0xf86044C75e6590e898356458013e8AA476b7d634
NEXT_PUBLIC_ESCROW_ADDR=0xF9c42Ea099F9E60Cc9db63E4a4D89056E7c4f26B
NEXT_PUBLIC_ORACLE_ADDR=0xa01D832944EF77E7db03f686B919c39151a973F2
NEXT_PUBLIC_AMM_ROUTER_ADDR=0x7d777B8B74f760B29f349b4745237893fFaB7Dca

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532 # Base Sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### 3. Privy Setup

1. Go to [Privy Console](https://console.privy.io/)
2. Create a new app
3. Copy your App ID and add it to `NEXT_PUBLIC_PRIVY_APP_ID`
4. Configure authentication methods (email, SMS) in the Privy dashboard

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### 1. Connect Wallet
- Click "Connect Wallet" in the navigation
- Enter your email or phone number
- Complete the verification process
- Privy will automatically create an embedded wallet for you

### 2. Get Player Tokens
- Navigate to the "Players" page
- Use the faucet to mint test tokens for chess players
- Approve tokens for staking in challenges

### 3. Create Challenges
- Go to the home page and click "Create Challenge"
- Select two players to compete
- Add a description and stake amount
- Submit the challenge

### 4. Participate in Challenges
- Browse active challenges on the home page
- Click on a challenge to view details
- Stake tokens on either player A or player B

### 5. Admin Functions
- Access the admin panel to resolve ended challenges
- Select the winner and trigger the resolution process
- Winners can claim their tokens after resolution

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── challenge/[id]/    # Challenge detail page
│   ├── players/           # Player tokens page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Navigation.tsx    # Main navigation
│   ├── PrivyProvider.tsx # Privy provider setup
│   ├── PrivyWalletButton.tsx # Wallet connection button
│   └── ...
├── lib/                  # Utility libraries
│   ├── contracts/        # Contract interactions
│   │   ├── abis/        # Contract ABIs
│   │   ├── addresses.ts # Contract addresses
│   │   └── hooks.ts     # Contract hooks
│   ├── privy-hooks.ts   # Privy integration hooks
│   ├── store.ts         # Zustand state management
│   ├── types.ts         # TypeScript types
│   ├── utils.ts         # Utility functions
│   └── wagmi.ts         # Viem client setup
└── public/              # Static assets
```

## Smart Contracts

The application interacts with several smart contracts on Base Sepolia:

- **PlayerTokenFactory**: Creates and manages player tokens
- **PlayerToken**: Individual player tokens with faucet functionality
- **ChallengeEscrow**: Manages challenges, staking, and resolution
- **MockOracle**: Provides challenge resolution data
- **MockAMMRouter**: Handles token swaps for price discovery

## Development

### Adding New Features

1. **New Pages**: Add to `app/` directory
2. **Components**: Add to `components/` directory
3. **Contract Interactions**: Add hooks to `lib/contracts/hooks.ts`
4. **Types**: Update `lib/types.ts`

### Testing

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## Demo Flow

1. **Connect Wallet**: Use email authentication to create an embedded wallet
2. **Get Tokens**: Visit Players page and mint test tokens
3. **Create Challenge**: Create a challenge between Magnus and Gukesh
4. **Stake Tokens**: Stake tokens on either player
5. **Resolve Challenge**: Use admin panel to resolve the challenge
6. **Claim Winnings**: Winners claim their tokens

## Troubleshooting

### Common Issues

1. **"Privy App ID not configured"**
   - Make sure `NEXT_PUBLIC_PRIVY_APP_ID` is set in `.env.local`

2. **"No player tokens found"**
   - Ensure the factory contract is deployed and tokens are created
   - Check that contract addresses are correct

3. **Transaction failures**
   - Verify you're connected to Base Sepolia
   - Ensure you have sufficient tokens for staking
   - Check that tokens are approved for the escrow contract

### Getting Help

- Check the browser console for error messages
- Verify contract addresses are correct
- Ensure Privy app is properly configured
- Check that you're on the correct network (Base Sepolia)

## License

MIT License - see LICENSE file for details.