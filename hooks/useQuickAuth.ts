import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function useQuickAuth(isInFarcaster: boolean) {
  useEffect(() => {
    if (isInFarcaster) {
      try {
        sdk.actions.ready()
      } catch (error) {
        console.error('Quick auth failed:', error)
      }
    }
  }, [isInFarcaster])
}
