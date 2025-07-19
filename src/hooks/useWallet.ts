import { PublicKey } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { WalletConnection, walletService } from '../services/walletService';

export interface UseWalletReturn {
  wallet: WalletConnection | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: (publicKey: PublicKey) => Promise<number>;
  testWalletAvailability: () => Promise<boolean>;
  getAvailableWallets: () => Promise<string[]>;
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      const connection = await walletService.connectWallet();
      setWallet(connection);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnectWallet();
      setWallet(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, []);

  const getBalance = useCallback(async (publicKey: PublicKey): Promise<number> => {
    return await walletService.getBalance(publicKey);
  }, []);

  const testWalletAvailability = useCallback(async (): Promise<boolean> => {
    return await walletService.testWalletAvailability();
  }, []);

  const getAvailableWallets = useCallback(async (): Promise<string[]> => {
    return await walletService.getAvailableWallets();
  }, []);

  return {
    wallet,
    isConnecting,
    isConnected: walletService.isConnected(),
    connect,
    disconnect,
    getBalance,
    testWalletAvailability,
    getAvailableWallets,
  };
}; 