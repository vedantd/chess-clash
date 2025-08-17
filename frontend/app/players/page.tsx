"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PlayerCard } from "@/components/PlayerCard";
import { useGetAllPlayers } from "@/lib/contracts/hooks";
import { useAppStore } from "@/lib/store";
import { Player } from "@/lib/types";

export default function PlayersPage() {
  const { players, setPlayers, isLoadingPlayers } = useAppStore();
  const { data: playersData, isLoading: isLoadingPlayersData } =
    useGetAllPlayers();

  // Load players data
  useEffect(() => {
    if (playersData && !isLoadingPlayersData) {
      const formattedPlayers: Player[] = playersData.map((player: any) => ({
        tokenAddress: player.tokenAddress,
        name: player.name,
        symbol: player.symbol,
        initialSupply: player.totalSupply,
        faucetEnabled: player.faucetEnabled,
        faucetCapPerAddr: player.faucetCapPerAddr,
      }));
      setPlayers(formattedPlayers);
    }
  }, [playersData, isLoadingPlayersData, setPlayers]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Player Tokens</h1>
          <p className="text-muted-foreground mt-2">
            Get test tokens and prepare for challenges
          </p>
        </div>

        {isLoadingPlayers || isLoadingPlayersData ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              Loading player tokens...
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No player tokens found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.tokenAddress} player={player} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
