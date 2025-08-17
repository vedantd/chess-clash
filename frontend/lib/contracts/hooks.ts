import { encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useState, useCallback, useEffect } from 'react';
import { CONTRACTS } from './addresses';
import { Player, Challenge, UserStake } from '../types';
import { publicClient } from '../wagmi';
import { useEmbeddedWallet } from '../../components/WagmiProvider';

// Import actual ABIs
import PlayerTokenABI from './abis/PlayerToken.json';
import PlayerTokenFactoryABI from './abis/PlayerTokenFactory.json';
import ChallengeEscrowABI from './abis/ChallengeEscrow.json';

// Use the ABIs directly since they are already arrays
const playerTokenABI = PlayerTokenABI as any;
const playerTokenFactoryABI = PlayerTokenFactoryABI as any;
const challengeEscrowABI = ChallengeEscrowABI as any;

// Helper function for async data
function useAsyncData<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, isLoading, error, refetch };
}

// Embedded wallet hooks
export const useGetEvmAddress = () => {
  const { account } = useEmbeddedWallet();
  return { evmAddress: account?.address };
};

export const useGetIsSignedIn = () => {
  const { isConnected } = useEmbeddedWallet();
  return { isSignedIn: isConnected };
};

// Factory hooks
export const useGetAllPlayers = () => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      console.log('Fetching players from factory:', CONTRACTS.FACTORY_ADDR);
      console.log('Using ABI:', playerTokenFactoryABI);
      
      const result = await publicClient.readContract({
        address: CONTRACTS.FACTORY_ADDR,
        abi: playerTokenFactoryABI,
        functionName: 'getAllPlayers',
        args: [],
      });
      
      console.log('Players fetched successfully:', result);
      return result;
    } catch (err) {
      console.error('Error fetching players:', err);
      return [];
    }
  });

  return { data, isLoading, error, refetch };
};

// PlayerToken hooks
export const useTokenBalance = (tokenAddress: `0x${string}`, userAddress?: `0x${string}`) => {
  const { account } = useEmbeddedWallet();
  const targetAddress = userAddress || account?.address;
  
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!targetAddress) return 0n;
    
    try {
      return await publicClient.readContract({
        address: tokenAddress,
        abi: playerTokenABI,
        functionName: 'balanceOf',
        args: [targetAddress],
      });
    } catch (err) {
      console.error('Error fetching balance:', err);
      return 0n;
    }
  }, [targetAddress, tokenAddress]);

  return { data, isLoading, error, refetch };
};

export const useTokenAllowance = (tokenAddress: `0x${string}`, spender: `0x${string}`, userAddress?: `0x${string}`) => {
  const { account } = useEmbeddedWallet();
  const targetAddress = userAddress || account?.address;
  
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!targetAddress || !spender) return 0n;
    
    try {
      return await publicClient.readContract({
        address: tokenAddress,
        abi: playerTokenABI,
        functionName: 'allowance',
        args: [targetAddress, spender],
      });
    } catch (err) {
      console.error('Error fetching allowance:', err);
      return 0n;
    }
  }, [targetAddress, spender, tokenAddress]);

  return { data, isLoading, error, refetch };
};

// Transaction hooks using embedded wallet
export const useFaucetMint = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const mint = async (tokenAddress: `0x${string}`, amount: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: playerTokenABI,
        functionName: 'faucetMint',
        args: [amount],
      }),
      chain: baseSepolia,
    });
  };
  return { mint };
};

export const useApproveToken = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: playerTokenABI,
        functionName: 'approve',
        args: [spender, amount],
      }),
      chain: baseSepolia,
    });
  };
  return { approve };
};

// Challenge hooks
export const useGetChallenge = (challengeId: bigint) => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'getChallenge',
        args: [challengeId],
      });
    } catch (err) {
      console.error('Error fetching challenge:', err);
      return null;
    }
  }, [challengeId]);

  return { data, isLoading, error, refetch };
};

export const useGetUserStake = (challengeId: bigint, userAddress?: `0x${string}`) => {
  const { account } = useEmbeddedWallet();
  const targetAddress = userAddress || account?.address;
  
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!targetAddress) return null;
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'getUserStake',
        args: [challengeId, targetAddress],
      });
    } catch (err) {
      console.error('Error fetching user stake:', err);
      return null;
    }
  }, [challengeId, targetAddress]);

  return { data, isLoading, error, refetch };
};

export const useTotalChallenges = () => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'totalChallenges',
        args: [],
      });
    } catch (err) {
      console.error('Error fetching total challenges:', err);
      return 0n;
    }
  });

  return { data, isLoading, error, refetch };
};

// Challenge creation and staking hooks
export const useCreateChallenge = () => {
  const { walletClient, account } = useEmbeddedWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createChallenge = useCallback(async (
    playerA: `0x${string}`,
    playerB: `0x${string}`,
    description: string,
    duration: bigint
  ) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsCreating(true);
    try {
      const data = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'createChallenge',
        args: [playerA, playerB, description, duration],
      });

      const hash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data,
        chain: baseSepolia,
      });

      return hash;
    } finally {
      setIsCreating(false);
    }
  }, [walletClient, account]);

  return { createChallenge, isCreating };
};

export const useStakeForA = () => {
  const { walletClient, account } = useEmbeddedWallet();
  const [isStaking, setIsStaking] = useState(false);

  const stakeForA = useCallback(async (challengeId: bigint, amount: bigint) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsStaking(true);
    try {
      const data = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'stakeForA',
        args: [challengeId, amount],
      });

      const hash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data,
        chain: baseSepolia,
      });

      return hash;
    } finally {
      setIsStaking(false);
    }
  }, [walletClient, account]);

  return { stakeForA, isStaking };
};

export const useStakeForB = () => {
  const { walletClient, account } = useEmbeddedWallet();
  const [isStaking, setIsStaking] = useState(false);

  const stakeForB = useCallback(async (challengeId: bigint, amount: bigint) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsStaking(true);
    try {
      const data = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'stakeForB',
        args: [challengeId, amount],
      });

      const hash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data,
        chain: baseSepolia,
      });

      return hash;
    } finally {
      setIsStaking(false);
    }
  }, [walletClient, account]);

  return { stakeForB, isStaking };
};

export const useResolveChallenge = () => {
  const { walletClient, account } = useEmbeddedWallet();
  const [isResolving, setIsResolving] = useState(false);

  const resolveChallenge = useCallback(async (challengeId: bigint, winnerToken: `0x${string}`) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsResolving(true);
    try {
      const data = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'resolveChallenge',
        args: [challengeId, winnerToken],
      });

      const hash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data,
        chain: baseSepolia,
      });

      return hash;
    } finally {
      setIsResolving(false);
    }
  }, [walletClient, account]);

  return { resolveChallenge, isResolving };
};

export const useClaimTokens = () => {
  const { walletClient, account } = useEmbeddedWallet();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimTokens = useCallback(async (challengeId: bigint) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsClaiming(true);
    try {
      const data = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'claimWinnings',
        args: [challengeId],
      });

      const hash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data,
        chain: baseSepolia,
      });

      return hash;
    } finally {
      setIsClaiming(false);
    }
  }, [walletClient, account]);

  return { claimTokens, isClaiming };
}; 
