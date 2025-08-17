"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetChallenge,
  useStakeForA,
  useStakeForB,
  useClaimChallenge,
  useGetUserStakeA,
  useGetUserStakeB,
} from "@/lib/contracts/hooks";
import { useEmbeddedWallet } from "@/components/WagmiProvider";
import { CONTRACTS } from "@/lib/contracts/addresses";
import { useAppStore } from "@/lib/store";
import { Challenge, Player } from "@/lib/types";
import {
  formatAddress,
  formatNumber,
  getChallengeStatus,
  getStatusColor,
  getTimeAgo,
  parseNumber,
} from "@/lib/utils";
import { ArrowLeft, Trophy, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import ChallengeEscrowABI from "@/lib/contracts/abis/ChallengeEscrow.json";

export default function ChallengeDetailPage() {
  const params = useParams();
  const { account } = useEmbeddedWallet();
  const address = account?.address;
  const { players } = useAppStore();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedTokenB, setSelectedTokenB] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const challengeId = BigInt(params.id as string);

  const { data: challengeData, isLoading: isLoadingChallenge } =
    useGetChallenge(challengeId);
  const { data: userStakeA } = useGetUserStakeA(challengeId, address);
  const { data: userStakeB } = useGetUserStakeB(challengeId, address);

  const { stakeForA } = useStakeForA();
  const { stakeForB } = useStakeForB();
  const { claimChallenge } = useClaimChallenge();

  // Load challenge data
  useEffect(() => {
    if (challengeData && !isLoadingChallenge) {
      const formattedChallenge: Challenge = {
        id: challengeData.id,
        author: challengeData.author,
        text: challengeData.text,
        tokenA: challengeData.tokenA,
        tokenB:
          challengeData.tokenB !== "0x0000000000000000000000000000000000000000"
            ? challengeData.tokenB
            : undefined,
        stakeA: challengeData.stakeA,
        stakeB: challengeData.stakeB,
        settled: challengeData.settled,
        winnerToken:
          challengeData.winnerToken !==
          "0x0000000000000000000000000000000000000000"
            ? challengeData.winnerToken
            : undefined,
        createdAt: Date.now() - 3600000, // Mock timestamp
      };
      setChallenge(formattedChallenge);
    }
  }, [challengeData, isLoadingChallenge]);

  const tokenA = players.find((p) => p.tokenAddress === challenge?.tokenA);
  const tokenB = challenge?.tokenB
    ? players.find((p) => p.tokenAddress === challenge.tokenB)
    : null;
  const status = challenge ? getChallengeStatus(challenge) : "Open";
  const canClaim =
    challenge?.settled &&
    challenge?.winnerToken &&
    ((userStakeA && userStakeA > 0n) || (userStakeB && userStakeB > 0n));

  const handleStakeForA = async () => {
    if (!address || !challenge || !stakeAmount) return;

    setIsStaking(true);
    try {
      const amount = parseNumber(stakeAmount);
      await stakeForA(challenge.id, amount);
      toast.success(`Staked ${stakeAmount} for Side A`);
      setStakeAmount("");
    } catch (error) {
      console.error("Stake error:", error);
      toast.error("Failed to stake");
    } finally {
      setIsStaking(false);
    }
  };

  const handleStakeForB = async () => {
    if (!address || !challenge || !stakeAmount || !selectedTokenB) return;

    setIsStaking(true);
    try {
      const amount = parseNumber(stakeAmount);
      await stakeForB(challenge.id, selectedTokenB as `0x${string}`, amount);
      toast.success(`Staked ${stakeAmount} for Side B`);
      setStakeAmount("");
      setSelectedTokenB("");
    } catch (error) {
      console.error("Stake error:", error);
      toast.error("Failed to stake");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!address || !challenge) return;

    setIsClaiming(true);
    try {
      await claimChallenge(challenge.id);
      toast.success("Winnings claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim winnings");
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoadingChallenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading challenge...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Challenge not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Challenge Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {challenge.text}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {formatAddress(challenge.author)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {getTimeAgo(challenge.createdAt)}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Token Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    A
                  </div>
                  Side A: {tokenA?.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(challenge.stakeA)} {tokenA?.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total staked
                </div>
                {userStakeA && userStakeA > 0n && (
                  <div className="text-sm">
                    Your stake: {formatNumber(userStakeA)} {tokenA?.symbol}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                    B
                  </div>
                  Side B: {tokenB?.symbol || "Not set"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(challenge.stakeB)} {tokenB?.symbol || "tokens"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total staked
                </div>
                {userStakeB && userStakeB > 0n && (
                  <div className="text-sm">
                    Your stake: {formatNumber(userStakeB)} {tokenB?.symbol}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Winner Display */}
          {challenge.settled && challenge.winnerToken && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">
                    Winner:{" "}
                    {players.find(
                      (p) => p.tokenAddress === challenge.winnerToken
                    )?.symbol || "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staking Actions */}
          {!challenge.settled && address && (
            <Card>
              <CardHeader>
                <CardTitle>Stake on this Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount to stake"
                    className="flex-1"
                  />

                  {!challenge.tokenB ? (
                    <Select
                      value={selectedTokenB}
                      onValueChange={setSelectedTokenB}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose Token B" />
                      </SelectTrigger>
                      <SelectContent>
                        {players
                          .filter((p) => p.tokenAddress !== challenge.tokenA)
                          .map((player) => (
                            <SelectItem
                              key={player.tokenAddress}
                              value={player.tokenAddress}
                            >
                              {player.symbol} - {player.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleStakeForA}
                    disabled={isStaking || !stakeAmount}
                    variant="outline"
                    className="flex-1"
                  >
                    {isStaking
                      ? "Staking..."
                      : `Stake for A (${tokenA?.symbol})`}
                  </Button>

                  <Button
                    onClick={handleStakeForB}
                    disabled={
                      isStaking ||
                      !stakeAmount ||
                      (!challenge.tokenB && !selectedTokenB)
                    }
                    variant="outline"
                    className="flex-1"
                  >
                    {isStaking
                      ? "Staking..."
                      : challenge.tokenB
                      ? `Stake for B (${tokenB?.symbol})`
                      : "Counter with B"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Claim Button */}
          {canClaim && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full"
                  size="lg"
                >
                  {isClaiming ? "Claiming..." : "Claim Winnings"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
