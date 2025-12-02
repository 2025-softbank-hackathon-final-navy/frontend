import { useState } from 'react'
import Editor from '@monaco-editor/react'

interface PrepStationProps {
  onDeploy: () => void
  isDeployed: boolean
}

type Runtime = 'node' | 'python' | 'go'

const RUNTIME_CONFIG: Record<Runtime, { label: string; extension: string; language: string }> = {
  node: { label: 'Node.js', extension: 'js', language: 'javascript' },
  python: { label: 'Python', extension: 'py', language: 'python' },
  go: { label: 'Go', extension: 'go', language: 'go' },
}

const DEFAULT_CODE: Record<Runtime, string> = {
  node: `module.exports = async function(req, res) {
  // 🍳 Chef's Special Recipe
  const ingredients = req.body;
  
  console.log("Preparing dish...");
  
  // Cooking Logic
  const dish = {
    name: "Serverless Pasta",
    status: "Delicious",
    cookedAt: new Date()
  };

  return res.json(dish);
};`,
  python: `# 🍳 Chef's Special Recipe
import json
from datetime import datetime

def handler(req):
    ingredients = req.get("body", {})
    
    print("Preparing dish...")
    
    # Cooking Logic
    dish = {
        "name": "Serverless Pasta",
        "status": "Delicious",
        "cookedAt": datetime.now().isoformat()
    }
    
    return {"statusCode": 200, "body": dish}`,
  go: `// 🍳 Chef's Special Recipe
package main

import (
    "fmt"
    "time"
)

type Dish struct {
    Name     string \`json:"name"\`
    Status   string \`json:"status"\`
    CookedAt string \`json:"cookedAt"\`
}

func Handler(req map[string]interface{}) Dish {
    fmt.Println("Preparing dish...")
    
    // Cooking Logic
    return Dish{
        Name:     "Serverless Pasta",
        Status:   "Delicious",
        CookedAt: time.Now().Format(time.RFC3339),
    }
}`,
}

