import { encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useState, useCallback, useEffect } from 'react';
import { CONTRACTS } from './addresses';
import { Player, Challenge, UserStake } from '../types';
import { publicClient } from '../wagmi';
import { usePrivyWallet, usePrivyAddress, usePrivyAuth } from '../privy-hooks';

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
  const { address } = usePrivyAddress();
  return { evmAddress: address };
};

export const useGetIsSignedIn = () => {
  const { isAuthenticated } = usePrivyAuth();
  return { isSignedIn: isAuthenticated };
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
  const { address } = usePrivyAddress();
  const targetAddress = userAddress || address;
  
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
  const { address } = usePrivyAddress();
  const targetAddress = userAddress || address;
  
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
  }, [targetAddress, tokenAddress, spender]);

  return { data, isLoading, error, refetch };
};

// Transaction hooks using embedded wallet
export const useFaucetMint = () => {
  const { walletClient, account } = usePrivyWallet();

  const mint = async (tokenAddress: `0x${string}`, amount: bigint) => {
    if (!account || !walletClient) throw new Error('No wallet connected');
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
  const { walletClient, account } = usePrivyWallet();

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    if (!account || !walletClient) throw new Error('No wallet connected');
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

// Combined approve and stake functions
export const useApproveAndStakeForA = () => {
  const { walletClient, account } = usePrivyWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const approveAndStakeForA = useCallback(async (challengeId: bigint, amount: bigint) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsProcessing(true);
    try {
      // First, get the challenge to know which token to approve
      const challenge = await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'getChallenge',
        args: [challengeId],
      }) as any;

      const playerAToken = challenge.playerA;
      
      console.log('Approving and staking for Player A:', {
        challengeId: challengeId.toString(),
        amount: amount.toString(),
        token: playerAToken
      });

      // Step 1: Approve the token
      const approveData = encodeFunctionData({
        abi: playerTokenABI,
        functionName: 'approve',
        args: [CONTRACTS.ESCROW_ADDR, amount],
      });

      console.log('Sending approval transaction...');
      const approveHash = await walletClient.sendTransaction({
        account: account,
        to: playerAToken,
        data: approveData,
        chain: baseSepolia,
      });

      console.log('Approval transaction sent:', approveHash);

      // Wait for approval to be mined
      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveHash,
      });

      if (approveReceipt.status !== 'success') {
        throw new Error('Approval transaction failed');
      }

      console.log('Approval successful, now staking...');

      // Step 2: Stake the tokens
      const stakeData = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'stakeForA',
        args: [challengeId, amount],
      });

      const stakeHash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data: stakeData,
        chain: baseSepolia,
      });

      console.log('Stake transaction sent:', stakeHash);

      // Wait for stake to be mined
      const stakeReceipt = await publicClient.waitForTransactionReceipt({
        hash: stakeHash,
      });

      if (stakeReceipt.status !== 'success') {
        throw new Error('Stake transaction failed');
      }

      console.log('Stake successful!');
      return { approveHash, stakeHash };

    } finally {
      setIsProcessing(false);
    }
  }, [walletClient, account]);

  return { approveAndStakeForA, isProcessing };
};

export const useApproveAndStakeForB = () => {
  const { walletClient, account } = usePrivyWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const approveAndStakeForB = useCallback(async (challengeId: bigint, amount: bigint) => {
    if (!walletClient || !account) throw new Error('Wallet not connected');
    
    setIsProcessing(true);
    try {
      // First, get the challenge to know which token to approve
      const challenge = await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'getChallenge',
        args: [challengeId],
      }) as any;

      const playerBToken = challenge.playerB;
      
      console.log('Approving and staking for Player B:', {
        challengeId: challengeId.toString(),
        amount: amount.toString(),
        token: playerBToken
      });

      // Step 1: Approve the token
      const approveData = encodeFunctionData({
        abi: playerTokenABI,
        functionName: 'approve',
        args: [CONTRACTS.ESCROW_ADDR, amount],
      });

      console.log('Sending approval transaction...');
      const approveHash = await walletClient.sendTransaction({
        account: account,
        to: playerBToken,
        data: approveData,
        chain: baseSepolia,
      });

      console.log('Approval transaction sent:', approveHash);

      // Wait for approval to be mined
      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveHash,
      });

      if (approveReceipt.status !== 'success') {
        throw new Error('Approval transaction failed');
      }

      console.log('Approval successful, now staking...');

      // Step 2: Stake the tokens
      const stakeData = encodeFunctionData({
        abi: challengeEscrowABI,
        functionName: 'stakeForB',
        args: [challengeId, amount],
      });

      const stakeHash = await walletClient.sendTransaction({
        account: account,
        to: CONTRACTS.ESCROW_ADDR,
        data: stakeData,
        chain: baseSepolia,
      });

      console.log('Stake transaction sent:', stakeHash);

      // Wait for stake to be mined
      const stakeReceipt = await publicClient.waitForTransactionReceipt({
        hash: stakeHash,
      });

      if (stakeReceipt.status !== 'success') {
        throw new Error('Stake transaction failed');
      }

      console.log('Stake successful!');
      return { approveHash, stakeHash };

    } finally {
      setIsProcessing(false);
    }
  }, [walletClient, account]);

  return { approveAndStakeForB, isProcessing };
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
  const { address } = usePrivyAddress();
  const targetAddress = userAddress || address;
  
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

