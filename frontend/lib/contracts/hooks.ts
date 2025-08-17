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
      return await publicClient.readContract({
        address: CONTRACTS.FACTORY_ADDR,
        abi: PlayerTokenFactoryABI,
        functionName: 'getAllPlayers',
      });
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
        abi: PlayerTokenABI,
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
        abi: PlayerTokenABI,
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
        abi: PlayerTokenABI,
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
        abi: PlayerTokenABI,
        functionName: 'approve',
        args: [spender, amount],
      }),
      chain: baseSepolia,
    });
  };
  return { approve };
};

export const useCreateChallenge = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const createChallenge = async (tokenA: `0x${string}`, text: string) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: CONTRACTS.ESCROW_ADDR,
      data: encodeFunctionData({
        abi: ChallengeEscrowABI,
        functionName: 'createChallenge',
        args: [tokenA, text],
      }),
      chain: baseSepolia,
    });
  };
  return { createChallenge };
};

export const useStakeForA = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const stakeForA = async (challengeId: bigint, amount: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: CONTRACTS.ESCROW_ADDR,
      data: encodeFunctionData({
        abi: ChallengeEscrowABI,
        functionName: 'stakeForA',
        args: [challengeId, amount],
      }),
      chain: baseSepolia,
    });
  };
  return { stakeForA };
};

export const useStakeForB = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const stakeForB = async (challengeId: bigint, tokenB: `0x${string}`, amount: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: CONTRACTS.ESCROW_ADDR,
      data: encodeFunctionData({
        abi: ChallengeEscrowABI,
        functionName: 'stakeForB',
        args: [challengeId, tokenB, amount],
      }),
      chain: baseSepolia,
    });
  };
  return { stakeForB };
};

export const useResolveChallenge = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const resolveChallenge = async (challengeId: bigint, winnerToken: `0x${string}`, minOutB2USDC: bigint, minOutUSDC2Win: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: CONTRACTS.ESCROW_ADDR,
      data: encodeFunctionData({
        abi: ChallengeEscrowABI,
        functionName: 'resolve',
        args: [challengeId, winnerToken, minOutB2USDC, minOutUSDC2Win],
      }),
      chain: baseSepolia,
    });
  };
  return { resolveChallenge };
};

export const useClaimChallenge = () => {
  const { walletClient, account } = useEmbeddedWallet();

  const claimChallenge = async (challengeId: bigint) => {
    if (!account?.address || !walletClient) throw new Error('No wallet connected');
    return await walletClient.sendTransaction({
      account: account,
      to: CONTRACTS.ESCROW_ADDR,
      data: encodeFunctionData({
        abi: ChallengeEscrowABI,
        functionName: 'claim',
        args: [challengeId],
      }),
      chain: baseSepolia,
    });
  };
  return { claimChallenge };
};

// Read contract hooks
export const useGetChallenge = (id: bigint) => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: ChallengeEscrowABI,
        functionName: 'challenges',
        args: [id],
      });
    } catch (err) {
      console.error('Error fetching challenge:', err);
      return null;
    }
  }, [id]);
  return { data, isLoading, error, refetch };
};

export const useGetUserStakeA = (id: bigint, userAddress?: `0x${string}`) => {
  const { account } = useEmbeddedWallet();
  const targetAddress = userAddress || account?.address;
  
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!targetAddress) return 0n;
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: ChallengeEscrowABI,
        functionName: 'stakeByUserA',
        args: [id, targetAddress],
      });
    } catch (err) {
      console.error('Error fetching user stake A:', err);
      return 0n;
    }
  }, [id, targetAddress]);
  return { data, isLoading, error, refetch };
};

export const useGetUserStakeB = (id: bigint, userAddress?: `0x${string}`) => {
  const { account } = useEmbeddedWallet();
  const targetAddress = userAddress || account?.address;
  
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!targetAddress) return 0n;
    
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: ChallengeEscrowABI,
        functionName: 'stakeByUserB',
        args: [id, targetAddress],
      });
    } catch (err) {
      console.error('Error fetching user stake B:', err);
      return 0n;
    }
  }, [id, targetAddress]);
  return { data, isLoading, error, refetch };
};

export const useIsOwner = () => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      return await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: ChallengeEscrowABI,
        functionName: 'owner',
      });
    } catch (err) {
      console.error('Error fetching owner:', err);
      return null;
    }
  });
  return { data, isLoading, error, refetch };
}; 
