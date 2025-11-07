'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  pollStorage,
  generatePollId,
  isPollExpired,
  getTotalVotes,
} from '@/lib/pollStorage';
import type { Poll } from '@/lib/pollStorage';
import { X } from 'lucide-react';

interface CreateViewProps {
  userFid: number | null;
  onPollCreated: () => void;
  onViewPoll: (pollId: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'default') => void;
}

const DURATION_OPTIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '6 Hours', hours: 6 },
  { label: '24 Hours', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
];

export function CreateView({
  userFid,
  onPollCreated,
  onViewPoll,
  showToast,
}: CreateViewProps): JSX.Element {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [duration, setDuration] = useState<string>('24');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [recentPolls, setRecentPolls] = useState<Poll[]>(
    pollStorage.getRecent(),
  );

  const addOption = (): void => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number): void => {
    if (options.length > 2) {
      setOptions(options.filter((_: string, i: number) => i !== index));
    }
  };

  const updateOption = (index: number, value: string): void => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }

    const validOptions = options.filter((opt: string) => opt.trim());
    if (validOptions.length < 2) {
      showToast('Please add at least 2 options', 'error');
      return;
    }

    setIsCreating(true);

    await new Promise((resolve: (value: unknown) => void) =>
      setTimeout(resolve, 500),
    );

    const now = Date.now();
    const expiresIn = parseInt(duration) * 60 * 60 * 1000;

    const newPoll: Poll = {
      id: generatePollId(),
      q: question.trim(),
      opts: validOptions.map((text: string) => ({
        text: text.trim(),
        votes: 0,
        voters: [],
      })),
      created: now,
      expires: now + expiresIn,
      creator: userFid,
    };

    pollStorage.add(newPoll);

    setQuestion('');
    setOptions(['', '']);
    setDuration('24');
    setIsCreating(false);
    setRecentPolls(pollStorage.getRecent());

    showToast('Poll Created!', 'success');
    onPollCreated();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/98 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="question"
                className="text-sm font-semibold text-gray-700"
              >
                Question
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuestion(e.target.value)
                }
                placeholder="What's your question?"
                className="text-base"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Options
              </Label>
              {options.map((option: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateOption(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 text-base"
                    disabled={isCreating}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={isCreating}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  disabled={isCreating}
                  className="w-full"
                >
                  + Add Option
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-sm font-semibold text-gray-700"
              >
                Duration
              </Label>
              <Select
                value={duration}
                onValueChange={setDuration}
                disabled={isCreating}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt: { label: string; hours: number }) => (
                    <SelectItem key={opt.hours} value={opt.hours.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Creating...' : '🚀 Launch Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {recentPolls.length > 0 && (
        <Card className="bg-white/98 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Recent Polls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPolls.map((poll: Poll) => {
              const isExpired = isPollExpired(poll);
              const totalVotes = getTotalVotes(poll);

              return (
                <button
                  key={poll.id}
                  onClick={() => onViewPoll(poll.id)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {poll.q}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {totalVotes} votes
                      </p>
                    </div>
                    <Badge variant={isExpired ? 'secondary' : 'default'}>
                      {isExpired ? 'Ended' : 'Active'}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
