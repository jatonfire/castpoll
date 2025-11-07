'use client';
import { useEffect, useState } from 'react';
import { CreateView } from '@/components/CreateView';
import { VoteView } from '@/components/VoteView';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Toast';
import { initializeFarcasterSDK } from '@/lib/farcasterSDK';
import type { FarcasterUser, FarcasterSDK } from '@/lib/farcasterSDK';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAddMiniApp } from '@/hooks/useAddMiniApp';
import { useQuickAuth } from '@/hooks/useQuickAuth';
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type View = 'create' | 'vote';

export default function CastPollPage(): React.JSX.Element {
  const { addMiniApp } = useAddMiniApp();
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);
  useEffect(() => {
    const tryAddMiniApp = async () => {
      try {
        await addMiniApp();
      } catch (error) {
        console.error('Failed to add mini app:', error);
      }
    };

    tryAddMiniApp();
  }, [addMiniApp]);
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (document.readyState !== 'complete') {
          await new Promise<void>((resolve) => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve(), { once: true });
            }
          });
        }

        await sdk.actions.ready();
        console.log('Farcaster SDK initialized successfully - app fully loaded');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);

        setTimeout(async () => {
          try {
            await sdk.actions.ready();
            console.log('Farcaster SDK initialized on retry');
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError);
          }
        }, 1000);
      }
    };

    initializeFarcaster();
  }, []);
  const [view, setView] = useState<View>('create');
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [sdkState, setSdkState] = useState<FarcasterSDK | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pollId = params.get('poll');

    const init = async (): Promise<void> => {
      const { sdk: farcasterSdk, user: farcasterUser } =
        await initializeFarcasterSDK();
      setSdkState(farcasterSdk);
      setUser(farcasterUser);
      setIsLoading(false);

      if (pollId) {
        setActivePollId(pollId);
        setView('vote');
      }
    };

    init();
  }, []);

  const handleViewPoll = (pollId: string): void => {
    setActivePollId(pollId);
    setView('vote');
    window.history.pushState({}, '', `?poll=${pollId}`);
  };

  const handleBack = (): void => {
    setView('create');
    setActivePollId(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const isAdmin = user?.fid === 251209;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1b26] via-[#282b3b] to-[#1a1b26] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b26] via-[#282b3b] to-[#1a1b26] pt-12 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">CastPoll</h1>
            {isAdmin && (
              <Badge variant="destructive" className="text-xs font-bold">
                ADMIN
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-lg">Create & Vote on Polls</p>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {view === 'create' ? (
              <motion.div key="create" {...motionProps}>
                <CreateView
                  userFid={user?.fid || null}
                  onPollCreated={() => {}}
                  onViewPoll={handleViewPoll}
                  showToast={showToast}
                />
              </motion.div>
            ) : activePollId ? (
              <motion.div key="vote" {...motionProps}>
                <VoteView
                  pollId={activePollId}
                  userFid={user?.fid || null}
                  sdk={sdkState}
                  onBack={handleBack}
                  showToast={showToast}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      {ToastComponent}
    </div>
  );
}
