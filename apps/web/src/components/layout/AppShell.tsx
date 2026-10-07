import React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  AlertTriangle, 
  RotateCcw, 
  BarChart3, 
  Blocks, 
  Settings,
  LogOut,
  Bell,
  Search
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../../contexts/AuthContext"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Risk Cases', href: '/risk-cases', icon: AlertTriangle },
  { name: 'Recovery', href: '/recovery', icon: RotateCcw },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: Blocks },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-landing-ivory">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-landing-deep text-landing-surface border-r border-landing-border/20">
        <div className="flex h-16 items-center px-6 border-b border-landing-border/10">
          <span className="text-xl font-bold tracking-tight text-landing-ivory uppercase">RecoverIQ</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-semibold rounded-md group transition-all",
                    isActive 
                      ? "bg-landing-graphite text-landing-champagne shadow-sm" 
                      : "text-landing-text-sec hover:bg-landing-graphite/50 hover:text-landing-ivory"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                      isActive ? "text-landing-champagne" : "text-landing-text-sec group-hover:text-landing-champagne-light"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-landing-border/10">
          <div 
            onClick={() => logout()}
            className="flex items-center group cursor-pointer hover:bg-landing-graphite/50 p-2 rounded-md transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-landing-ivory truncate">{user?.name || "Merchant"}</p>
              <p className="text-xs font-semibold text-landing-text-sec truncate">{user?.email || "merchant@recoveriq.dev"}</p>
            </div>
            <LogOut className="h-5 w-5 text-landing-text-sec group-hover:text-landing-failure transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-landing-border/50 bg-landing-surface px-6">
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-lg lg:max-w-xs relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-landing-text-sec" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-md border border-landing-border/60 bg-landing-ivory py-1.5 pl-10 pr-3 text-landing-graphite ring-1 ring-inset ring-transparent placeholder:text-landing-text-sec focus:ring-2 focus:ring-inset focus:ring-landing-champagne sm:text-sm sm:leading-6 transition-all"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6">
            <button className="rounded-full p-1 text-landing-text-sec hover:text-landing-graphite focus:outline-none transition-colors">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-3 relative">
              <div>
                <button className="flex max-w-xs items-center rounded-full bg-landing-champagne text-sm focus:outline-none ring-2 ring-landing-champagne/30 ring-offset-2 ring-offset-landing-surface transition-all hover:scale-105">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-landing-deep font-bold">
                    {user?.name?.charAt(0) || "M"}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-landing-ivory">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
