export interface PollOption {
  text: string;
  votes: number;
  voters: number[];
}

export interface Poll {
  id: string;
  q: string;
  opts: PollOption[];
  created: number;
  expires: number;
  creator: number | null;
}

const STORAGE_KEY = 'castpoll_data';

export const pollStorage = {
  getAll(): Poll[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save(polls: Poll[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    } catch (error) {
      console.error('Failed to save polls:', error);
    }
  },

  add(poll: Poll): void {
    const polls = this.getAll();
    polls.unshift(poll);
    this.save(polls);
  },

  getById(id: string): Poll | null {
    const polls = this.getAll();
    return polls.find((p: Poll) => p.id === id) || null;
  },

  update(updatedPoll: Poll): void {
    const polls = this.getAll();
    const index = polls.findIndex((p: Poll) => p.id === updatedPoll.id);
    if (index !== -1) {
      polls[index] = updatedPoll;
      this.save(polls);
    }
  },

  getRecent(limit: number = 5): Poll[] {
    return this.getAll().slice(0, limit);
  }
};

export function generatePollId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function isPollExpired(poll: Poll): boolean {
  return Date.now() > poll.expires;
}

export function hasUserVoted(poll: Poll, fid: number | null): boolean {
  if (!fid) return false;
  return poll.opts.some((opt: PollOption) => opt.voters.includes(fid));
}

export function getTotalVotes(poll: Poll): number {
  return poll.opts.reduce((sum: number, opt: PollOption) => sum + opt.votes, 0);
}

export function getWinningOptions(poll: Poll): number[] {
  const maxVotes = Math.max(...poll.opts.map((opt: PollOption) => opt.votes));
  if (maxVotes === 0) return [];
  return poll.opts
    .map((opt: PollOption, idx: number) => ({ idx, votes: opt.votes }))
    .filter((item: { idx: number; votes: number }) => item.votes === maxVotes)
    .map((item: { idx: number; votes: number }) => item.idx);
}
