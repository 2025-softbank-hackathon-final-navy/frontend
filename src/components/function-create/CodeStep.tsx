import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useTranslation } from 'react-i18next'
import { useFunctionCreateStore, RUNTIME_CONFIG, RUNTIME_ORDER } from '../../stores/functionCreateStore'

export function CodeStep() {
  const { t } = useTranslation()
  const { 
    functionName, 
    setFunctionName,
    description,
    setDescription,
    runtime,
    setRuntime,
    code, 
    setCode,
    nextStep 
  } = useFunctionCreateStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalConsoleOpen, setModalConsoleOpen] = useState(false)
  const [modalConsoleHeight, setModalConsoleHeight] = useState(200)
  const [isRunning, setIsRunning] = useState(false)
  const [localConsoleOutput, setLocalConsoleOutput] = useState<string[]>([])
  
  const config = RUNTIME_CONFIG[runtime]
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])
  
  const isValid = functionName.trim().length > 0 && code.trim().length > 0
  
  // 코드 분석 및 실행 (JIT)
  const executeCode = () => {
    const logs: string[] = []
    let result: unknown = null
    let error: string | null = null
    
    if (runtime === 'nodejs-18') {
      // JavaScript: 실제 실행
      try {
        const originalLog = console.log
        const capturedLogs: string[] = []
        
        // console.log 캡처
        console.log = (...args) => {
          capturedLogs.push(args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' '))
        }
        
        // 코드에서 handler/export 함수 추출 및 실행
        const wrappedCode = `
          ${code}
          // 함수 실행 시도
          if (typeof handler === 'function') {
            return handler({}, {});
          } else if (typeof module !== 'undefined' && typeof module.exports === 'function') {
            return module.exports({}, {});
          }
          return null;
        `
        
        // eslint-disable-next-line no-new-func
        const fn = new Function('module', 'exports', wrappedCode)
        const moduleObj = { exports: {} }
        result = fn(moduleObj, moduleObj.exports)
        
        // console.log 복원
        console.log = originalLog
        logs.push(...capturedLogs)
        
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }
    } else if (runtime === 'python-3.11') {
      // Python: 정규식으로 print 추출 (시뮬레이션)
      const printMatches = code.matchAll(/print\s*\(\s*(?:f?['"](.+?)['"]|(.+?))\s*\)/g)
      for (const match of printMatches) {
        logs.push(match[1] || match[2] || '')
      }
      
      // return 문 분석
      const returnMatch = code.match(/return\s*(\{[\s\S]*?\})/m)
      if (returnMatch) {
        try {
          // Python dict를 JSON으로 변환 시도
          const jsonStr = returnMatch[1]
            .replace(/'/g, '"')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false')
            .replace(/None/g, 'null')
          result = JSON.parse(jsonStr)
        } catch {
          result = { raw: returnMatch[1] }
        }
      }
    } else if (runtime === 'go-1.22') {
      // Go: fmt.Println 추출 (시뮬레이션)
      const fmtMatches = code.matchAll(/fmt\.Println\s*\(\s*['"](.+?)['"]\s*\)/g)
      for (const match of fmtMatches) {
        logs.push(match[1])
      }
      
      // return 문 분석
      const returnMatch = code.match(/return\s+([\w]+)\s*\{([\s\S]*?)\}/m)
      if (returnMatch) {
        const fields = returnMatch[2].match(/(\w+):\s*['"]?([^,'"}\n]+)['"]?/g)
        if (fields) {
          const obj: Record<string, string> = {}
          fields.forEach(f => {
            const [key, val] = f.split(':').map(s => s.trim().replace(/['"]/g, ''))
            obj[key] = val
          })
          result = obj
        }
      }
    }
    
    return { logs, result, error }
  }
  
  // Test Run 핸들러
  const handleTestRun = () => {
    setIsRunning(true)
    setLocalConsoleOutput([])
    setModalConsoleOpen(true)
    
    const timeStr = () => new Date().toLocaleTimeString()
    const startTime = performance.now()
    
    setLocalConsoleOutput([
      `[${timeStr()}] 🚀 Starting test execution...`,
      `[${timeStr()}] Runtime: ${config.label}`,
      `[${timeStr()}] Function: ${functionName || 'untitled'}`,
      '',
    ])
    
    setTimeout(() => {
      setLocalConsoleOutput(prev => [
        ...prev,
        `[${timeStr()}] Executing handler...`,
        '',
      ])
      
      setTimeout(() => {
        const { logs, result, error } = executeCode()
        const duration = Math.round(performance.now() - startTime)
        
        if (error) {
          setLocalConsoleOutput(prev => [
            ...prev,
            `[${timeStr()}] ❌ Execution failed!`,
            '',
            `[ERROR] ${error}`,
          ])
        } else {
          setLocalConsoleOutput(prev => [
            ...prev,
            ...logs.map(log => `[LOG] ${log}`),
            ...(logs.length > 0 ? [''] : []),
            `[${timeStr()}] ✅ Execution completed in ${duration}ms`,
            '',
            '─── Response ───',
            result ? JSON.stringify(result, null, 2) : '{ "message": "No return value" }',
          ])
        }
        
        setIsRunning(false)
      }, 300)
    }, 200)
  }
  
  // Console 라인 색상
  const getLineClassName = (line: string) => {
    if (line.includes('✅') || line.includes('✓')) return 'text-green-400'
    if (line.includes('❌') || line.includes('ERROR') || line.includes('[ERROR]')) return 'text-red-400'
    if (line.includes('🚀') || line.includes('🎉')) return 'text-blue-400'
    if (line.includes('📦')) return 'text-yellow-400'
    if (line.includes('[LOG]')) return 'text-cyan-400'
    if (line.includes('───')) return 'text-stone-500'
    if (line.startsWith('{') || line.startsWith('}') || line.includes('"')) return 'text-green-300'
    return 'text-stone-300'
  }
  
  // Editor Header Component (재사용)
  const EditorHeader = ({ isModal = false }: { isModal?: boolean }) => (
    <div className="bg-[#252526] px-4 py-2.5 flex items-center justify-between border-b border-[#333]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {/* 빨간색 - 기능 없음 */}
          <span 
            className="w-3 h-3 bg-red-500 rounded-full cursor-default"
            title="닫기 (비활성)"
          />
          {/* 노란색 - 모달 닫기 */}
          <span 
            className={`w-3 h-3 bg-yellow-500 rounded-full transition-colors ${
              isModal ? 'cursor-pointer hover:bg-yellow-400' : 'cursor-default'
            }`}
            onClick={() => isModal && setIsModalOpen(false)}
            title={isModal ? '축소' : '최소화'}
          />
          {/* 초록색 - 모달 열기 (확대) */}
          <span 
            className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-400 transition-colors"
            onClick={() => setIsModalOpen(true)}
            title="확대"
          />
        </div>
        <span className="text-xs text-stone-400 font-mono ml-2">
          {functionName || 'untitled'}.{config.extension}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Runtime selector in modal */}
        {isModal && (
          <div className="flex gap-1">
            {RUNTIME_ORDER.map((key) => {
              const cfg = RUNTIME_CONFIG[key]
              const isEnabled = cfg.enabled !== false
              return (
                <button
                  key={key}
                  onClick={() => isEnabled && setRuntime(key)}
                  disabled={!isEnabled}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    !isEnabled
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'
                      : runtime === key 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                  }`}
                  title={!isEnabled ? 'Coming soon' : undefined}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <i className={config.icon}></i>
          <span>{config.label}</span>
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-code text-amber-500"></i>
            {t('functionCreate.code.title')}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {t('functionCreate.code.subtitle')}
          </p>
        </div>
        
        {/* Runtime Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            <i className="fa-solid fa-gear text-amber-500 mr-1.5"></i>
            {t('functionCreate.code.selectRuntime')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {RUNTIME_ORDER.map((key) => {
              const cfg = RUNTIME_CONFIG[key]
              const isEnabled = cfg.enabled !== false
              return (
                <button
                  key={key}
                  onClick={() => isEnabled && setRuntime(key)}
                  disabled={!isEnabled}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${!isEnabled
                      ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed'
                      : runtime === key 
                      ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10' 
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                    }
                  `}
                  title={!isEnabled ? 'Coming soon' : undefined}
                >
                  {runtime === key && isEnabled && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full">
                        <i className="fa-solid fa-check text-white text-xs"></i>
                      </span>
                    </div>
                  )}
                  
                  {!isEnabled && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-stone-300 rounded-full">
                        <i className="fa-solid fa-lock text-stone-600 text-xs"></i>
                      </span>
                    </div>
                  )}
                  
                  <div className={`text-xl mb-1 ${!isEnabled ? 'text-stone-300' : runtime === key ? 'text-amber-600' : 'text-stone-400'}`}>
                    <i className={cfg.icon}></i>
                  </div>
                  
                  <div className={`font-semibold text-sm ${!isEnabled ? 'text-stone-400' : runtime === key ? 'text-amber-700' : 'text-stone-700'}`}>
                    {cfg.label}
                  </div>
                  
                  {!isEnabled && (
                    <div className="text-xs text-stone-400 mt-1">
                      Coming soon
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Function Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <i className="fa-solid fa-tag text-amber-500 mr-1.5"></i>
              {t('functionCreate.code.functionName')} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-700 
                         focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              placeholder={t('functionCreate.code.functionNamePlaceholder')}
            />
            <p className="text-xs text-stone-400 mt-1">a-z, 0-9, - only</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              <i className="fa-solid fa-align-left text-amber-500 mr-1.5"></i>
              {t('functionCreate.code.description')}
            </label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-700 
                         focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              placeholder={t('functionCreate.code.descriptionPlaceholder')}
            />
          </div>
        </div>
        
        {/* Code Editor */}
        <div className="bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-stone-800">
          {/* Editor Header */}
          <EditorHeader />
          
          {/* Monaco Editor */}
          <div className="h-[350px]">
            <Editor
              height="100%"
              language={config.language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
          
          {/* Editor Footer */}
          <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-t border-[#333]">
            <span className="text-xs text-stone-500">
              Lines: {code.split('\n').length} | Chars: {code.length}
            </span>
            <div className="flex items-center gap-3">
              {/* Test Run Button */}
              <button
                onClick={handleTestRun}
                disabled={isRunning}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isRunning
                    ? 'bg-amber-600/20 text-amber-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-500'
                }`}
              >
                <i className={`fa-solid ${isRunning ? 'fa-circle-notch fa-spin' : 'fa-play'}`}></i>
                {isRunning ? 'Running...' : 'Test Run'}
              </button>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">UTF-8</span>
                <span className="text-stone-600">|</span>
                <span className="text-stone-500">{config.language}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Console Output (Main View) */}
        {localConsoleOutput.length > 0 && (
          <div className="bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-stone-800">
            <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333]">
              <div className="flex items-center gap-2 text-sm text-stone-300">
                <i className="fa-solid fa-terminal"></i>
                <span>Console</span>
                {isRunning && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    Running...
                  </span>
                )}
              </div>
              <button 
                onClick={() => setLocalConsoleOutput([])}
                className="text-stone-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
              {localConsoleOutput.map((line, i) => (
                <div 
                  key={i} 
                  className={getLineClassName(line)}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-end pt-4 border-t border-stone-200">
          <button
            onClick={nextStep}
            disabled={!isValid}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
              ${isValid 
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }
            `}
          >
            <span>{t('common.next')}: {t('functionCreate.steps.resources')}</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
      
      {/* Full Screen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div 
            className="w-full max-w-6xl h-[90vh] bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-stone-700 flex flex-col"
            style={{ animation: 'modalIn 0.2s ease-out' }}
          >
            {/* Modal Editor Header */}
            <EditorHeader isModal />
            
            {/* Monaco Editor - Resizable */}
            <div className="flex-1 flex flex-col min-h-0">
              <div 
                className="flex-1 min-h-0"
                style={{ height: modalConsoleOpen ? `calc(100% - ${modalConsoleHeight}px)` : '100%' }}
              >
                <Editor
                  height="100%"
                  language={config.language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    bracketPairColorization: { enabled: true },
                  }}
                />
              </div>
              
              {/* Modal Console Panel */}
              {modalConsoleOpen && (
                <div 
                  className="border-t border-[#333] flex flex-col bg-[#1e1e1e]"
                  style={{ height: modalConsoleHeight }}
                >
                  {/* Console Header - Draggable Resize Handle */}
                  <div 
                    className="bg-[#252526] px-4 py-1.5 flex items-center justify-between border-b border-[#333] cursor-ns-resize select-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const startY = e.clientY
                      const startHeight = modalConsoleHeight
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const delta = startY - moveEvent.clientY
                        const newHeight = Math.min(Math.max(startHeight + delta, 100), 500)
                        setModalConsoleHeight(newHeight)
                      }
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove)
                        document.removeEventListener('mouseup', handleMouseUp)
                      }
                      
                      document.addEventListener('mousemove', handleMouseMove)
                      document.addEventListener('mouseup', handleMouseUp)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-stone-300">
                        <i className="fa-solid fa-terminal"></i>
                        <span>Console</span>
                      </div>
                      {isRunning && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                          Running...
                        </span>
                      )}
                      <div className="text-[10px] text-stone-500">
                        <i className="fa-solid fa-grip-lines mr-1"></i>
                        드래그하여 크기 조절
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setLocalConsoleOutput([])}
                        className="text-stone-500 hover:text-white transition-colors text-xs px-2 py-0.5 rounded hover:bg-stone-700"
                        title="Clear console"
                      >
                        <i className="fa-solid fa-trash-can mr-1"></i>
                        Clear
                      </button>
                      <button 
                        onClick={() => setModalConsoleOpen(false)}
                        className="text-stone-500 hover:text-white transition-colors"
                        title="Close console"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                  {/* Console Output */}
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
                    {localConsoleOutput.length === 0 ? (
                      <div className="text-stone-500 italic">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Test Run을 실행하면 여기에 로그가 표시됩니다.
                      </div>
                    ) : (
                      localConsoleOutput.map((line, i) => (
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
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#252526] px-4 py-3 flex items-center justify-between border-t border-[#333]">
              <div className="flex items-center gap-4">
                {/* Console Toggle Button */}
                <button
                  onClick={() => setModalConsoleOpen(!modalConsoleOpen)}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                    modalConsoleOpen 
                      ? 'bg-stone-700 text-white' 
                      : 'text-stone-500 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  <i className="fa-solid fa-terminal"></i>
                  Console
                  {localConsoleOutput.length > 0 && !modalConsoleOpen && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>
                <span className="text-xs text-stone-500">
                  Lines: {code.split('\n').length} | Chars: {code.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Test Run Button */}
                <button
                  onClick={handleTestRun}
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRunning
                      ? 'bg-amber-600/20 text-amber-400 cursor-not-allowed'
                      : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                  }`}
                >
                  <i className={`fa-solid ${isRunning ? 'fa-circle-notch fa-spin' : 'fa-play'}`}></i>
                  {isRunning ? 'Running...' : 'Test Run'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                             bg-stone-700 text-stone-300 hover:bg-stone-600 transition-colors"
                >
                  <i className="fa-solid fa-compress"></i>
                  축소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
