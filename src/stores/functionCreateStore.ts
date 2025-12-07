import { create } from 'zustand'

/**
 * Function Create Wizard Store
 * 
 * PrepStation을 Step 기반 Wizard로 리팩토링하기 위한 상태 관리
 */

// Types
export type Runtime = 'nodejs-18' | 'python-3.11' | 'go-1.22'

export interface EnvVariable {
  key: string
  value: string
  isSecret: boolean
}

export type WizardStep = 'code' | 'runtime' | 'packages' | 'env' | 'review'

// Runtime 설정
export const RUNTIME_CONFIG: Record<Runtime, { 
  label: string
  extension: string
  language: string 
  icon: string
  packageFile: string
  packagePlaceholder: string
  enabled?: boolean // 활성화 여부
}> = {
  'python-3.11': { 
    label: 'Python 3.11', 
    extension: 'py', 
    language: 'python', 
    icon: 'fa-brands fa-python',
    packageFile: 'requirements.txt',
    packagePlaceholder: 'requests==2.31.0\nnumpy>=1.24.0\npandas',
    enabled: true
  },
  'nodejs-18': { 
    label: 'Node.js 18', 
    extension: 'js', 
    language: 'javascript', 
    icon: 'fa-brands fa-node-js',
    packageFile: 'package.json',
    packagePlaceholder: 'express\naxios\nlodash',
    enabled: false
  },
  'go-1.22': { 
    label: 'Go 1.22', 
    extension: 'go', 
    language: 'go', 
    icon: 'fa-brands fa-golang',
    packageFile: 'go.mod',
    packagePlaceholder: 'github.com/gin-gonic/gin\ngithub.com/go-redis/redis/v8',
    enabled: false
  },
}

// 런타임 순서 정의 (python, node, go 순서)
export const RUNTIME_ORDER: Runtime[] = ['python-3.11', 'nodejs-18', 'go-1.22']

// 기본 코드 템플릿
export const DEFAULT_CODE: Record<Runtime, string> = {
  'nodejs-18': `// 🍳 Chef's Special Recipe
export async function handler(event, context) {
  const ingredients = event.body;
  
  console.log("Preparing dish...");
  
  // Cooking Logic
  const dish = {
    name: "Serverless Pasta",
    status: "Delicious",
    cookedAt: new Date().toISOString()
  };

  return {
    statusCode: 200,
    body: JSON.stringify(dish)
  };
}`,
  'python-3.11': `def handler(input_data):
    return {"status": 200, "message": "Hello from Python"}`,
  'go-1.22': `// 🍳 Chef's Special Recipe
package main

import (
    "encoding/json"
    "time"
)

type Response struct {
    StatusCode int    \`json:"statusCode"\`
    Body       string \`json:"body"\`
}

type Dish struct {
    Name     string \`json:"name"\`
    Status   string \`json:"status"\`
    CookedAt string \`json:"cookedAt"\`
}

func Handler(event map[string]interface{}) Response {
    println("Preparing dish...")
    
    dish := Dish{
        Name:     "Serverless Pasta",
        Status:   "Delicious",
        CookedAt: time.Now().Format(time.RFC3339),
    }
    
    body, _ := json.Marshal(dish)
    return Response{StatusCode: 200, Body: string(body)}
}`,
}

// Wizard Steps 정의 (5단계)
export const WIZARD_STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'code', label: 'Runtime & Code', icon: 'fa-solid fa-code' },
  { id: 'runtime', label: 'Resources', icon: 'fa-solid fa-microchip' },
  { id: 'packages', label: 'Packages', icon: 'fa-solid fa-cube' },
  { id: 'env', label: 'Env & Secrets', icon: 'fa-solid fa-key' },
  { id: 'review', label: 'Review & Deploy', icon: 'fa-solid fa-rocket' },
]

// Store State Interface
interface FunctionCreateState {
  // Wizard State
  currentStep: WizardStep
  
  // Function Spec
  functionName: string
  description: string
  runtime: Runtime
  code: string
  packages: string // 패키지 목록 (줄바꿈 구분)
  envVariables: EnvVariable[]
  
  // Resource Settings
  memory: number // MB
  timeout: number // seconds
  
  // UI State
  isDeploying: boolean
  isRunning: boolean
  consoleOutput: string[]
  showConsole: boolean
  
