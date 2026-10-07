import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Shield, AlertCircle, ArrowRight } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import shieldBg from "../assets/images/auth/shield-bg.png"

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      await login({ email, password })
      // Navigate back to where they were going, or default to dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || "Invalid credentials or network error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-landing-ivory">
      {/* Left side - Cinematic Abstract Graphic */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(14, 18, 16, 0.6), rgba(14, 18, 16, 0.8)), url(${shieldBg})` }}
      >
        {/* Subtle background glow/gradient */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-landing-champagne opacity-20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 bg-landing-champagne rounded flex items-center justify-center">
            <Shield className="h-6 w-6 text-landing-deep" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-landing-ivory uppercase">RecoverIQ</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-landing-ivory leading-tight mb-6">
            Welcome back to the Intelligence layer.
          </h1>
          <p className="text-landing-text-sec text-lg leading-relaxed mb-8">
            Manage your recovery engine, configure deterministic risk parameters, and watch your revenue grow in real-time.
          </p>
          <div className="flex items-center space-x-2 text-landing-champagne font-semibold text-sm tracking-wide uppercase">
            <span>Secure connection established</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-landing-ivory">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="mx-auto h-12 w-12 bg-landing-champagne rounded-lg flex items-center justify-center">
              <Shield className="h-8 w-8 text-landing-deep" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-landing-graphite uppercase">
              RecoverIQ
            </h2>
            <p className="mt-2 text-sm text-landing-text-sec">
              Sign in to your merchant dashboard
            </p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold text-landing-graphite">Sign in</h2>
            <p className="mt-2 text-sm text-landing-text-sec">
              Enter your credentials to access your dashboard.
            </p>
          </div>
          
          <Card className="border-none shadow-none bg-transparent lg:bg-landing-surface lg:border lg:border-landing-border/50 lg:shadow-sm">
            <CardContent className="pt-6 px-0 lg:px-6">
              {error && (
                <div className="mb-4 rounded-md bg-landing-failure/10 border border-landing-failure/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-landing-failure" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-landing-failure">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold leading-6 text-landing-graphite">
                    Email address
                  </label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="alice@acmecorp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-semibold leading-6 text-landing-graphite">
                      Password
                    </label>
                    <div className="text-sm">
                      <a href="#" className="font-semibold text-landing-text-sec hover:text-landing-graphite transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Sign in"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-8 text-center text-sm">
                <span className="text-landing-text-sec">Don't have an account? </span>
                <a href="/signup" className="font-bold text-landing-graphite hover:text-landing-champagne transition-colors">
                  Sign up
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
