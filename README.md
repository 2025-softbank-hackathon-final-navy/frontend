# Code Bistro: Serverless Kitchen

EC2 위에 직접 구축하는 맛있는 서버리스 키친

## 🍳 Tech Stack

- **Build Tool**: Vite
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Charts**: Chart.js + react-chartjs-2
- **Package Manager**: pnpm

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.tsx      # 상단 네비게이션
│   ├── Footer.tsx          # 하단 푸터
│   ├── HeroSection.tsx     # 히어로 & 메타포 섹션
│   ├── PrepStation.tsx     # 코드 에디터 섹션
│   ├── KitchenSimulator.tsx # 주방 대시보드 시뮬레이터
│   ├── ArchitectureSection.tsx # 아키텍처 다이어그램
│   ├── AISousChef.tsx      # AI 최적화 차트
│   └── index.ts            # 컴포넌트 배럴 export
├── styles/
│   └── globals.css         # 전역 스타일 & Tailwind
├── App.tsx                 # 메인 앱 컴포넌트
└── main.tsx               # 진입점
```

## 🎨 The Kitchen Metaphor

| Kitchen Term | Tech Equivalent |
|--------------|-----------------|
| Recipe | Code Function |
| Order | HTTP Request |
| Cookware | Docker Container |
| Stove | EC2 Instance |
| Pre-heat | Cold Start |

## 📦 Development

- Port: 3001
- Hot reload enabled
- TypeScript strict mode

## 📄 License

MIT

