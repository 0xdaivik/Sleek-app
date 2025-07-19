# 🚀 Sleek - Fullstack Subscription Management Platform

A complete fullstack application built with **React Native (Expo)** frontend and **Solana blockchain** backend for subscription management with BONK cashback rewards.

## 📋 Overview

Sleek is a comprehensive subscription management platform that combines:
- **Frontend**: React Native mobile app with Expo Router
- **Backend**: Solana smart contracts for on-chain operations
- **Features**: Real SOL payments, BONK cashback rewards, subscription NFTs, and wallet integration

### Key Features
- ✅ **Cross-platform mobile app** - iOS and Android support
- ✅ **Real SOL payments** - No dummy transactions
- ✅ **BONK token integration** - 10% cashback rewards
- ✅ **Subscription NFTs** - On-chain subscription tracking
- ✅ **Wallet integration** - Phantom, Solflare, and other Solana wallets
- ✅ **Modern UI/UX** - Beautiful, responsive design
- ✅ **Secure PDAs** - Program Derived Addresses for data storage
- ✅ **Comprehensive testing** - Full test coverage

## 🏗️ Architecture

### Frontend (React Native + Expo)
```
app/
├── _layout.tsx              # Root layout with navigation
├── index.tsx                # Welcome screen
├── onboarding-screen.tsx    # User onboarding
└── tabs/                    # Main app tabs
    ├── _layout.tsx          # Tab navigation layout
    ├── home.tsx             # Home dashboard
    ├── sleek.tsx            # Subscription management
    ├── rewards.tsx          # Cashback rewards
    └── account.tsx          # User account
```

### Backend (Solana Smart Contracts)
```
programs/sleek/
├── src/lib.rs               # Main smart contract logic
└── Cargo.toml               # Rust dependencies
```

### Services Layer
```
src/
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks
├── services/                # Business logic services
│   ├── walletService.ts     # Wallet integration
│   ├── subscriptionService.ts # Subscription management
│   └── cashbackService.ts   # Cashback operations
└── types/                   # TypeScript type definitions
```

## 🛠️ Setup Instructions

### Prerequisites
```bash
# Install Node.js (v18 or higher)
node --version

# Install Expo CLI
npm install -g @expo/cli

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
npm install -g @coral-xyz/anchor-cli
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Backend Setup
```bash
# Create Solana wallet
solana-keygen new

# Set cluster to devnet
solana config set --url devnet

# Get devnet SOL
solana airdrop 2

# Build the program
anchor build

# Deploy to devnet
anchor deploy

# Run tests
anchor test
```

## 📱 Mobile App Features

### Screens & Navigation
- **Welcome Screen**: App introduction and onboarding
- **Home Dashboard**: Overview of subscriptions and rewards
- **Subscription Management**: Browse and manage subscriptions
- **Rewards Center**: View and redeem BONK cashback
- **Account Settings**: Wallet connection and preferences

### Wallet Integration
- Support for Phantom, Solflare, and other Solana wallets
- Secure transaction signing
- Real-time balance updates
- Transaction history tracking

### UI/UX Highlights
- Modern gradient designs
- Smooth animations and transitions
- Dark mode support
- Responsive layouts for all screen sizes
- Intuitive navigation with Expo Router

## 🔧 Smart Contract Functions

### Core Functions

#### `initialize()`
- Initializes the Sleek program
- Sets up global state and authority
- Must be called before any other operations

#### `process_subscription_payment(subscription_id, amount, sol_amount)`
- Processes real SOL payment for subscriptions
- Automatically mints 10% BONK cashback to user
- Creates subscription NFT on-chain
- Updates global statistics and emits events

#### `redeem_cashback(amount)`
- Burns BONK tokens from user wallet
- Records redemption transaction
- Emits redemption event for tracking

#### `cancel_subscription()`
- Cancels active subscription
- Updates subscription status on-chain
- Records cancellation date

#### `get_cashback_balance()`
- Returns user's current BONK token balance
- View-only function for balance checking

## 📊 Data Structures

### Global State
```rust
pub struct SleekState {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_subscriptions: u64,
    pub total_payments: u64,
    pub total_cashback_minted: u64,
}
```

### Payment Records
```rust
pub struct Payment {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub sol_amount: u64,
    pub status: PaymentStatus,
    pub timestamp: i64,
    pub bump: u8,
}
```

### Subscription NFTs
```rust
pub struct Subscription {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub status: SubscriptionStatus,
    pub activation_date: i64,
    pub expiration_date: i64,
    pub cancellation_date: Option<i64>,
    pub bump: u8,
}
```

## 🔗 Frontend-Backend Integration

### Wallet Service Integration
```typescript
// Real SOL transaction processing
const processPayment = async (subscription) => {
  const sleekClient = new SleekClient(connection, wallet, BONK_MINT_ADDRESS);
  
  const tx = await sleekClient.processSubscriptionPayment(
    subscription.id,
    subscription.price * 100, // Convert to cents
    subscription.solPrice * LAMPORTS_PER_SOL
  );
  
  return { success: true, transactionHash: tx };
};
```

### Cashback Service Integration
```typescript
// On-chain BONK token management
const earnCashback = async (subscriptionName, price) => {
  const cashbackAmount = price * 0.10;
  // BONK tokens are automatically minted in smart contract
  return cashbackAmount;
};
```

### Subscription Service Integration
```typescript
// On-chain subscription management
const activateSubscription = async (subscription) => {
  const sleekClient = new SleekClient(connection, wallet, BONK_MINT_ADDRESS);
  
  // Payment and subscription creation happen in one transaction
  const tx = await sleekClient.processSubscriptionPayment(
    subscription.id,
    subscription.price * 100,
    subscription.solPrice * LAMPORTS_PER_SOL
  );
  
  return { success: true, transactionHash: tx };
};
```

## 🔐 Security Features

### Frontend Security
- Secure wallet connection handling
- Input validation and sanitization
- Error boundary implementation
- Secure storage for sensitive data

### Backend Security
- **PDA Security**: All accounts use Program Derived Addresses
- **Access Control**: Role-based permissions and ownership checks
- **Error Handling**: Comprehensive error codes and validation
- **Transaction Security**: Proper signature verification

## 🧪 Testing

### Frontend Testing
```bash
# Run Expo tests
npx expo test

