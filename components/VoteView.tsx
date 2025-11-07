'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  pollStorage,
  isPollExpired,
  hasUserVoted,
  getTotalVotes,
  getWinningOptions,
} from '@/lib/pollStorage';
import { composeCast } from '@/lib/farcasterSDK';
import type { Poll, PollOption } from '@/lib/pollStorage';
import type { FarcasterSDK } from '@/lib/farcasterSDK';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface VoteViewProps {
  pollId: string;
  userFid: number | null;
  sdk: FarcasterSDK | null;
  onBack: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'default') => void;
}

export function VoteView({
  pollId,
  userFid,
  sdk,
  onBack,
  showToast,
}: VoteViewProps): JSX.Element {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState<boolean>(false);

  useEffect(() => {
    const loadedPoll = pollStorage.getById(pollId);
    if (loadedPoll) {
      setPoll(loadedPoll);
      setVoted(hasUserVoted(loadedPoll, userFid));
    }
  }, [pollId, userFid]);

  const handleVote = (optionIndex: number): void => {
    if (!poll || !userFid) {
      showToast('Unable to vote', 'error');
      return;
    }

    const updatedPoll = { ...poll };
    updatedPoll.opts[optionIndex].votes += 1;
    updatedPoll.opts[optionIndex].voters.push(userFid);

    pollStorage.update(updatedPoll);
    setPoll(updatedPoll);
    setVoted(true);
    showToast('Vote Cast!', 'success');
  };

  const handleShare = (): void => {
    if (!poll) return;

    const appUrl = window.location.origin;
    const pollUrl = `${appUrl}?poll=${poll.id}`;
    const text = `🗳️ Vote: ${poll.q}`;

    composeCast(sdk, text, pollUrl);
  };

  if (!poll) {
    return (
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4 text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-white/98 border-0 shadow-xl">
          <CardContent className="p-12 text-center flex flex-col items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
            <p className="text-gray-600 font-medium text-lg">Poll Not Found</p>
            <p className="text-gray-500">
              This poll may have been deleted or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = isPollExpired(poll);
  const totalVotes = getTotalVotes(poll);
  const showResults = voted || isExpired;
  const winningIndices = isExpired ? getWinningOptions(poll) : [];
  const canShare = voted || poll.creator === userFid;

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4 text-white/80 hover:text-white">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="bg-white/98 border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-2xl font-bold text-gray-900 flex-1">
              {poll.q}
            </CardTitle>
            <Badge variant={isExpired ? 'secondary' : 'default'}>
              {isExpired ? 'Ended' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showResults ? (
            <div className="space-y-3">
              {poll.opts.map((option: PollOption, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-auto py-4 text-base font-medium justify-start hover:bg-gray-100"
                  onClick={() => handleVote(index)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {poll.opts.map((option: PollOption, index: number) => {
                const percentage =
                  totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isWinner = winningIndices.includes(index);

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isWinner
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        {option.text}
                        {isWinner && (
                          <span className="text-green-600">🏆</span>
                        )}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">
                          {option.votes}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-center text-gray-600 font-medium">
                  Total Votes: {totalVotes}
                </p>
              </div>

              {canShare && (
                <Button
                  onClick={handleShare}
                  className="w-full"
                  variant="default"
                >
                  📢 Share on Farcaster
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}