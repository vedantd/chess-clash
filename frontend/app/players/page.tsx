"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PlayerCard } from "@/components/PlayerCard";
import { useGetAllPlayers } from "@/lib/contracts/hooks";
import { useAppStore } from "@/lib/store";
import { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PlayersPage() {
  const { players, setPlayers, isLoadingPlayers } = useAppStore();
  const { data: playersData, isLoading: isLoadingPlayersData, refetch } =
    useGetAllPlayers();

  // Load players data
  useEffect(() => {
    if (playersData && !isLoadingPlayersData && Array.isArray(playersData)) {
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

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Player Tokens</h1>
            <p className="text-muted-foreground mt-2">
              Get test tokens and prepare for challenges
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoadingPlayersData}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingPlayersData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Connection Status */}
        {!isLoadingPlayersData && (
          <div className="mb-6">
            {playersData && Array.isArray(playersData) && playersData.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✅ Connected to Testnet:</strong> Found {playersData.length} real player tokens on Base Sepolia
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ No Player Tokens Found:</strong> Make sure the factory contract has been deployed and tokens created
                </p>
              </div>
            )}
          </div>
        )}

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
            <p className="text-sm text-muted-foreground mt-1">
              Check that the factory contract is deployed and tokens are created
            </p>
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
