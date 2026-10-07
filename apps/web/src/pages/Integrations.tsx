import { useState, useEffect } from "react"
import { Plug, AlertTriangle, CheckCircle2, ShieldCheck, Trash2, Loader2, CreditCard } from "lucide-react"
import { fetchApi } from "../lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"

export function Integrations() {
  const [integration, setIntegration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form states
  const [isEditing, setIsEditing] = useState(false)
  const [keyId, setKeyId] = useState("")
  const [keySecret, setKeySecret] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchIntegrations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchApi("/integrations")
      // We only support RAZORPAY, so we find it or take the first
      const razorpay = res.data.integrations.find((i: any) => i.provider === "RAZORPAY")
      if (razorpay) {
        setIntegration(razorpay)
        setKeyId(razorpay.publicKey || "")
        // We do NOT prefill keySecret
      } else {
        setIntegration(null)
      }
    } catch (err: any) {
      console.error("Failed to fetch integrations:", err)
      setError("Failed to load integrations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const payload: any = {
        provider: "RAZORPAY",
      }
      if (keyId) payload.publicKey = keyId
      if (keySecret) payload.secretReference = keySecret
      if (webhookSecret) payload.webhookSecret = webhookSecret

      let res
      if (integration) {
        // Update
        res = await fetchApi(`/integrations/${integration.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        setSuccessMessage("Credentials updated successfully. Please verify connection.")
      } else {
        // Create
        res = await fetchApi("/integrations", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        setSuccessMessage("Integration created successfully.")
      }

      setIntegration(res.data.integration)
      setIsEditing(false)
      setKeySecret("") // Clear secret immediately
      setWebhookSecret("") // Clear webhook secret immediately
    } catch (err: any) {
      console.error("Save integration error:", err)
      setError(err.message || "Failed to save integration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async () => {
    if (!integration) return
    setIsVerifying(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetchApi(`/integrations/${integration.id}/verify`, {
        method: "POST"
      })
      
      setSuccessMessage(res.message || "Connection verified successfully.")
      // Re-fetch to get updated status and lastSyncedAt
      await fetchIntegrations()
    } catch (err: any) {
      console.error("Verify error:", err)
      setError(err.message || "Razorpay connection verification failed.")
      // Re-fetch in case status was updated
      await fetchIntegrations()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDelete = async () => {
    if (!integration) return
    if (!window.confirm("Are you sure you want to disconnect Razorpay? This will remove your configuration.")) return
    
    setIsDeleting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await fetchApi(`/integrations/${integration.id}`, {
        method: "DELETE"
      })
      setIntegration(null)
      setKeyId("")
      setKeySecret("")
      setWebhookSecret("")
      setIsEditing(false)
      setSuccessMessage("Integration disconnected successfully.")
    } catch (err: any) {
      console.error("Delete error:", err)
      setError(err.message || "Failed to disconnect integration.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <Badge variant="success">Connected</Badge>
      case "PENDING":
        return <Badge variant="warning">Connection pending verification</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 pb-10 h-full flex flex-col">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">Connect RecoverIQ to the payment infrastructure that powers your business.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : !integration && !isEditing ? (
        // EMPTY SETUP STATE
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="h-16 w-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Plug className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Razorpay</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Connect your Razorpay Test Mode account to verify payment credentials and prepare RecoverIQ for real payment event synchronization. No live transactions are performed in this phase.
          </p>
          <Button onClick={() => setIsEditing(true)}>
            Connect Razorpay
          </Button>
        </div>
      ) : (
        // INTEGRATION CONFIGURED OR EDITING
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Razorpay</CardTitle>
                    <p className="text-sm text-gray-500">Payment Gateway • Test Mode</p>
                  </div>
                </div>
                {integration && !isEditing && (
                  <div className="flex items-center gap-3">
                    {getStatusBadge(integration.status)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!isEditing && integration ? (
                // VIEW MODE
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Key ID</h4>
                      <div className="flex items-center text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                        {integration.publicKey || "Not configured"}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Credentials</h4>
                      <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                        {integration.hasCredentials ? (
                          <span className="flex items-center text-green-700">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Securely stored
                          </span>
                        ) : (
                          <span className="text-gray-500">Not configured</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Webhook Secret</h4>
                      <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                        {integration.hasWebhookSecret ? (
                          <span className="flex items-center text-green-700">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Securely stored
                          </span>
                        ) : (
                          <span className="text-gray-500">Not configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <span className="font-medium mr-2">Last verified:</span> 
                    {integration.lastSyncedAt ? new Date(integration.lastSyncedAt).toLocaleString() : "Not available"}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <Button 
                      variant="primary" 
                      onClick={handleVerify}
                      disabled={isVerifying || !integration.hasCredentials}
                    >
                      {isVerifying ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                      ) : (
                        "Verify Connection"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setKeyId(integration.publicKey || "")
                        setKeySecret("") // Always clear secret on edit
                        setWebhookSecret("")
                        setIsEditing(true)
                      }}
                      disabled={isVerifying}
                    >
                      Update Credentials
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={handleDelete}
                      disabled={isDeleting || isVerifying}
                    >
                      {isDeleting ? "Disconnecting..." : (
                        <><Trash2 className="mr-2 h-4 w-4" /> Disconnect</>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // EDIT MODE
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md flex items-start">
                    <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Razorpay Test Mode</p>
                      <p>Use Test Mode API credentials. No live transactions are performed by RecoverIQ in this phase.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="keyId" className="block text-sm font-medium text-gray-700 mb-1">
                        Razorpay Key ID
                      </label>
                      <Input
                        id="keyId"
                        type="text"
                        value={keyId}
                        onChange={(e) => setKeyId(e.target.value)}
                        placeholder="rzp_test_..."
                        required
                        className="font-mono"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="keySecret" className="block text-sm font-medium text-gray-700 mb-1">
                        Razorpay Key Secret
                      </label>
                      <Input
                        id="keySecret"
                        type="password"
                        value={keySecret}
                        onChange={(e) => setKeySecret(e.target.value)}
                        placeholder={integration?.hasCredentials ? "•••••••••••••••• (Leave blank to keep existing)" : "Enter Key Secret"}
                        required={!integration?.hasCredentials}
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook Secret
                      </label>
                      <Input
                        id="webhookSecret"
                        type="password"
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        placeholder={integration?.hasWebhookSecret ? "•••••••••••••••• (Leave blank to keep existing)" : "Enter Webhook Secret"}
                        autoComplete="current-password"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">Used to verify Razorpay webhook signatures.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                      ) : (
                        "Save Integration"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        if (integration) {
                          setIsEditing(false)
                          setKeyId(integration.publicKey || "")
                          setKeySecret("")
                          setWebhookSecret("")
                        } else {
                          setIsEditing(false)
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
