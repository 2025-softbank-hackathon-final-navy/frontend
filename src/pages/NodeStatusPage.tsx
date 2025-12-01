import { NodeStatusBoard } from '../components/routing'
import { mockNodeStatus } from '../data/mockRoutingData'

export function NodeStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Pool / Node Status</h1>
        <p className="text-stone-500 text-sm mt-1">
          클러스터의 노드 상태를 실시간으로 모니터링합니다
        </p>
      </div>
      
      <NodeStatusBoard nodes={mockNodeStatus} />
    </div>
  )
}

