"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetChallenge,
  useGetUserStake,
  useApproveAndStakeForA,
  useApproveAndStakeForB,
  useClaimTokens,
} from "@/lib/contracts/hooks";
import { usePrivyAddress } from "@/lib/privy-hooks";
import { useAppStore } from "@/lib/store";
import { Challenge, Player } from "@/lib/types";
import {
  formatNumber,
  parseNumber,
  getChallengeStatus,
  getStatusColor,
  getTimeAgo,
} from "@/lib/utils";
import { ArrowLeft, Trophy, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ChallengeDetailPage() {
  const params = useParams();
  const challengeId = BigInt(params.id as string);
  const { players } = useAppStore();
  const { address } = usePrivyAddress();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: challengeData, isLoading: isLoadingChallenge } =
    useGetChallenge(challengeId);
  const { data: userStake } = useGetUserStake(challengeId, address);

  const { approveAndStakeForA, isProcessing: isStakingA } =
    useApproveAndStakeForA();
  const { approveAndStakeForB, isProcessing: isStakingB } =
    useApproveAndStakeForB();
  const { claimTokens, isClaiming: isClaimingFromHook } = useClaimTokens();

  // Load challenge data
  useEffect(() => {
    if (challengeData && !isLoadingChallenge) {
      const formattedChallenge: Challenge = {
        id: (challengeData as any).id,
        playerA: (challengeData as any).playerA,
        playerB: (challengeData as any).playerB,
        totalStakeA: (challengeData as any).totalStakeA,
        totalStakeB: (challengeData as any).totalStakeB,
        startTime: (challengeData as any).startTime,
        endTime: (challengeData as any).endTime,
        resolved: (challengeData as any).resolved,
        winner:
          (challengeData as any).winner !==
          "0x0000000000000000000000000000000000000000"
            ? (challengeData as any).winner
            : undefined,
        description: (challengeData as any).description,
        active: (challengeData as any).active,
      };
      setChallenge(formattedChallenge);
    }
  }, [challengeData, isLoadingChallenge]);

  const playerA = players.find((p) => p.tokenAddress === challenge?.playerA);
  const playerB = players.find((p) => p.tokenAddress === challenge?.playerB);
  const winner = challenge?.winner
    ? players.find((p) => p.tokenAddress === challenge.winner)
    : null;

  const status = challenge ? getChallengeStatus(challenge) : "Active";
  const canClaim =
    challenge?.resolved &&
    challenge?.winner &&
    (userStake as any)?.hasStaked &&
    ((userStake as any)?.amountA > 0n || (userStake as any)?.amountB > 0n);

  const isActive = challenge?.active && !challenge?.resolved;

  const handleStakeForA = async () => {
    if (!address || !stakeAmount || !challenge) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsStaking(true);
    try {
      const amount = parseNumber(stakeAmount);
      await approveAndStakeForA(challengeId, amount);
      toast.success("Successfully staked for Player A!");
      setStakeAmount("");
    } catch (error) {
      console.error("Stake error:", error);
      toast.error("Failed to stake for Player A");
    } finally {
      setIsStaking(false);
    }
  };

  const handleStakeForB = async () => {
    if (!address || !stakeAmount || !challenge) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsStaking(true);
    try {
      const amount = parseNumber(stakeAmount);
      await approveAndStakeForB(challengeId, amount);
      toast.success("Successfully staked for Player B!");
      setStakeAmount("");
    } catch (error) {
      console.error("Stake error:", error);
      toast.error("Failed to stake for Player B");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    if (!address || !challenge) {
      toast.error("Cannot claim");
      return;
    }
    setIsClaiming(true);
    try {
      await claimTokens(challengeId);
      toast.success("Successfully claimed tokens!");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim tokens");
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoadingChallenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Challenges
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {challenge.description}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTimeAgo(Number(challenge.startTime))}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatNumber(
                    challenge.totalStakeA + challenge.totalStakeB
                  )}{" "}
                  total staked
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players vs Players */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {playerA?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(challenge.totalStakeA)} staked
                      </div>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-muted-foreground">
                    VS
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {playerB?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(challenge.totalStakeB)} staked
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                      B
                    </div>
                  </div>
                </div>

                {/* Winner display */}
                {challenge.resolved && challenge.winner && winner && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mt-4">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-medium text-green-800">
                      Winner: {winner.name}
                    </span>
                  </div>
                )}

                {/* Challenge timeline */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Time:</span>
                    <span>
                      {new Date(
                        Number(challenge.startTime) * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Time:</span>
                    <span>
                      {new Date(
                        Number(challenge.endTime) * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{status.toLowerCase()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Stake Information */}
            {(userStake as any)?.hasStaked && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Stake</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(userStake as any)?.amountA > 0n && (
                      <div className="flex justify-between">
                        <span>Staked for {playerA?.name}:</span>
                        <span className="font-medium">
                          {formatNumber((userStake as any).amountA)}{" "}
                          {playerA?.symbol}
                        </span>
                      </div>
                    )}
                    {(userStake as any)?.amountB > 0n && (
                      <div className="flex justify-between">
                        <span>Staked for {playerB?.name}:</span>
                        <span className="font-medium">
                          {formatNumber((userStake as any).amountB)}{" "}
                          {playerB?.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Staking Panel */}
            {isActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Stake on Challenge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stake Amount
                    </label>
                    <Input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleStakeForA}
                      disabled={!stakeAmount || isStakingA}
                      className="w-full"
                    >
                      {isStakingA
                        ? "Approving & Staking..."
                        : "Approve & Stake for Player A"}
                    </Button>
                    <Button
                      onClick={handleStakeForB}
                      disabled={!stakeAmount || isStakingB}
                      className="w-full"
                    >
                      {isStakingB
                        ? "Approving & Staking..."
                        : "Approve & Stake for Player B"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Claim Panel */}
            {canClaim && (
              <Card>
                <CardHeader>
                  <CardTitle>Claim Winnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full"
                  >
                    {isClaiming ? "Claiming..." : "Claim Tokens"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
