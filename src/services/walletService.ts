import {
    MobileWallet,
    transact
} from '@solana-mobile/mobile-wallet-adapter-protocol';
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey
} from '@solana/web3.js';
import 'react-native-get-random-values';

// Base64 to Base58 conversion utility for React Native
function base64ToBase58(base64String: string): string {
  try {
    // Remove padding if present
    const cleanBase64 = base64String.replace(/=/g, '');
    
    // Convert base64 to bytes using a simpler approach
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes: number[] = [];
    
    for (let i = 0; i < cleanBase64.length; i += 4) {
      const chunk = cleanBase64.slice(i, i + 4);
      let value = 0;
      
      for (let j = 0; j < chunk.length; j++) {
        const char = chunk[j];
        const index = base64Chars.indexOf(char);
        if (index === -1) continue;
        value = (value << 6) | index;
      }
      
      // Extract bytes from the 24-bit value
      if (chunk.length >= 2) bytes.push((value >> 16) & 0xFF);
      if (chunk.length >= 3) bytes.push((value >> 8) & 0xFF);
      if (chunk.length >= 4) bytes.push(value & 0xFF);
    }
    
    // Convert to base58
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt('0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join(''));
    let result = '';
    
    while (num > 0) {
      result = base58Chars[Number(num % BigInt(58))] + result;
      num = num / BigInt(58);
    }
    
    // Add leading zeros for each leading zero byte
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
      result = '1' + result;
    }
    
    console.log('Base64 input:', base64String);
    console.log('Decoded bytes:', bytes);
    console.log('Base58 result:', result);
    
    return result;
  } catch (error) {
    console.error('Error converting base64 to base58:', error);
    throw new Error('Failed to convert address format');
  }
}

export interface WalletConnection {
  publicKey: PublicKey;
  connected: boolean;
  authToken: string;
}

export class WalletService {
  private connection: Connection;
  private wallet: MobileWallet | null = null;
  private authToken: string | null = null;
  private connectedPublicKey: PublicKey | null = null;

  constructor() {
    // Initialize connection to Solana devnet
    this.connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );
  }

  /**
   * Connect to a mobile wallet using Solana Mobile Wallet Adapter
   */
  async connectWallet(): Promise<WalletConnection> {
    try {
      // Start a new session with the mobile wallet
      const result = await transact(async (wallet) => {
        this.wallet = wallet;
        
        console.log('Wallet instance obtained:', !!wallet);
        
        // Request authorization from the wallet
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Sleek App',
            uri: 'https://sleek.app',
          },
        });

        // Debug: Log the auth result structure
        console.log('Auth result structure:', {
          hasAccounts: !!authResult.accounts,
          accountsLength: authResult.accounts?.length,
          hasAuthToken: !!authResult.auth_token,
        });

        // Get the first account from the authorized accounts
        const account = authResult.accounts?.[0];
        if (!account) {
          throw new Error('No accounts found in authorization result');
        }

        // Debug: Log the account structure
        console.log('Account structure:', {
          hasAddress: !!account.address,
          addressType: typeof account.address,
          addressValue: account.address,
        });

        // Validate and create PublicKey from the account address
        let publicKey: PublicKey;
        try {
          // Check if the address is a valid string
          if (!account.address || typeof account.address !== 'string') {
            throw new Error(`Invalid account address format: ${typeof account.address}`);
          }
          
          // Trim any whitespace
          const cleanAddress = account.address.trim();
          
          // Check if it's base64 encoded (contains = or + or /)
          const isBase64 = /[=+/]/.test(cleanAddress);
          
          let finalAddress: string;
          
          if (isBase64) {
            console.log('Detected base64 address, converting to base58...');
            finalAddress = base64ToBase58(cleanAddress);
            console.log('Converted address:', finalAddress);
          } else {
            finalAddress = cleanAddress;
          }
          
          // Validate base58 format (basic check)
          const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
          if (!base58Regex.test(finalAddress)) {
            throw new Error(`Account address contains invalid base58 characters: ${finalAddress}`);
          }
          
          // Check length (Solana addresses are typically 32-50 characters)
          if (finalAddress.length < 32 || finalAddress.length > 50) {
            throw new Error(`Account address has invalid length: ${finalAddress.length}`);
          }
          
          publicKey = new PublicKey(finalAddress);
          console.log('Successfully created PublicKey:', publicKey.toString());
        } catch (error) {
          console.error('Error creating PublicKey from address:', error);
          console.error('Raw account address:', account.address);
          throw new Error(`Invalid wallet address: ${account.address}`);
        }

        this.authToken = authResult.auth_token;
        this.connectedPublicKey = publicKey;

        return {
          publicKey: this.connectedPublicKey,
          connected: true,
          authToken: authResult.auth_token,
        };
      });

      return result;
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('No mobile wallet')) {
        throw new Error('No Solana mobile wallet found. Please install a wallet like Phantom or Solflare from the app store.');
      } else if (errorMessage.includes('User rejected')) {
        throw new Error('Wallet connection was cancelled by the user.');
      } else if (errorMessage.includes('Non-base58')) {
        throw new Error('Invalid wallet address format. Please try again.');
      } else if (errorMessage.includes('No accounts found')) {
        throw new Error('No wallet accounts available. Please make sure your wallet has at least one account.');
      } else if (errorMessage.includes('transact')) {
        throw new Error('No Solana mobile wallet found. Please install a wallet like Phantom or Solflare from the app store.');
      } else {
        throw new Error('Failed to connect wallet. Please make sure you have a Solana wallet app installed (like Phantom, Solflare, Backpack, or Glow).');
      }
    }
  }

  /**
   * Disconnect from the wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      if (this.wallet && this.authToken) {
        await transact(async (wallet) => {
          await wallet.deauthorize({
            auth_token: this.authToken!,
          });
        });
        this.wallet = null;
        this.authToken = null;
        this.connectedPublicKey = null;
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }

  /**
   * Get the current wallet balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet !== null && this.authToken !== null;
  }

  /**
   * Get the current wallet instance
   */
  getWallet(): MobileWallet | null {
    return this.wallet;
  }

  /**
   * Get the auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Get the connected public key
   */
  getConnectedPublicKey(): PublicKey | null {
    return this.connectedPublicKey;
  }

  /**
   * Test if mobile wallet adapter is available
   */
  async testWalletAvailability(): Promise<boolean> {
    try {
      await transact(async (wallet) => {
        console.log('Mobile wallet adapter is available');
        return true;
      });
      return true;
    } catch (error) {
      console.error('Mobile wallet adapter not available:', error);
      return false;
    }
  }

  /**
   * Get available wallet apps
   */
  async getAvailableWallets(): Promise<string[]> {
    try {
      // This is a simplified check - in a real implementation,
      // you might want to check for specific wallet apps
      const availableWallets = [
        'Phantom',
        'Solflare', 
        'Backpack',
        'Glow',
        'Exodus',
        'Trust Wallet'
      ];
      
      console.log('Available wallet apps to check:', availableWallets);
      return availableWallets;
    } catch (error) {
      console.error('Error getting available wallets:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const walletService = new WalletService(); 