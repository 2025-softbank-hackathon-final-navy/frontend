import { useState, useCallback, useRef, useEffect } from 'react'

interface Order {
  id: string
  status: 'pending' | 'processing' | 'done'
}

interface StoveState {
  status: 'off' | 'heating' | 'cooking'
}

interface KitchenSimulatorProps {
  isDeployed: boolean
  aiEnabled: boolean
}

export function KitchenSimulator({ isDeployed, aiEnabled }: KitchenSimulatorProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stoves, setStoves] = useState<{ [key: string]: StoveState }>({
    'stove-1': { status: 'off' },
    'stove-2': { status: 'off' },
  })
  const isProcessingRef = useRef(false)
  const ordersQueueRef = useRef<Order[]>([])

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || ordersQueueRef.current.length === 0) return
    
    isProcessingRef.current = true
    
    const stoveId = Math.random() > 0.5 ? 'stove-1' : 'stove-2'
    const order = ordersQueueRef.current.shift()!
    
    // Mark order as processing
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'processing' } : o))
    
    const prepTime = aiEnabled ? 500 : 2000

    // Heating
    setStoves(prev => ({ ...prev, [stoveId]: { status: 'heating' } }))
    await new Promise(r => setTimeout(r, prepTime))

    // Cooking
    setStoves(prev => ({ ...prev, [stoveId]: { status: 'cooking' } }))
    await new Promise(r => setTimeout(r, 1500))

    // Done - remove order
    setStoves(prev => ({ ...prev, [stoveId]: { status: 'off' } }))
    setOrders(prev => prev.filter(o => o.id !== order.id))
    
    isProcessingRef.current = false
    
    // Process next in queue
    if (ordersQueueRef.current.length > 0) {
      processQueue()
    }
  }, [aiEnabled])

  const addOrder = useCallback(() => {
    if (!isDeployed) return

    const ticketId = `#${Math.floor(Math.random() * 9000) + 1000}`
    const newOrder: Order = { id: ticketId, status: 'pending' }
    
    // Add to display
    setOrders(prev => [newOrder, ...prev])
    
    // Add to processing queue
    ordersQueueRef.current.push(newOrder)
    
    // Try to process
    processQueue()
  }, [isDeployed, processQueue])

  // Reset stoves when deployed
  useEffect(() => {
    if (isDeployed) {
      setStoves({
        'stove-1': { status: 'off' },
        'stove-2': { status: 'off' },
      })
    }
  }, [isDeployed])

  const getStoveContent = (status: StoveState['status']) => {
    switch (status) {
      case 'heating':
        return <span className="text-amber-600 font-bold animate-pulse"><i className="fa-solid fa-temperature-arrow-up"></i> Heating...</span>
      case 'cooking':
        return <span className="text-green-600 font-bold"><i className="fa-solid fa-fire"></i> Cooking...</span>
      default:
        return <span className="text-stone-400 text-sm">{isDeployed ? 'Ready' : 'Off'}</span>
    }
  }

  return (
    <section 
      id="simulator" 
      className={`scroll-mt-20 relative transition-all duration-500 ${!isDeployed ? 'opacity-50 pointer-events-none filter blur-sm' : ''}`}
    >
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Open Kitchen Dashboard</h2>
          <p className="text-stone-600">
            위에서 등록한 레시피가 실제로 어떻게 조리(실행)되는지 확인해보세요.
          </p>
        </div>
      </div>

      {/* Overlay for locked state */}
      {!isDeployed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center font-bold text-stone-500 bg-white/80 p-4 backdrop-blur rounded-lg">
            <i className="fa-solid fa-lock mr-2"></i>먼저 위에서 레시피를 등록(Deploy)해주세요.
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 kitchen-tile relative">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
          {/* Queue */}
          <div className="lg:col-span-3 bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col">
            <h3 className="font-bold text-stone-700 mb-3 border-b pb-2 flex justify-between">
              <span><i className="fa-solid fa-clipboard-list mr-2"></i>Orders</span>
              <span className="bg-stone-200 px-2 rounded-full text-xs flex items-center">{orders.length}</span>
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2">
              {orders.length === 0 ? (
                <div className="text-center text-stone-400 text-sm mt-10 italic">주문 대기 중...</div>
              ) : (
                orders.map((order) => (
                  <div 
                    key={order.id}
                    className={`bg-white p-3 rounded shadow-sm border-l-4 border-amber-500 flex justify-between items-center ticket-slide ${
                      order.status === 'processing' ? 'opacity-50' : ''
                    }`}
                  >
                    <div>
                      <span className="font-bold text-stone-700 text-sm">Order {order.id}</span>
                      <div className="text-[10px] text-stone-400">GET /api/cook</div>
                    </div>
                    {order.status === 'processing' ? (
                      <i className="fa-solid fa-check text-green-500"></i>
                    ) : (
                      <i className="fa-solid fa-spinner fa-spin text-stone-400"></i>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* The Pass - Click to add order */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center relative">
            <div className="hidden lg:block absolute top-1/2 -left-3 text-stone-300 text-2xl"><i className="fa-solid fa-circle-chevron-right"></i></div>
            <div className="hidden lg:block absolute top-1/2 -right-3 text-stone-300 text-2xl"><i className="fa-solid fa-circle-chevron-right"></i></div>
            <button
              onClick={addOrder}
              disabled={!isDeployed}
              className="bg-stone-800 text-stone-100 p-6 rounded-full w-40 h-40 flex flex-col justify-center items-center shadow-lg z-10 border-4 border-stone-200 cursor-pointer hover:bg-stone-700 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-stone-800 disabled:hover:border-stone-200"
            >
              <i className="fa-solid fa-bell text-3xl mb-2 text-amber-500"></i>
              <span className="font-bold">주문 넣기</span>
              <span className="text-xs text-stone-400 mt-1">Click!</span>
            </button>
          </div>

          {/* The Line */}
          <div className="lg:col-span-6 bg-stone-100 rounded-xl p-4 border border-stone-200">
            <h3 className="font-bold text-stone-700 mb-3 border-b pb-2"><i className="fa-solid fa-server mr-2"></i>Kitchen Line (EC2 Instances)</h3>
            <div className="grid grid-cols-2 gap-4">
              {['stove-1', 'stove-2'].map((stoveId, index) => (
                <div 
                  key={stoveId}
                  className={`stove bg-white p-4 rounded-lg border-2 border-stone-200 transition-all duration-300 ${
                    stoves[stoveId].status !== 'off' ? 'stove-active' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-stone-500">Stove #{index + 1}</span>
                    <i className={`fa-solid fa-circle text-xs ${
                      stoves[stoveId].status === 'cooking' ? 'text-green-500' : 
                      stoves[stoveId].status === 'heating' ? 'text-amber-500' : 'text-stone-300'
                    }`}></i>
                  </div>
                  <div className={`h-16 rounded flex items-center justify-center relative overflow-hidden ${
                    stoves[stoveId].status === 'cooking' ? 'bg-orange-50' : 'bg-stone-100'
                  }`}>
                    {getStoveContent(stoves[stoveId].status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
