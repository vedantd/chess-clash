"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Challenge, Player } from "@/lib/types";
import {
  formatAddress,
  formatNumber,
  getChallengeStatus,
  getStatusColor,
  getTimeAgo,
} from "@/lib/utils";
import { MessageSquare, Users, Trophy, Clock } from "lucide-react";
import Link from "next/link";

interface ChallengeCardProps {
  challenge: Challenge;
  players: Player[];
  onStakeForA?: () => void;
  onStakeForB?: () => void;
  onClaim?: () => void;
}

export function ChallengeCard({
  challenge,
  players,
  onStakeForA,
  onStakeForB,
  onClaim,
}: ChallengeCardProps) {
  const playerA = players.find((p) => p.tokenAddress === challenge.playerA);
  const playerB = players.find((p) => p.tokenAddress === challenge.playerB);
  const winner = challenge.winner
    ? players.find((p) => p.tokenAddress === challenge.winner)
    : null;

  const status = getChallengeStatus(challenge);
  const canClaim = challenge.resolved && challenge.winner;
  const isActive = challenge.active && !challenge.resolved;
  const isEnded = !challenge.active && !challenge.resolved;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              {challenge.description}
            </CardTitle>
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
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player A vs Player B display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
            <div>
              <div className="font-medium">{playerA?.name || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(challenge.totalStakeA)} staked
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold text-muted-foreground">VS</div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
              B
            </div>
            <div className="text-right">
              <div className="font-medium">{playerB?.name || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(challenge.totalStakeB)} staked
              </div>
            </div>
          </div>
        </div>

        {/* Winner display */}
        {challenge.resolved && challenge.winner && winner && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Winner: {winner.name}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/challenge/${challenge.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>

          {isActive && (
            <>
              {onStakeForA && (
                <Button variant="outline" size="sm" onClick={onStakeForA}>
                  Stake A
                </Button>
              )}
              {onStakeForB && (
                <Button variant="outline" size="sm" onClick={onStakeForB}>
                  Stake B
                </Button>
              )}
            </>
          )}

          {canClaim && onClaim && (
            <Button variant="default" size="sm" onClick={onClaim}>
              Claim
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
