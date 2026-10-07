import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Activity, Webhook, KeyRound, Globe, Save, RefreshCw, PowerOff, Loader2 } from "lucide-react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Input } from "../ui/Input"
import type { MockIntegration, IntegrationEnvironment } from "../../data/integration.mock"

interface IntegrationDetailDrawerProps {
  integration: MockIntegration | null;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
  onTestConnection: (id: string) => void;
  onSaveConfig: (id: string, env: IntegrationEnvironment, pk: string, secretConfigured: boolean) => void;
}

export function IntegrationDetailDrawer({ 
  integration, isOpen, onClose, onDisconnect, onReconnect, onTestConnection, onSaveConfig
}: IntegrationDetailDrawerProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [editEnv, setEditEnv] = useState<IntegrationEnvironment>('Test');
  const [editPk, setEditPk] = useState("");
  const [editSecret, setEditSecret] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (integration) {
      setEditEnv(integration.environment);
      setEditPk(integration.publicKey);
      setEditSecret(integration.secretConfigured ? "********" : "");
      setIsEditing(false);
      setTestResult(null);
    }
  }, [integration, isOpen]);

  if (!isOpen || !integration) return null;

  const handleSave = () => {
    onSaveConfig(integration.id, editEnv, editPk, editSecret.length > 0);
    setIsEditing(false);
  };

  const handleTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(integration.status === 'Connected' ? 'Connection successful' : 'Connection requires attention');
      onTestConnection(integration.id);
    }, 1500);
  };

  const isDisconnected = integration.status === 'Disconnected';

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-gray-50 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-gray-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-50 border border-brand-200 text-brand-600 rounded flex items-center justify-center font-bold text-lg">
              {integration.provider.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{integration.provider}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 font-medium">{integration.providerType}</span>
                <span>•</span>
                <Badge variant={
                  integration.status === 'Connected' ? 'success' : 
                  integration.status === 'Needs Attention' ? 'error' : 'default'
                } className="h-5 px-1.5 text-[10px] uppercase">
                  {integration.status}
                </Badge>
                {integration.environment === 'Test' && (
                  <Badge variant="warning" className="h-5 px-1.5 text-[10px] uppercase bg-amber-100 text-amber-800">TEST</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isDisconnected ? (
               <Button variant="outline" size="sm" onClick={() => onDisconnect(integration.id)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                 <PowerOff className="h-3.5 w-3.5 mr-1.5" /> Disconnect
               </Button>
            ) : (
               <Button variant="outline" size="sm" onClick={() => onReconnect(integration.id)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                 <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reconnect
               </Button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 pb-20">
          
          {/* Connection Health */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                 <Activity className="h-4 w-4 text-brand-500" /> Connection Health
               </h3>
               <Button size="sm" variant="outline" onClick={handleTest} disabled={isTesting || isDisconnected} className="h-8 text-xs">
                 {isTesting ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Testing...</> : 'Test Connection'}
               </Button>
            </div>
            
            {testResult && (
               <div className={`mb-4 p-3 rounded text-sm font-medium flex items-center gap-2 ${testResult.includes('successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                 {testResult.includes('successful') ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                 {testResult}
               </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
                 <span className="text-xs text-gray-500">API Connection</span>
                 <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                    {integration.connectionStatus === 'Healthy' && !isDisconnected ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-gray-300"></span>}
                    {!isDisconnected ? integration.connectionStatus : 'Offline'}
                 </span>
               </div>
               <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
                 <span className="text-xs text-gray-500">Webhook Connection</span>
                 <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                    {integration.webhookStatus === 'Healthy' && !isDisconnected ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-gray-300"></span>}
                    {!isDisconnected ? integration.webhookStatus : 'Offline'}
                 </span>
               </div>
               <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
                 <span className="text-xs text-gray-500">Synchronization</span>
                 <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                    {integration.status === 'Connected' ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-gray-300"></span>}
                    {!isDisconnected ? 'Healthy' : 'Offline'}
                 </span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-gray-500">Authentication</span>
                 <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {integration.configurationStatus}
                 </span>
               </div>
            </div>
            {!isDisconnected && (
               <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                 <span>Last Sync: {integration.lastSyncedAt}</span>
                 <span>Last Webhook: {integration.lastWebhookAt}</span>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                   <KeyRound className="h-4 w-4 text-gray-500" /> Configuration
                 </h3>
                 {!isEditing ? (
                   <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 text-xs text-brand-600">Edit</Button>
                 ) : (
                   <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-7 text-xs text-gray-500">Cancel</Button>
                     <Button size="sm" onClick={handleSave} className="h-7 text-xs"><Save className="h-3 w-3 mr-1"/> Save</Button>
                   </div>
                 )}
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Environment</label>
                    {isEditing ? (
                      <select 
                        className="w-full h-9 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-brand-500 focus:outline-none"
                        value={editEnv}
                        onChange={e => setEditEnv(e.target.value as IntegrationEnvironment)}
                      >
                         <option value="Test">Test</option>
                         <option value="Live">Live</option>
                      </select>
                    ) : (
                      <div className="font-medium text-sm flex items-center gap-2">
                        {integration.environment} 
                        {integration.environment === 'Test' && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Public Key</label>
                    {isEditing ? (
                      <Input value={editPk} onChange={e => setEditPk(e.target.value)} className="h-9" />
                    ) : (
                      <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 truncate">
                        {integration.publicKey.substring(0, 10)}••••••••••
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Secret Key</label>
                    {isEditing ? (
                      <Input type="password" value={editSecret} onChange={e => setEditSecret(e.target.value)} placeholder="Enter new secret to update" className="h-9" />
                    ) : (
                      <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                         {integration.secretConfigured ? (
                           <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Configured (Hidden)</>
                         ) : (
                           <><AlertTriangle className="h-4 w-4 text-amber-500" /> Not Configured</>
                         )}
                      </div>
                    )}
                 </div>
              </div>
              
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded p-3 flex gap-2">
                 <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-800">
                    Secret credentials are not displayed. Credentials should be stored securely by the backend. Integration access is scoped to your merchant account.
                 </p>
              </div>
            </div>

            {/* Webhooks */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Webhook className="h-4 w-4 text-gray-500" /> Webhooks
              </h3>
              
              <div className="space-y-4 flex-1">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL Endpoint</label>
                    <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2 truncate">
                      <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0"/> {integration.webhookUrl}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 border border-gray-100 rounded p-2 text-center">
                       <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Received</p>
                       <p className="font-bold text-gray-900">{integration.webhookStats.received.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2 text-center">
                       <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Processed</p>
                       <p className="font-bold text-gray-900">{integration.webhookStats.processed.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded p-2 text-center">
                       <p className="text-[10px] text-red-700 font-semibold uppercase mb-1">Failed</p>
                       <p className="font-bold text-red-600">{integration.webhookStats.failed.toLocaleString()}</p>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Supported Events</label>
                    <div className="flex flex-wrap gap-1.5">
                       {integration.supportedEvents.map(evt => (
                          <span key={evt} className="px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[10px] rounded border border-gray-200">
                            {evt}
                          </span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-100 rounded p-3">
                 <p className="text-xs text-gray-500">
                   Webhook signatures will be verified server-side. The actual webhook endpoint logic is handled securely in the backend.
                 </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
               <Activity className="h-4 w-4 text-gray-500" /> Integration Activity
             </h3>
             <div className="relative border-l-2 border-gray-100 ml-3 space-y-5">
               {integration.activity.map(act => {
                 let color = "bg-gray-400";
                 if (act.status === 'success') color = "bg-emerald-500";
                 if (act.status === 'warning') color = "bg-amber-500";
                 if (act.status === 'info') color = "bg-blue-500";
                 if (act.status === 'error') color = "bg-red-500";

                 return (
                   <div key={act.id} className="relative pl-5">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${color}`}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{act.event}</span>
                        <span className="text-xs text-gray-500">{act.timestamp}</span>
                      </div>
                   </div>
                 )
               })}
             </div>
          </div>

        </div>
      </div>
    </>
  );
}


interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (provider: string, env: IntegrationEnvironment, pk: string, secret: string) => void;
}

export function AddIntegrationModal({ isOpen, onClose, onAdd }: AddIntegrationModalProps) {
  const [provider, setProvider] = useState("Razorpay");
  const [env, setEnv] = useState<IntegrationEnvironment>("Test");
  const [pk, setPk] = useState("");
  const [secret, setSecret] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider && pk && secret) {
      onAdd(provider, env, pk, secret);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Integration</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-xs flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>This is a MOCK UI. Do not enter real production secrets. Demo configuration will be saved locally.</p>
          </div>

          <form id="add-int-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select 
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                value={provider}
                onChange={e => setProvider(e.target.value)}
              >
                <option value="Razorpay">Razorpay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
              <select 
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                value={env}
                onChange={e => setEnv(e.target.value as IntegrationEnvironment)}
              >
                <option value="Test">Test</option>
                <option value="Live">Live</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
              <Input 
                value={pk} 
                onChange={e => setPk(e.target.value)} 
                placeholder="rzp_test_..." 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
              <Input 
                type="password"
                value={secret} 
                onChange={e => setSecret(e.target.value)} 
                placeholder="secret..." 
                required 
              />
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-int-form">Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}
