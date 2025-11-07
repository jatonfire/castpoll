import { sdk } from '@farcaster/miniapp-sdk'

export function useAddMiniApp() {
  const addMiniApp = async () => {
    try {
      await sdk.client.addFrame()
    } catch (error) {
      console.error('Failed to add mini app:', error)
    }
  }

  return { addMiniApp }
}