# Run specific test file
npx expo test --testNamePattern="WalletService"
```

### Backend Testing
```bash
# Run all smart contract tests
anchor test

# Run specific test
anchor test --skip-local-validator
```

### Test Coverage
- ✅ Frontend component rendering
- ✅ Wallet integration flows
- ✅ Smart contract initialization
- ✅ Subscription payment processing
- ✅ BONK cashback minting
- ✅ Cashback redemption
- ✅ Subscription cancellation
- ✅ Error handling and edge cases

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Deploy to app stores
npx expo submit:android
npx expo submit:ios
```

### Backend Deployment

#### Devnet Deployment
```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize program
npm run deploy
```

#### Mainnet Deployment
```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## 📈 Analytics & Monitoring

### Frontend Analytics
- User engagement tracking
- Screen flow analysis
- Error reporting and crash analytics
- Performance monitoring

### Backend Analytics
- Transaction volume tracking
- Smart contract usage statistics
- Gas usage optimization
- Event emission for external monitoring

## 🔄 Events & Notifications

### Smart Contract Events
```rust
pub struct PaymentProcessed {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub cashback_amount: u64,
}

pub struct CashbackRedeemed {
    pub user: Pubkey,
    pub amount: u64,
}

pub struct SubscriptionCancelled {
    pub user: Pubkey,
    pub subscription_id: u64,
}
```

### Frontend Notifications
- Real-time transaction status updates
- Push notifications for cashback rewards
- Subscription renewal reminders
- Error notifications and retry prompts

## 🎯 Development Roadmap

### Phase 1: Core Features ✅
- [x] React Native mobile app
- [x] Solana smart contracts
- [x] Wallet integration
- [x] Basic subscription management
- [x] BONK cashback system

### Phase 2: Advanced Features 🚧
- [ ] Multi-token support (SOL, BONK, USDC)
- [ ] Subscription tiers and pricing
- [ ] Referral system with rewards
- [ ] Advanced analytics dashboard
- [ ] Push notifications

### Phase 3: Production Features 📋
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Production monitoring
- [ ] User onboarding flow
- [ ] Performance optimization

## 🛠️ Development Commands

### Frontend Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android

# Build for production
npx expo build:android
npx expo build:ios

# Eject to bare React Native
npx expo eject
```

### Backend Development
```bash
# Build smart contracts
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy

# Generate IDL
anchor idl
```

### Fullstack Development
```bash
# Install all dependencies
npm install

# Run both frontend and backend tests
npm run test:all

# Build everything
npm run build:all
```

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Check the inline code comments
- 🐛 **Issues**: Create an issue on GitHub
- 💬 **Discussions**: Join our community discussions
- 📧 **Contact**: Reach out to the development team

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React Native, Expo, and Solana**

*Sleek - Where subscriptions meet blockchain rewards*
