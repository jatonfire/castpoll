'use client';

import React from 'react';

export default function FarcasterWrapper({ children }: { children: React.ReactNode }) {
  // This wrapper can be extended to provide Farcaster context
  // For now, it simply renders children
  return <>{children}</>;
}
