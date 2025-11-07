import { useState, useEffect } from 'react'

export function useIsInFarcaster() {
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        const inFarcaster = typeof window !== 'undefined' && 
                           (window as any).FarcasterSDK !== undefined
        setIsInFarcaster(inFarcaster)
      } catch {
        setIsInFarcaster(false)
      }
    }

    check()
    window.addEventListener('load', check)
    return () => window.removeEventListener('load', check)
  }, [])

  return isInFarcaster
}
