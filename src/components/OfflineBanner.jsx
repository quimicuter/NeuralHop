import React from 'react'

function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(() => {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default function OfflineBanner() {
  const online = useNetworkStatus()
  if (online) return null

  return (
    <div className="offline-banner">
      Estás sin conexión. La app usa datos cacheados y se sincronizará cuando vuelvas a estar online.
    </div>
  )
}