// Hook to get all challenges
export const useGetAllChallenges = () => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      // Get total number of challenges
      const totalChallenges = await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'totalChallenges',
        args: [],
      }) as bigint;

      console.log('Total challenges:', totalChallenges);

      if (totalChallenges === 0n) {
        return [];
      }

      // Fetch all challenges
      const challenges = [];
      for (let i = 0; i < Number(totalChallenges); i++) {
        try {
          const challenge = await publicClient.readContract({
            address: CONTRACTS.ESCROW_ADDR,
            abi: challengeEscrowABI,
            functionName: 'getChallenge',
            args: [BigInt(i)],
          }) as any;
          
          challenges.push(challenge);
        } catch (err) {
          console.error(`Error fetching challenge ${i}:`, err);
          // Continue with other challenges even if one fails
        }
      }

      console.log('Fetched challenges:', challenges);
      return challenges;
    } catch (err) {
      console.error('Error fetching all challenges:', err);
      return [];
    }
  });

  return { data, isLoading, error, refetch };
};

// Hook to get user's challenges (challenges they've staked on)
export const useGetUserChallenges = (userAddress?: `0x${string}`) => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    if (!userAddress) return [];
    
    try {
      // Get total number of challenges
      const totalChallenges = await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'totalChallenges',
        args: [],
      }) as bigint;

      if (totalChallenges === 0n) {
        return [];
      }

      // Fetch all challenges and check if user has staked on them
      const userChallenges = [];
      for (let i = 0; i < Number(totalChallenges); i++) {
        try {
          const challenge = await publicClient.readContract({
            address: CONTRACTS.ESCROW_ADDR,
            abi: challengeEscrowABI,
            functionName: 'getChallenge',
            args: [BigInt(i)],
          }) as any;

          // Check if user has staked on this challenge
          const userStake = await publicClient.readContract({
            address: CONTRACTS.ESCROW_ADDR,
            abi: challengeEscrowABI,
            functionName: 'getUserStake',
            args: [BigInt(i), userAddress],
          }) as any;

          // If user has staked (either on player A or B), include this challenge
          if (userStake.hasStaked && (userStake.amountA > 0n || userStake.amountB > 0n)) {
            userChallenges.push({
              ...challenge,
              userStake: {
                amountA: userStake.amountA,
                amountB: userStake.amountB,
                hasStaked: userStake.hasStaked,
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching challenge ${i}:`, err);
          // Continue with other challenges even if one fails
        }
      }

      console.log('User challenges:', userChallenges);
      return userChallenges;
    } catch (err) {
      console.error('Error fetching user challenges:', err);
      return [];
    }
  }, [userAddress]);

  return { data, isLoading, error, refetch };
};

// Challenge creation and staking hooks
export const useCreateChallenge = () => {
  const { walletClient, account } = usePrivyWallet();
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
  const { walletClient, account } = usePrivyWallet();
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
  const { walletClient, account } = usePrivyWallet();
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
  const { walletClient, account } = usePrivyWallet();
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
  const { walletClient, account } = usePrivyWallet();
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

// Test function to verify contract accessibility
export const useTestContract = () => {
  const { data, isLoading, error, refetch } = useAsyncData(async () => {
    try {
      // Try to read the totalChallenges to see if contract is accessible
      const totalChallenges = await publicClient.readContract({
        address: CONTRACTS.ESCROW_ADDR,
        abi: challengeEscrowABI,
        functionName: 'totalChallenges',
        args: [],
      });
      
      console.log('Contract test successful, totalChallenges:', totalChallenges);
      return { success: true, totalChallenges };
    } catch (err) {
      console.error('Contract test failed:', err);
      return { success: false, error: err };
    }
  });

  return { data, isLoading, error, refetch };
}; 
