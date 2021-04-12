export function isEmpty(items?: unknown[]) {
  return items && items.length === 0
}

export function getEndPoint() {
  return import.meta.env.VITE_BASE_ENDPOINT as string
}
