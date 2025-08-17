import { create } from 'zustand';
import { Player, Challenge, UserStake } from './types';

interface AppState {
  // Roster state
  players: Player[];
  setPlayers: (players: Player[]) => void;
  
  // Challenges state
  challenges: Map<string, Challenge>;
  setChallenge: (id: string, challenge: Challenge) => void;
  setChallenges: (challenges: Challenge[]) => void;
  
  // User stakes state
  userStakes: Map<string, UserStake>; // challengeId -> UserStake
  setUserStake: (challengeId: string, stake: UserStake) => void;
  
  // Loading states
  isLoadingPlayers: boolean;
  setIsLoadingPlayers: (loading: boolean) => void;
  isLoadingChallenges: boolean;
  setIsLoadingChallenges: (loading: boolean) => void;
  
  // Clear all state
  clearState: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Roster state
  players: [],
  setPlayers: (players) => set({ players }),
  
  // Challenges state
  challenges: new Map(),
  setChallenge: (id, challenge) => {
    const challenges = new Map(get().challenges);
    challenges.set(id, challenge);
    set({ challenges });
  },
  setChallenges: (challenges) => {
    const challengesMap = new Map();
    challenges.forEach(challenge => {
      challengesMap.set(challenge.id.toString(), challenge);
    });
    set({ challenges: challengesMap });
  },
  
  // User stakes state
  userStakes: new Map(),
  setUserStake: (challengeId, stake) => {
    const userStakes = new Map(get().userStakes);
    userStakes.set(challengeId, stake);
    set({ userStakes });
  },
  
  // Loading states
  isLoadingPlayers: false,
  setIsLoadingPlayers: (loading) => set({ isLoadingPlayers: loading }),
  isLoadingChallenges: false,
  setIsLoadingChallenges: (loading) => set({ isLoadingChallenges: loading }),
  
  // Clear all state
  clearState: () => set({
    players: [],
    challenges: new Map(),
    userStakes: new Map(),
    isLoadingPlayers: false,
    isLoadingChallenges: false,
  }),
}));
