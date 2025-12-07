export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-20">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-2">System Architecture</h2>
          <p className="text-stone-600">VM 기반 서버리스 함수 실행 플랫폼 - Router 기반 Pool 관리 및 Warm 인스턴스 스케일링</p>
        </div>

        {/* 아키텍처 다이어그램 */}
        <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 border border-stone-200 shadow-lg">
          <div className="flex flex-col gap-6">
            {/* Client Layer */}
            <div className="flex justify-center">
              <div className="bg-white border-2 border-stone-300 px-8 py-3 rounded-lg shadow-md flex items-center gap-3">
                <i className="fa-solid fa-globe text-amber-600"></i>
                <span className="font-semibold text-stone-800">Client (HTTP Request)</span>
              </div>
            </div>
            
            <div className="flex justify-center -my-2">
              <i className="fa-solid fa-arrow-down text-stone-400 text-2xl"></i>
            </div>

            {/* Router Layer */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-center gap-3 mb-4">
                <i className="fa-solid fa-route text-amber-600 text-xl"></i>
                <h3 className="font-bold text-stone-900 text-lg">Router (라우팅 결정)</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-amber-700 font-semibold mb-1">QPS 분석</div>
                  <div className="text-stone-600 text-xs">실시간 트래픽 분석</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-amber-700 font-semibold mb-1">Pool 선택</div>
                  <div className="text-stone-600 text-xs">CPU / GPU / LARGE</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-amber-700 font-semibold mb-1">Warm 예측</div>
                  <div className="text-stone-600 text-xs">desiredWarm 계산</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <i className="fa-solid fa-arrows-down-to-people text-stone-400 text-2xl"></i>
            </div>

            {/* Pool Layer */}
            <div className="space-y-4">
              <h3 className="text-center font-semibold text-stone-700 mb-3">Resource Pools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CPU Pool */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-microchip text-blue-600"></i>
                    <h4 className="font-bold text-stone-900">CPU Pool</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded border border-blue-200">
                      <div className="text-xs text-stone-500">Node-1</div>
                      <div className="text-xs text-green-600 font-semibold">Agent (Warm: 3)</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-200">
                      <div className="text-xs text-stone-500">Node-2</div>
                      <div className="text-xs text-green-600 font-semibold">Agent (Warm: 2)</div>
                    </div>
                  </div>
                </div>

                {/* GPU Pool */}
                <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-gem text-purple-600"></i>
                    <h4 className="font-bold text-stone-900">GPU Pool</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <div className="text-xs text-stone-500">Node-3</div>
                      <div className="text-xs text-green-600 font-semibold">Agent (Warm: 5)</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <div className="text-xs text-stone-500">Node-4</div>
                      <div className="text-xs text-green-600 font-semibold">Agent (Warm: 4)</div>
                    </div>
                  </div>
                </div>

                {/* LARGE Pool */}
                <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-server text-orange-600"></i>
                    <h4 className="font-bold text-stone-900">LARGE Pool</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded border border-orange-200">
                      <div className="text-xs text-stone-500">Node-5</div>
                      <div className="text-xs text-green-600 font-semibold">Agent (Warm: 2)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <i className="fa-solid fa-arrow-down text-stone-400 text-2xl"></i>
            </div>

            {/* Execution Layer */}
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-center gap-3 mb-4">
                <i className="fa-solid fa-play-circle text-green-600 text-xl"></i>
                <h3 className="font-bold text-stone-900 text-lg">Function Execution</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-green-700 font-semibold mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-fire text-orange-500"></i>
                    Warm Container
                  </div>
                  <div className="text-stone-600 text-xs">즉시 실행 (Cold Start 없음)</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-green-700 font-semibold mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-snowflake text-blue-500"></i>
                    Cold Start
                  </div>
                  <div className="text-stone-600 text-xs">컨테이너 생성 후 실행</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주요 컴포넌트 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              <i className="fa-solid fa-route text-amber-600 mr-3"></i>
              Router (라우팅 엔진)
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>QPS 모니터링:</strong> 실시간 트래픽 분석 및 예측</li>
              <li><strong>Pool 선택:</strong> 함수 특성에 따라 CPU/GPU/LARGE Pool 선택</li>
              <li><strong>Warm 스케일링:</strong> desiredWarm 계산 및 자동 스케일링</li>
              <li><strong>우선순위 관리:</strong> LOW/MEDIUM/HIGH/CRITICAL</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              <i className="fa-solid fa-layer-group text-blue-600 mr-3"></i>
              Resource Pools
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>CPU Pool:</strong> 범용 컴퓨팅 작업</li>
              <li><strong>GPU Pool:</strong> 고성능/병렬 처리 작업</li>
              <li><strong>LARGE Pool:</strong> 대용량 메모리/CPU 작업</li>
              <li><strong>Node 관리:</strong> 각 Pool은 여러 EC2 Node로 구성</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              <i className="fa-solid fa-temperature-high text-green-600 mr-3"></i>
              Warm Instance Management
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>desiredWarm:</strong> Router가 계산한 목표 Warm 인스턴스 수</li>
              <li><strong>currentWarm:</strong> 현재 준비된 Warm 인스턴스 수</li>
              <li><strong>자동 스케일링:</strong> QPS 증가 시 Warm 인스턴스 사전 생성</li>
              <li><strong>Cold Start 방지:</strong> 예측 기반 Pre-warming</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 shadow-sm">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              <i className="fa-solid fa-code text-purple-600 mr-3"></i>
              Function Lifecycle
            </h3>
            <ul className="list-disc pl-5 text-stone-600 space-y-2 text-sm">
              <li><strong>등록:</strong> POST /function - 함수 코드 및 설정 업로드</li>
              <li><strong>실행:</strong> POST /function/invoke - 동기 실행</li>
              <li><strong>상태:</strong> HOT / STABLE / COLD 상태 관리</li>
              <li><strong>모니터링:</strong> QPS, Latency, Error Rate 추적</li>
            </ul>
          </div>
        </div>

        {/* 데이터 흐름 */}
        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
          <h3 className="font-bold text-xl mb-4 flex items-center">
            <i className="fa-solid fa-diagram-project text-stone-700 mr-3"></i>
            데이터 흐름
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg border border-stone-300 shadow-sm">
              <span className="font-semibold text-stone-700">1. Client Request</span>
            </div>
            <i className="fa-solid fa-arrow-right text-stone-400"></i>
            <div className="bg-amber-100 px-4 py-2 rounded-lg border border-amber-300 shadow-sm">
              <span className="font-semibold text-amber-700">2. Router 분석</span>
            </div>
            <i className="fa-solid fa-arrow-right text-stone-400"></i>
            <div className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 shadow-sm">
              <span className="font-semibold text-blue-700">3. Pool 선택</span>
            </div>
            <i className="fa-solid fa-arrow-right text-stone-400"></i>
            <div className="bg-green-100 px-4 py-2 rounded-lg border border-green-300 shadow-sm">
              <span className="font-semibold text-green-700">4. Warm/Cold 실행</span>
            </div>
            <i className="fa-solid fa-arrow-right text-stone-400"></i>
            <div className="bg-purple-100 px-4 py-2 rounded-lg border border-purple-300 shadow-sm">
              <span className="font-semibold text-purple-700">5. 결과 반환</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

