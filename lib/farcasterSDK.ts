interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterSDK {
  actions: {
    ready: () => void;
    composeCast: (options: { text: string; embeds: string[] }) => void;
  };
  getUser: () => Promise<FarcasterUser | null>;
}

declare global {
  interface Window {
    FarcasterSDK?: FarcasterSDK;
  }
}

export async function waitForSDK(maxAttempts: number = 50, delay: number = 100): Promise<FarcasterSDK | null> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.FarcasterSDK) {
      return window.FarcasterSDK;
    }
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, delay));
  }
  return null;
}

export async function initializeFarcasterSDK(): Promise<{ sdk: FarcasterSDK | null; user: FarcasterUser | null }> {
  const sdk = await waitForSDK();
  
  if (sdk) {
    try {
      sdk.actions.ready();
    } catch (error) {
      console.error('Failed to call ready():', error);
    }

    try {
      const user = await sdk.getUser();
      return { sdk, user };
    } catch (error) {
      console.error('Failed to get user:', error);
      return { sdk, user: null };
    }
  }

  return { sdk: null, user: null };
}

export function composeCast(sdk: FarcasterSDK | null, text: string, embedUrl: string): void {
  if (!sdk) {
    alert('Farcaster SDK not available. Please open this app in the Farcaster client.');
    return;
  }

  try {
    sdk.actions.composeCast({
      text,
      embeds: [embedUrl]
    });
  } catch (error) {
    console.error('Failed to compose cast:', error);
    alert('Failed to open composer. Please try again.');
  }
}

export type { FarcasterUser, FarcasterSDK };
