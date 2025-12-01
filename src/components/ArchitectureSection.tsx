export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Technical Architecture</h2>
            <p className="text-stone-600">Managed FaaS 없이 VM 기반으로 구축하는 순수 서버리스 구조입니다.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-stone-800 shadow-sm">
            <h3 className="font-bold text-xl mb-2 flex items-center">
              <i className="fa-solid fa-tower-control text-stone-600 mr-3"></i>
              Control Plane
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>Gateway:</strong> 주문 수신 및 유효성 검사</li>
              <li><strong>Redis:</strong> 조리대(Stove) 및 화구 상태 관리</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-amber-600 shadow-sm">
            <h3 className="font-bold text-xl mb-2 flex items-center">
              <i className="fa-solid fa-microchip text-amber-600 mr-3"></i>
              Data Plane (Agent)
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>Docker Control:</strong> 컨테이너 직접 제어 (Spawn/Kill)</li>
              <li><strong>Lifecycle:</strong> Cold Start 최소화를 위한 예열 관리</li>
            </ul>
          </div>
        </div>
        <div className="bg-stone-800 rounded-2xl p-8 text-stone-200 relative shadow-2xl">
          <div className="flex flex-col gap-8 relative z-10">
            <div className="flex justify-center">
              <div className="border border-stone-600 bg-stone-700 px-6 py-2 rounded-lg text-center w-40">Client (HTTP)</div>
            </div>
            <div className="flex justify-center -my-4 text-stone-500"><i className="fa-solid fa-arrow-down"></i></div>
            <div className="border-2 border-dashed border-stone-600 rounded-xl p-4 text-center">
              <span className="text-xs text-stone-400">Control Plane</span>
              <div className="flex gap-4 justify-center mt-2">
                <div className="bg-amber-700/20 p-2 rounded w-1/2 border border-amber-600/50">Gateway</div>
                <div className="bg-blue-900/20 p-2 rounded w-1/2 border border-blue-600/50">Redis</div>
              </div>
            </div>
            <div className="flex justify-center -my-4 text-stone-500"><i className="fa-solid fa-arrows-down-to-people"></i></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-stone-600 bg-stone-700/50 p-4 rounded-lg">
                <div className="text-xs text-stone-400 mb-1">EC2 A</div>
                <div className="bg-stone-800 p-2 rounded text-green-400 text-xs font-bold border-l-2 border-green-500">Agent</div>
              </div>
              <div className="border border-stone-600 bg-stone-700/50 p-4 rounded-lg opacity-70">
                <div className="text-xs text-stone-400 mb-1">EC2 B</div>
                <div className="bg-stone-800 p-2 rounded text-green-400 text-xs font-bold border-l-2 border-green-500">Agent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

