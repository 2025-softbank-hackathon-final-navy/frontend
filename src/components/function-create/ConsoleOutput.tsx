interface ConsoleOutputProps {
  output: string[]
  isRunning: boolean
  onClose: () => void
  onClear: () => void
}

export function ConsoleOutput({ output, isRunning, onClose, onClear }: ConsoleOutputProps) {
  const getLineClassName = (line: string) => {
    if (line.includes('✅') || line.includes('✓')) return 'text-green-400'
    if (line.includes('❌') || line.includes('ERROR') || line.includes('error')) return 'text-red-400'
    if (line.includes('🚀') || line.includes('🎉')) return 'text-blue-400'
    if (line.includes('📦') || line.includes('⚠️') || line.includes('WARNING')) return 'text-yellow-400'
    if (line.includes('[LOG]') || line.includes('[INFO]')) return 'text-cyan-400'
    if (line.includes('───') || line.includes('---')) return 'text-stone-500'
    if (line.startsWith('{') || line.startsWith('}') || line.startsWith('[') || line.includes('"')) return 'text-green-300'
    if (line.startsWith('>') || line.startsWith('$')) return 'text-purple-400'
    return 'text-stone-300'
  }
  
  return (
    <div className="bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-stone-800">
      {/* Header */}
      <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-300">
            <i className="fa-solid fa-terminal"></i>
            <span>Console</span>
          </div>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="text-stone-500 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-stone-700"
            title="Clear console"
          >
            <i className="fa-solid fa-trash-can mr-1"></i>
            Clear
          </button>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-white transition-colors p-1 rounded hover:bg-stone-700"
            title="Close console"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      
      {/* Output */}
      <div className="p-4 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
        {output.length === 0 ? (
          <div className="text-stone-500 italic flex items-center gap-2">
            <i className="fa-solid fa-circle-info"></i>
            <span>실행 결과가 여기에 표시됩니다.</span>
          </div>
        ) : (
          output.map((line, i) => (
            <div 
              key={i} 
              className={getLineClassName(line)}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {line || '\u00A0'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

