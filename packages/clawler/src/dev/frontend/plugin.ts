declare global {
  interface Window {
    __TRANSLAE_STACKS?: { key: string, value: string }[]
  }
}

export function usePluginTest() {
  window.__TRANSLAE_STACKS = []
  return {
    fn (key: string): string {
      window.__TRANSLAE_STACKS?.push({ key, value: key })
      return key
    }
  }
}
