import { Outlet } from 'react-router-dom'
import { Navigation, Footer } from '../components'

export function RootLayout() {
  return (
    <div className="text-stone-800 min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
