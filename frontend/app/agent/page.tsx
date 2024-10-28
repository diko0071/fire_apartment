'use client'

import dynamic from 'next/dynamic'

const ChatAndLeafletMap = dynamic(
  () => import('@/app/map/pages/mapPage'),
  { ssr: false }
)

export default function AgentPage() {
  return <ChatAndLeafletMap />
}