// Simple code analyzer
function analyzeCode(code: string, runtime: Runtime): {
  consoleLogs: string[]
  returnValue: any
} {
  const consoleLogs: string[] = []
  let returnValue: any = null

  try {
    if (runtime === 'node') {
      const logMatches = code.matchAll(/console\.log\(['"](.*?)['"]/g)
      for (const match of logMatches) {
        consoleLogs.push(match[1])
      }
      const nameMatch = code.match(/name:\s*['"](.*?)['"]/);
      const statusMatch = code.match(/status:\s*['"](.*?)['"]/);
      if (nameMatch || statusMatch) {
        returnValue = {
          name: nameMatch?.[1] || 'Unknown',
          status: statusMatch?.[1] || 'Unknown',
          cookedAt: new Date().toISOString()
        }
      }
    } else if (runtime === 'python') {
      const printMatches = code.matchAll(/print\(['"](.*?)['"]/g)
      for (const match of printMatches) {
        consoleLogs.push(match[1])
      }
      const nameMatch = code.match(/"name":\s*['"](.*?)['"]/);
      const statusMatch = code.match(/"status":\s*['"](.*?)['"]/);
      if (nameMatch || statusMatch) {
        returnValue = {
          name: nameMatch?.[1] || 'Unknown',
          status: statusMatch?.[1] || 'Unknown',
          cookedAt: new Date().toISOString()
        }
      }
    } else if (runtime === 'go') {
      const fmtMatches = code.matchAll(/fmt\.Println\(['"](.*?)['"]/g)
      for (const match of fmtMatches) {
        consoleLogs.push(match[1])
      }
      const nameMatch = code.match(/Name:\s*['"](.*?)['"]/);
      const statusMatch = code.match(/Status:\s*['"](.*?)['"]/);
      if (nameMatch || statusMatch) {
        returnValue = {
          name: nameMatch?.[1] || 'Unknown',
          status: statusMatch?.[1] || 'Unknown',
          cookedAt: new Date().toISOString()
        }
      }
    }
  } catch {
    // Analysis failed
  }

  return { consoleLogs, returnValue }
}

interface EnvVariable {
  key: string
  value: string
  isSecret: boolean
}

export function PrepStation({ onDeploy, isDeployed }: PrepStationProps) {
  const [runtime, setRuntime] = useState<Runtime>('node')
  const [code, setCode] = useState(DEFAULT_CODE.node)
  const [functionName, setFunctionName] = useState('serverless-pasta')
  const [isDeploying, setIsDeploying] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [showConsole, setShowConsole] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([
    { key: '', value: '', isSecret: false }
  ])
  const [modalConsoleOpen, setModalConsoleOpen] = useState(false)
  const [modalConsoleHeight, setModalConsoleHeight] = useState(200)
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false)

  const handleRuntimeChange = (newRuntime: Runtime) => {
    setRuntime(newRuntime)
    setCode(DEFAULT_CODE[newRuntime])
    setConsoleOutput([])
    setShowConsole(false)
  }

  const handleAddEnvVariable = () => {
    setEnvVariables([...envVariables, { key: '', value: '', isSecret: false }])
  }

  const handleRemoveEnvVariable = (index: number) => {
    setEnvVariables(envVariables.filter((_, i) => i !== index))
  }

  const handleEnvVariableChange = (index: number, field: keyof EnvVariable, value: string | boolean) => {
    const updated = [...envVariables]
    updated[index] = { ...updated[index], [field]: value }
    setEnvVariables(updated)
  }

  const handleTestRun = () => {
    setIsRunning(true)
    setShowConsole(true)
    setConsoleOutput([])
    // 모달이 열려있으면 모달 콘솔도 열기
    if (isModalOpen) {
      setModalConsoleOpen(true)
    }

    const timeStr = new Date().toLocaleTimeString()
    const analysis = analyzeCode(code, runtime)
    const duration = Math.floor(Math.random() * 200) + 50

    setConsoleOutput([
      `[${timeStr}] 🚀 Starting test execution...`,
      `[${timeStr}] Runtime: ${RUNTIME_CONFIG[runtime].label}`,
      `[${timeStr}] Function: ${functionName}`,
      '',
    ])

    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Executing handler...`,
        '',
        ...analysis.consoleLogs.map(log => `[LOG] ${log}`),
        '',
      ])

      setTimeout(() => {
        setConsoleOutput(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Execution completed in ${duration}ms`,
          '',
          '─── Response ───',
          JSON.stringify(analysis.returnValue || { message: 'No return value' }, null, 2),
        ])
        setIsRunning(false)
      }, 300)
    }, 500)
  }

  const handleDeploy = () => {
    setIsDeploying(true)
    setShowConsole(true)
    
    const timeStr = () => new Date().toLocaleTimeString()
    
    setConsoleOutput([
      `[${timeStr()}] 📦 Starting deployment...`,
      `[${timeStr()}] Building ${functionName}...`,
    ])

    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        `[${timeStr()}] Packaging function (${(code.length / 1024).toFixed(1)} KB)...`,
        `[${timeStr()}] Uploading to Code Bistro...`,
      ])
    }, 500)

    setTimeout(() => {
      const validEnvVars = envVariables.filter(e => e.key.trim() !== '')
      const secretCount = validEnvVars.filter(e => e.isSecret).length
      const envCount = validEnvVars.length - secretCount
      
      setConsoleOutput(prev => [
        ...prev,
        `[${timeStr()}] Configuring runtime: ${RUNTIME_CONFIG[runtime].label}`,
        ...(validEnvVars.length > 0 ? [
          `[${timeStr()}] Setting ${envCount} env variable(s), ${secretCount} secret(s)...`,
          ...validEnvVars.map(e => `  → ${e.key}=${e.isSecret ? '••••••••' : e.value}`),
        ] : []),
      ])
    }, 1000)

    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        '',
        `[${timeStr()}] ✅ Deployment successful!`,
        '',
        '─── Deployment Info ───',
        `Function: ${functionName}`,
        `URL: https://codebistro.io/fn/${functionName}`,
        `Version: v${Date.now().toString().slice(-6)}`,
        '',
        '🎉 Your recipe is now live!',
      ])
      setIsDeploying(false)
      setShowStatus(true)
      onDeploy()
      
      setTimeout(() => {
        document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })
      }, 1000)
    }, 2000)
  }

  // Editor Header Component (재사용)
  const EditorHeader = ({ onClose }: { onClose?: () => void }) => (
    <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-[#333]">
      <div className="flex items-center gap-2">
        {/* 빨간색 - 기능 없음 */}
        <span 
          className="w-3 h-3 bg-red-500 rounded-full cursor-default"
          title="닫기 (비활성)"
        />
        {/* 노란색 - 모달 닫기 / 뒤로가기 */}
        <span 
          className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors"
          onClick={onClose}
          title="최소화"
        />
        {/* 초록색 - 모달 열기 (확대) */}
        <span 
          className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-400 transition-colors"
          onClick={() => setIsModalOpen(true)}
          title="확대"
        />
        <span className="text-xs text-stone-400 ml-2 font-mono">
          chef_special.{RUNTIME_CONFIG[runtime].extension}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Runtime selector in modal */}
        {isModalOpen && (
          <div className="flex gap-1">
            {(['node', 'python', 'go'] as Runtime[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRuntimeChange(r)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  runtime === r 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                }`}
              >
                {RUNTIME_CONFIG[r].label}
              </button>
            ))}
          </div>
        )}
        <div className="text-xs text-stone-500"><i className="fa-solid fa-code"></i></div>
      </div>
    </div>
  )

  return (
    <>
      <section id="prep-station" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              <i className="fa-solid fa-pen-to-square text-amber-600 mr-2"></i>Prep Station
            </h2>
            <p className="text-stone-600">
              셰프님, 오늘의 특선 요리 레시피(Code)를 작성해주세요.<br />
              이곳에 코드를 입력하고 배포하면, 키친에서 주문을 받을 준비가 완료됩니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRuntimeChange('node')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                runtime === 'node' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
              }`}
            >
              Node.js
            </button>
            <button
              onClick={() => handleRuntimeChange('python')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                runtime === 'python' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => handleRuntimeChange('go')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                runtime === 'go' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
              }`}
            >
              Go
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor UI */}
          <div className="bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-stone-800 flex flex-col h-[450px]">
            {/* Editor Header */}
            <EditorHeader onClose={() => {}} />
            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={RUNTIME_CONFIG[runtime].language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  padding: { top: 12 },
                }}
              />
            </div>
          </div>

          {/* Deploy Control */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm h-[450px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="font-bold text-lg">Recipe Settings</h3>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Function Name</label>
                <input 
                  type="text" 
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Memory (Prep Area)</label>
                <div className="w-full bg-stone-100 rounded-full h-2 mt-2">
                  <div className="bg-stone-400 h-2 rounded-full w-1/3"></div>
                </div>
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>128MB</span>
                  <span>2GB</span>
                </div>
              </div>
              
              {/* Environment Variables & Secrets - Button to open modal */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                  <i className="fa-solid fa-key mr-1"></i>
                  Environment Variables & Secrets
                </label>
                <button
                  onClick={() => setIsEnvModalOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <i className="fa-solid fa-gear text-amber-600"></i>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-stone-700">변수 관리</div>
                      <div className="text-xs text-stone-400">
                        {envVariables.filter(e => e.key.trim()).length}개 변수 설정됨
                      </div>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-stone-400 group-hover:text-amber-500 transition-colors"></i>
                </button>
              </div>

              {/* Success Status */}
              {showStatus && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  <span><strong>성공!</strong> 주문을 받을 준비 완료!</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="px-5 py-4 border-t border-stone-100 space-y-2 bg-stone-50">
              {/* Test Run Button */}
              <button
                onClick={handleTestRun}
                disabled={isRunning}
                className={`w-full p-2.5 rounded-lg font-bold shadow-sm transform transition-all active:scale-95 flex items-center justify-center gap-2 border ${
                  isRunning
                    ? 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-500 hover:text-amber-600'
                }`}
              >
                {isRunning ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play text-green-500"></i>
                    <span>Test Run</span>
                  </>
                )}
              </button>

              {/* Deploy Button */}
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className={`w-full p-2.5 rounded-lg font-bold shadow-md transform transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isDeployed 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : isDeploying 
                    ? 'bg-stone-800 text-white opacity-75 cursor-not-allowed'
                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                }`}
              >
                {isDeploying ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Deploying...</span>
                  </>
                ) : isDeployed ? (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Update Recipe</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>메뉴 등록하기 (Deploy)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Console Output */}
        {showConsole && (
          <div className="mt-6 bg-[#1e1e1e] rounded-xl shadow-xl overflow-hidden border border-stone-800">
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
                onClick={() => setShowConsole(false)}
                className="text-stone-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
              {consoleOutput.map((line, i) => (
                <div 
                  key={i} 
                  className={`${
                    line.includes('✅') || line.includes('✓') ? 'text-green-400' : 
                    line.includes('❌') || line.includes('ERROR') ? 'text-red-400' : 
                    line.includes('🚀') || line.includes('🎉') ? 'text-blue-400' :
                    line.includes('📦') ? 'text-yellow-400' :
                    line.includes('[LOG]') ? 'text-cyan-400' :
                    line.includes('───') ? 'text-stone-500' :
                    line.startsWith('{') || line.startsWith('}') || line.includes('"') ? 'text-green-300' :
                    'text-stone-300'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div 
            className="w-full max-w-6xl h-[90vh] bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-stone-700 flex flex-col animate-in zoom-in-95 duration-200"
            style={{ animation: 'modalIn 0.2s ease-out' }}
          >
            {/* Modal Editor Header */}
            <EditorHeader onClose={() => setIsModalOpen(false)} />
            
            {/* Monaco Editor - Resizable */}
            <div className="flex-1 flex flex-col min-h-0">
              <div 
                className="flex-1 min-h-0"
                style={{ height: modalConsoleOpen ? `calc(100% - ${modalConsoleHeight}px)` : '100%' }}
              >
                <Editor
                  height="100%"
                  language={RUNTIME_CONFIG[runtime].language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    padding: { top: 16 },
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
                        onClick={() => setConsoleOutput([])}
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
                    {consoleOutput.length === 0 ? (
                      <div className="text-stone-500 italic">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Test Run을 실행하면 여기에 로그가 표시됩니다.
                      </div>
                    ) : (
                      consoleOutput.map((line, i) => (
                        <div 
                          key={i} 
                          className={`${
                            line.includes('✅') || line.includes('✓') ? 'text-green-400' : 
                            line.includes('❌') || line.includes('ERROR') ? 'text-red-400' : 
                            line.includes('🚀') || line.includes('🎉') ? 'text-blue-400' :
                            line.includes('📦') ? 'text-yellow-400' :
                            line.includes('[LOG]') ? 'text-cyan-400' :
                            line.includes('───') ? 'text-stone-500' :
                            line.startsWith('{') || line.startsWith('}') || line.includes('"') ? 'text-green-300' :
                            'text-stone-300'
                          }`}
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

            {/* Modal Footer with Actions */}
            <div className="bg-[#252526] px-4 py-3 flex items-center justify-between border-t border-[#333]">
              <div className="flex items-center gap-4">
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
                  {consoleOutput.length > 0 && !modalConsoleOpen && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>
                <span className="text-xs text-stone-500">
                  Lines: {code.split('\n').length} | Chars: {code.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={() => {
                    handleDeploy()
                    setIsModalOpen(false)
                  }}
                  disabled={isDeploying}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
                >
                  <i className="fa-solid fa-rocket"></i>
                  Deploy
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-stone-700 text-stone-300 hover:bg-stone-600 transition-colors"
                >
                  <i className="fa-solid fa-compress"></i>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Variables Modal */}
      {isEnvModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEnvModalOpen(false)
          }}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'modalIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-key text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Environment Variables & Secrets</h3>
                    <p className="text-white/80 text-sm">함수에서 사용할 환경 변수를 설정하세요</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEnvModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-2"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                <div className="text-sm text-blue-700">
                  <strong>Tip:</strong> Secret으로 표시된 값은 암호화되어 저장되며, 배포 로그에서 마스킹됩니다.
                </div>
              </div>

              {/* Variables List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {envVariables.map((env, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="KEY_NAME"
                        value={env.key}
                        onChange={(e) => handleEnvVariableChange(index, 'key', e.target.value.toUpperCase())}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div className="text-stone-300">=</div>
                    <div className="flex-1 relative">
                      <input
                        type={env.isSecret ? 'password' : 'text'}
                        placeholder={env.isSecret ? '••••••••' : 'value'}
                        value={env.value}
                        onChange={(e) => handleEnvVariableChange(index, 'value', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-10"
                      />
                    </div>
                    <button
                      onClick={() => handleEnvVariableChange(index, 'isSecret', !env.isSecret)}
                      className={`p-2.5 rounded-lg transition-all ${
                        env.isSecret 
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                          : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                      }`}
                      title={env.isSecret ? 'Secret (암호화됨)' : '일반 변수 (클릭하여 Secret으로 변경)'}
                    >
                      <i className={`fa-solid ${env.isSecret ? 'fa-lock' : 'fa-lock-open'}`}></i>
                    </button>
                    <button
                      onClick={() => handleRemoveEnvVariable(index)}
                      className="p-2.5 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-100 hover:text-red-500 transition-all"
                      title="삭제"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Variable Button */}
              <button
                onClick={handleAddEnvVariable}
                className="mt-4 w-full p-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                <span>새 변수 추가</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-t border-stone-200">
              <div className="text-sm text-stone-500">
                <i className="fa-solid fa-circle-check text-green-500 mr-2"></i>
                {envVariables.filter(e => e.key.trim()).length}개 변수 설정됨
                {envVariables.filter(e => e.key.trim() && e.isSecret).length > 0 && (
                  <span className="ml-2">
                    (<i className="fa-solid fa-lock text-amber-500 mr-1"></i>
                    {envVariables.filter(e => e.key.trim() && e.isSecret).length}개 Secret)
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEnvModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => setIsEnvModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  <i className="fa-solid fa-check mr-2"></i>
                  저장
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