  // Actions - Navigation
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  
  // Actions - Function Spec
  setFunctionName: (name: string) => void
  setDescription: (desc: string) => void
  setRuntime: (runtime: Runtime) => void
  setCode: (code: string) => void
  setPackages: (packages: string) => void
  
  // Actions - Env Variables
  addEnvVariable: () => void
  removeEnvVariable: (index: number) => void
  updateEnvVariable: (index: number, field: keyof EnvVariable, value: string | boolean) => void
  
  // Actions - Resource
  setMemory: (memory: number) => void
  setTimeout: (timeout: number) => void
  
  // Actions - UI
  setDeploying: (value: boolean) => void
  setRunning: (value: boolean) => void
  addConsoleOutput: (lines: string[]) => void
  clearConsole: () => void
  setShowConsole: (value: boolean) => void
  
  // Actions - Reset
  reset: () => void
  
  // Computed - Get API Request format
  toCreateRequest: () => {
    name: string
    runtime: Runtime
    sourceCode: string
    envVars: Record<string, string>
    timeout: number
    description?: string
  }
}

const initialState = {
  currentStep: 'code' as WizardStep,
  functionName: '',
  description: '',
  runtime: 'python-3.11' as Runtime,
  code: DEFAULT_CODE['python-3.11'],
  packages: '',
  envVariables: [{ key: '', value: '', isSecret: false }],
  memory: 256,
  timeout: 30,
  isDeploying: false,
  isRunning: false,
  consoleOutput: [],
  showConsole: false,
}

export const useFunctionCreateStore = create<FunctionCreateState>((set, get) => ({
  ...initialState,
  
  // Navigation Actions
  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const steps: WizardStep[] = ['code', 'runtime', 'packages', 'env', 'review']
    const currentIndex = steps.indexOf(get().currentStep)
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] })
    }
  },
  
  prevStep: () => {
    const steps: WizardStep[] = ['code', 'runtime', 'packages', 'env', 'review']
    const currentIndex = steps.indexOf(get().currentStep)
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] })
    }
  },
  
  // Function Spec Actions
  setFunctionName: (name) => set({ functionName: name }),
  setDescription: (desc) => set({ description: desc }),
  
  setRuntime: (runtime) => {
    // Python만 활성화, 다른 런타임으로 변경 시도 시 무시
    if (runtime !== 'python-3.11') {
      console.warn('Only Python runtime is currently enabled')
      return
    }
    set({ 
      runtime, 
      code: DEFAULT_CODE[runtime],
      packages: '', // 런타임 변경 시 패키지 초기화
    })
  },
  
  setCode: (code) => set({ code }),
  setPackages: (packages) => set({ packages }),
  
  // Env Variables Actions
  addEnvVariable: () => set((state) => ({
    envVariables: [...state.envVariables, { key: '', value: '', isSecret: false }]
  })),
  
  removeEnvVariable: (index) => set((state) => ({
    envVariables: state.envVariables.filter((_, i) => i !== index)
  })),
  
  updateEnvVariable: (index, field, value) => set((state) => ({
    envVariables: state.envVariables.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    )
  })),
  
  // Resource Actions
  setMemory: (memory) => set({ memory }),
  setTimeout: (timeout) => set({ timeout }),
  
  // UI Actions
  setDeploying: (value) => set({ isDeploying: value }),
  setRunning: (value) => set({ isRunning: value }),
  
  addConsoleOutput: (lines) => set((state) => ({
    consoleOutput: [...state.consoleOutput, ...lines],
    showConsole: true,
  })),
  
  clearConsole: () => set({ consoleOutput: [] }),
  setShowConsole: (value) => set({ showConsole: value }),
  
  // Reset
  reset: () => set(initialState),
  
  // API Request Format
  toCreateRequest: () => {
    const state = get()
    const envVars: Record<string, string> = {}
    
    state.envVariables
      .filter(e => e.key.trim() !== '')
      .forEach(e => {
        envVars[e.key] = e.value
      })
    
    // 패키지 문자열을 배열로 변환 (빈 줄 제거)

    return {
      name: state.functionName,
      runtime: state.runtime,
      sourceCode: state.code,
      envVars,
      timeout: state.timeout,
      ...(state.description && { description: state.description }),
    }
  },
}))
