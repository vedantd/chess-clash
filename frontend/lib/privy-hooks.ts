import { usePrivy, useSendTransaction, useWallets } from '@privy-io/react-auth';
import { useCallback } from 'react';
import { baseSepolia } from 'viem/chains';
import { publicClient } from './wagmi';

// Custom hook to replace the embedded wallet functionality
export function usePrivyWallet() {
  const { user, authenticated, ready } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();

  const account = useCallback(() => {
    if (!authenticated || !wallets || wallets.length === 0) return null;
    return {
      address: wallets[0].address as `0x${string}`,
    };
  }, [authenticated, wallets]);

  const walletClient = useCallback(() => {
    if (!authenticated || !wallets || wallets.length === 0) return null;
    
    // Return a mock wallet client that uses Privy's sendTransaction
    return {
      sendTransaction: async (params: any) => {
        if (!wallets || wallets.length === 0) throw new Error('No wallet available');
        
        console.log('Sending transaction with params:', {
          to: params.to,
          data: params.data,
          from: wallets[0].address,
        });
        
        try {
          // Use a reasonable gas limit for contract interactions
          const gasLimit = 500000n; // 500k gas should be enough for most contract calls
          console.log('Using fixed gas limit:', gasLimit);
          
          // Use Privy's sendTransaction method with fixed gas limit
          const result = await sendTransaction({
            to: params.to,
            data: params.data,
            chainId: baseSepolia.id,
            gasLimit: gasLimit,
          }, {
            address: wallets[0].address,
          });
          
          console.log('Transaction submitted successfully:', result.hash);
          
          // Wait for transaction to be mined and check for errors
          try {
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: result.hash,
            });
            
            if (receipt.status === 'success') {
              console.log('Transaction succeeded:', receipt);
            } else {
              console.error('Transaction failed:', receipt);
              throw new Error('Transaction failed on-chain');
            }
          } catch (receiptError) {
            console.error('Error waiting for transaction receipt:', receiptError);
            throw receiptError;
          }
          
          return result.hash;
        } catch (error) {
          console.error('Transaction error details:', error);
          throw error;
        }
      },
    };
  }, [authenticated, wallets, sendTransaction]);

  const isConnected = authenticated && ready;

  return {
    account: account(),
    walletClient: walletClient(),
    isConnected,
    ready,
  };
}

// Hook to get user's wallet address
export function usePrivyAddress() {
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  
  return {
    address: authenticated && wallets && wallets.length > 0 ? wallets[0].address as `0x${string}` : undefined,
  };
}

// Hook to check if user is authenticated
export function usePrivyAuth() {
  const { authenticated, ready } = usePrivy();
  
  return {
    isAuthenticated: authenticated,
    ready,
  };
}
