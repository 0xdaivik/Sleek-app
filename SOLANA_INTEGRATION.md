# Solana Mobile Wallet Adapter Integration

This document explains the Solana Mobile Wallet Adapter integration in the Sleek app.

## Overview

The app now includes Solana Mobile Wallet Adapter integration, allowing users to connect their Solana wallets (like Phantom, Solflare, etc.) directly from the mobile app.

## Features

- **Wallet Connection**: Connect to Solana mobile wallets using the Mobile Wallet Adapter protocol
- **Wallet Disconnection**: Safely disconnect from connected wallets
- **Balance Checking**: Get wallet balances (when connected)
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Debug Information**: Detailed logging for troubleshooting connection issues

## Architecture

### Components

1. **WalletService** (`src/services/walletService.ts`)
   - Core wallet functionality
   - Handles connection, disconnection, and balance queries
   - Uses Solana Mobile Wallet Adapter protocol
   - Includes robust error handling and address validation

2. **useWallet Hook** (`src/hooks/useWallet.ts`)
   - React hook for wallet state management
   - Provides easy-to-use interface for components

3. **Onboarding Screen** (`app/onboarding-screen.tsx`)
   - Updated to include wallet connection functionality
   - Shows connection status and wallet address

4. **WalletDemo Component** (`src/components/WalletDemo.tsx`)
   - Demo component showing advanced wallet features
   - Includes balance checking and detailed instructions

5. **WalletTest Component** (`src/components/WalletTest.tsx`)
   - Debug component for troubleshooting connection issues
   - Provides detailed error information and logging

## Dependencies

The following packages have been added:

```json
{
  "@solana/web3.js": "^1.91.0",
  "@solana/wallet-adapter-base": "^0.9.27",
  "@solana/wallet-adapter-react": "^0.15.37",
  "@solana/wallet-adapter-react-ui": "^0.9.37",
  "@solana/wallet-adapter-wallets": "^0.19.37",
  "@solana-mobile/mobile-wallet-adapter-protocol": "^2.2.2",
  "@solana-mobile/mobile-wallet-adapter-protocol-web3js": "^2.2.2",
  "@solana-mobile/wallet-adapter-mobile": "^2.2.2",
  "react-native-get-random-values": "^1.0.0"
}
```

## Usage

### Basic Wallet Connection

```typescript
import { useWallet } from '../src/hooks/useWallet';

const MyComponent = () => {
  const { wallet, isConnecting, isConnected, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      console.log('Wallet connected!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleConnect}>
      <Text>{isConnected ? 'Disconnect' : 'Connect Wallet'}</Text>
    </TouchableOpacity>
  );
};
```

### Getting Wallet Balance

```typescript
import { useWallet } from '../src/hooks/useWallet';

const MyComponent = () => {
  const { wallet, getBalance } = useWallet();

  const checkBalance = async () => {
    if (wallet) {
      const balance = await getBalance(wallet.publicKey);
      console.log(`Balance: ${balance} SOL`);
    }
  };

  return (
    <TouchableOpacity onPress={checkBalance}>
      <Text>Check Balance</Text>
    </TouchableOpacity>
  );
};
```

## Configuration

### App Configuration

The `app.json` has been updated to include:

- Bundle identifiers for iOS and Android
- Intent filters for deep linking
- Proper scheme configuration

### Network Configuration

The wallet service is configured to use Solana Devnet by default:

```typescript
this.connection = new Connection(
  'https://api.devnet.solana.com',
  'confirmed'
);
```

To switch to mainnet, change the URL to:
```typescript
'https://api.mainnet-beta.solana.com'
```

## File Structure

```
src/
├── services/
│   └── walletService.ts      # Core wallet functionality
├── hooks/
│   └── useWallet.ts          # React hook for wallet state
└── components/
    ├── WalletDemo.tsx        # Demo component
    └── WalletTest.tsx        # Debug component

app/
└── onboarding-screen.tsx     # Updated onboarding with wallet integration
```

## Supported Wallets

The integration supports any mobile wallet that implements the Solana Mobile Wallet Adapter protocol, including:

- Phantom
- Solflare
- Backpack
- Glow
- And other compatible wallets

## Error Handling

The integration includes comprehensive error handling:

- Connection failures
- Network issues
- Wallet not found
- User cancellation
- Invalid address formats
- Base58 validation errors

All errors are displayed to the user with helpful messages.

## Recent Fixes

### Issues Resolved:

1. **Route Warnings**: Moved service files from `app/` to `src/` to prevent Expo Router from treating them as routes
2. **Icon URI Error**: Removed the problematic icon URI from the identity configuration
3. **Import Paths**: Updated all import paths to reflect the new file structure
4. **Linting Issues**: Fixed unescaped entities in the demo component
5. **Non-base58 Character Error**: Added robust address validation and error handling
6. **TypeScript Errors**: Fixed error type handling in catch blocks

### Current Status:

✅ **No Route Warnings** - Files are properly organized  
✅ **No Protocol Errors** - Identity configuration is simplified  
✅ **Clean Linting** - All linting issues resolved  
✅ **Address Validation** - Robust validation for wallet addresses  
✅ **Error Handling** - Comprehensive error messages  
✅ **Debug Capabilities** - Detailed logging for troubleshooting  

## Testing

To test the wallet integration:

1. Install a Solana mobile wallet (e.g., Phantom) on your device
2. Run the app: `npm run android` or `npm run ios`
3. Tap "Connect Wallet" on the onboarding screen
4. Follow the wallet app's authorization flow

### Debug Testing

For detailed debugging, use the `WalletTest` component which provides:
- Real-time debug information
- Detailed error logging
- Step-by-step connection tracking
- Clear error messages

## Troubleshooting

### Common Issues

1. **"No wallet found"**: Make sure you have a Solana mobile wallet installed
2. **"Connection failed"**: Check your internet connection
3. **"Authorization denied"**: User cancelled the connection in their wallet app
4. **"Non-base58 character"**: The wallet address format is invalid (now handled with better validation)

### Debug Mode

Enable debug logging by adding to your component:

```typescript
console.log('Wallet state:', { wallet, isConnected, isConnecting });
```

Or use the `WalletTest` component for detailed debugging.

## Security Considerations

- The app only requests read permissions by default
- Transaction signing requires explicit user approval
- Auth tokens are stored securely and cleared on disconnect
- No private keys are ever stored in the app
- Address validation prevents malformed wallet addresses

## Future Enhancements

Potential future features:

- Transaction signing and sending
- Token transfers
- NFT interactions
- Multi-wallet support
- Wallet switching
- Transaction history

## Resources

- [Solana Mobile Wallet Adapter Documentation](https://docs.solanamobile.com/mobile-wallet-adapter/overview)
- [Solana Web3.js Documentation](https://docs.solana.com/developing/clients/javascript-api)
- [React Native Crypto](https://github.com/react-native-crypto/react-native-crypto) 