import { useState } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Badge } from "../ui/Badge"
import { ShieldAlert, Monitor, Smartphone, AlertTriangle, HelpCircle, Plus, Settings as SettingsIcon } from "lucide-react"
import type { MockSettings, TeamMember } from "../../data/settings.mock"

interface SectionProps {
  settings: MockSettings;
  updateSettings: (newSettings: MockSettings) => void;
  showFeedback: (msg: string) => void;
}

export function BusinessProfileSection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [profile, setProfile] = useState(settings.businessProfile);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, businessProfile: profile });
    setIsDirty(false);
    showFeedback("Business profile updated.");
  };

  const handleCancel = () => {
    setProfile(settings.businessProfile);
    setIsDirty(false);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Business Profile</h2>
        <p className="text-sm text-gray-500">Manage the business information associated with your RecoverIQ account.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <Input name="businessName" value={profile.businessName} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
          <Input name="businessEmail" type="email" value={profile.businessEmail} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
          <Input name="businessPhone" value={profile.businessPhone} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <Input name="website" value={profile.website} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <select name="industry" value={profile.industry} onChange={handleChange} className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            <option value="E-commerce">E-commerce</option>
            <option value="SaaS">SaaS</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select name="currency" value={profile.currency} onChange={handleChange} className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {isDirty && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Unsaved changes
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function AccountSection({ settings }: SectionProps) {
  const { account } = settings;
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Account</h2>
        <p className="text-sm text-gray-500">Your personal account details.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <p className="text-sm font-medium text-gray-900">{account.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <p className="text-sm font-medium text-gray-900">{account.email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <Badge variant="default">{account.role}</Badge>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Account Status</label>
            <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {account.status}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Created At</label>
            <p className="text-sm text-gray-900">{account.createdAt}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SecuritySection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwd({ ...pwd, [e.target.name]: e.target.value });
    setPwdError("");
  };

  const handleSavePwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.current || !pwd.new || !pwd.confirm) {
      setPwdError("All fields are required.");
      return;
    }
    if (pwd.new !== pwd.confirm) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (pwd.new.length < 8) {
      setPwdError("Password must be at least 8 characters.");
      return;
    }
    
    // Success (Mock)
    setIsChangingPassword(false);
    setPwd({ current: "", new: "", confirm: "" });
    showFeedback("Password changed successfully.");
    updateSettings({
      ...settings,
      security: { ...settings.security, lastPasswordChange: "Just now" }
    });
  };

  const handleSignOutOther = () => {
    const newSessions = settings.security.sessions.filter(s => s.isCurrent);
    updateSettings({
      ...settings,
      security: { ...settings.security, sessions: newSessions }
    });
    showFeedback("Signed out of all other sessions.");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Password</h2>
            <p className="text-sm text-gray-500">Last changed: {settings.security.lastPasswordChange}</p>
          </div>
          <Button variant="outline" onClick={() => setIsChangingPassword(true)}>Change Password</Button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-4">
          <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="text-sm text-blue-800 space-y-1">
             <p className="font-semibold">Security Information</p>
             <ul className="list-disc pl-4 space-y-0.5 text-xs">
                <li>Credentials should be handled securely.</li>
                <li>Sensitive secrets should never be displayed in plain text.</li>
                <li>Session security is enforced by the backend.</li>
                <li>Integration secrets are handled separately in the Integrations module.</li>
             </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Sessions</h2>
            <p className="text-sm text-gray-500">Manage devices currently logged into your account.</p>
          </div>
          {settings.security.sessions.length > 1 && (
            <Button variant="outline" onClick={handleSignOutOther} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Sign out other sessions</Button>
          )}
        </div>
        
        <div className="space-y-4">
          {settings.security.sessions.map(sess => (
            <div key={sess.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                {sess.device === 'Windows' ? <Monitor className="h-5 w-5 text-gray-400 mt-0.5" /> : <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{sess.device} <span className="text-gray-400 font-normal">· {sess.browser}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{sess.lastActive}</p>
                </div>
              </div>
              {sess.isCurrent && <Badge variant="success" className="bg-emerald-100 text-emerald-800">Current Device</Badge>}
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handleSavePwd} className="p-5 space-y-4">
              {pwdError && (
                 <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {pwdError}
                 </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <Input type="password" name="current" value={pwd.current} onChange={handlePwdChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <Input type="password" name="new" value={pwd.new} onChange={handlePwdChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <Input type="password" name="confirm" value={pwd.confirm} onChange={handlePwdChange} required />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
                <Button type="submit">Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationsSection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [notifs, setNotifs] = useState(settings.notifications);
  const [isDirty, setIsDirty] = useState(false);

  const toggle = (key: keyof typeof notifs) => {
    if (key === 'channel') return;
    setNotifs({ ...notifs, [key]: !notifs[key] });
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, notifications: notifs });
    setIsDirty(false);
    showFeedback("Notification preferences saved.");
  };

  const handleCancel = () => {
    setNotifs(settings.notifications);
    setIsDirty(false);
  };

  const ToggleItem = ({ label, desc, field }: { label: string, desc: string, field: keyof typeof notifs }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={() => toggle(field)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifs[field] ? 'bg-brand-600' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={!!notifs[field]}
      >
        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifs[field] ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500">Configure what events you want to be notified about.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
        <div className="flex gap-4">
           {['Email', 'In-app', 'Both'].map(ch => (
             <label key={ch} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
               <input 
                 type="radio" 
                 name="channel" 
                 value={ch} 
                 checked={notifs.channel === ch}
                 onChange={() => { setNotifs({...notifs, channel: ch as any}); setIsDirty(true); }}
                 className="text-brand-600 focus:ring-brand-500"
               />
               {ch}
             </label>
           ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg px-4">
         <ToggleItem label="Payment Failures" desc="Receive an alert when a payment fails." field="paymentFailures" />
         <ToggleItem label="Recovery Successes" desc="Receive an alert when a recovery is successful." field="recoverySuccesses" />
         <ToggleItem label="Recovery Failures" desc="Receive an alert when all recovery attempts fail." field="recoveryFailures" />
         <ToggleItem label="Risk Alerts" desc="Receive an alert when a high-risk case is detected." field="riskAlerts" />
         <ToggleItem label="Integration Alerts" desc="Receive an alert when an integration needs attention." field="integrationAlerts" />
         <ToggleItem label="Weekly Analytics Summary" desc="Receive a weekly email summarizing recovery performance." field="weeklySummary" />
      </div>

      {isDirty && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Unsaved changes
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function RecoveryPreferencesSection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [pref, setPref] = useState(settings.recoveryPreferences);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setPref({ ...pref, [e.target.name]: val });
    setIsDirty(true);
  };

  const toggleAuto = () => {
    setPref({ ...pref, enableAutomaticRecovery: !pref.enableAutomaticRecovery });
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, recoveryPreferences: pref });
    setIsDirty(false);
    showFeedback("Recovery preferences updated.");
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recovery Preferences</h2>
        <p className="text-sm text-gray-500">Configure default preferences for how RecoverIQ approaches recovery opportunities.</p>
      </div>

      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
         <div>
            <p className="text-sm font-semibold text-gray-900">Enable Automatic Recovery</p>
            <p className="text-xs text-gray-500 mt-0.5">Allow RecoverIQ to automatically execute the default strategy.</p>
         </div>
         <button 
           onClick={toggleAuto}
           className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pref.enableAutomaticRecovery ? 'bg-emerald-500' : 'bg-gray-200'}`}
         >
           <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pref.enableAutomaticRecovery ? 'translate-x-5' : 'translate-x-0'}`} />
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Default Recovery Strategy</label>
           <select name="defaultStrategy" value={pref.defaultStrategy} onChange={handleChange} className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
             <option value="Automatic">Automatic</option>
             <option value="Manual Review">Manual Review</option>
             <option value="Retry Payment">Retry Payment</option>
             <option value="Alternate Payment Method">Alternate Payment Method</option>
           </select>
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Default Retry Attempts</label>
           <Input type="number" name="retryAttempts" value={pref.retryAttempts} onChange={handleChange} min={1} max={10} />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Retry Delay (Minutes)</label>
           <Input type="number" name="retryDelayMinutes" value={pref.retryDelayMinutes} onChange={handleChange} min={0} />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Recovery Amount (₹)</label>
           <Input name="minRecoveryAmount" value={pref.minRecoveryAmount} onChange={handleChange} />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Require Manual Review Above (₹)</label>
           <Input name="requireManualReviewAbove" value={pref.requireManualReviewAbove} onChange={handleChange} />
         </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded p-3 flex gap-2">
         <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
         <p className="text-xs text-blue-800">
            These are preference UI elements only. They currently do not modify actual recovery engine execution.
         </p>
      </div>

      {isDirty && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Unsaved changes
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {setPref(settings.recoveryPreferences); setIsDirty(false)}}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function RiskPreferencesSection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [pref, setPref] = useState(settings.riskPreferences);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setPref({ ...pref, [e.target.name]: val });
    setIsDirty(true);
  };

  const toggle = (key: 'enableHighRiskAlerts' | 'enableCriticalAlerts') => {
    setPref({ ...pref, [key]: !pref[key] });
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, riskPreferences: pref });
    setIsDirty(false);
    showFeedback("Risk preferences updated.");
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Risk Preferences</h2>
        <p className="text-sm text-gray-500">Configure how risk opportunities should be surfaced for review.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">High Risk Threshold (0-100)</label>
           <Input type="number" name="highRiskThreshold" value={pref.highRiskThreshold} onChange={handleChange} min={0} max={100} />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Critical Risk Threshold (0-100)</label>
           <Input type="number" name="criticalRiskThreshold" value={pref.criticalRiskThreshold} onChange={handleChange} min={0} max={100} />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount for Risk Review (₹)</label>
           <Input name="minAmountForReview" value={pref.minAmountForReview} onChange={handleChange} />
         </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-6">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-semibold text-gray-900">Enable High-Risk Alerts</p>
               <p className="text-xs text-gray-500">Notify team when cases cross the high risk threshold.</p>
            </div>
            <button 
              onClick={() => toggle('enableHighRiskAlerts')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pref.enableHighRiskAlerts ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pref.enableHighRiskAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
         </div>
         <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-semibold text-gray-900">Enable Critical Alerts</p>
               <p className="text-xs text-gray-500">Immediately notify team and pause auto-recovery for critical risk.</p>
            </div>
            <button 
              onClick={() => toggle('enableCriticalAlerts')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pref.enableCriticalAlerts ? 'bg-red-500' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pref.enableCriticalAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
         </div>
      </div>

      {isDirty && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Unsaved changes
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {setPref(settings.riskPreferences); setIsDirty(false)}}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function TeamSection({ settings, updateSettings, showFeedback }: SectionProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", role: "Operator" as const });
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteData.name && inviteData.email) {
      const newMember: TeamMember = {
        id: `user_new_${Date.now()}`,
        name: inviteData.name,
        email: inviteData.email,
        role: inviteData.role,
        status: 'Invited',
        lastActive: 'Never'
      };
      updateSettings({ ...settings, team: [...settings.team, newMember] });
      setIsInviteOpen(false);
      setInviteData({ name: "", email: "", role: "Operator" });
      showFeedback("Invitation created.");
    }
  };

  const handleDeactivate = (id: string) => {
    const updatedTeam = settings.team.map(m => m.id === id ? { ...m, status: 'Inactive' as const } : m);
    updateSettings({ ...settings, team: updatedTeam });
    setDeactivateConfirmId(null);
    showFeedback("Team member deactivated.");
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team</h2>
            <p className="text-sm text-gray-500">Manage team members and roles.</p>
          </div>
          <Button onClick={() => setIsInviteOpen(true)}><Plus className="h-4 w-4 mr-2"/> Invite Member</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
                <tr>
                   <th className="px-6 py-3 font-semibold">Member</th>
                   <th className="px-6 py-3 font-semibold">Role</th>
                   <th className="px-6 py-3 font-semibold">Status</th>
                   <th className="px-6 py-3 font-semibold">Last Active</th>
                   <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {settings.team.map(m => (
                   <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                         <p className="font-semibold text-gray-900">{m.name}</p>
                         <p className="text-xs text-gray-500">{m.email}</p>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant={m.role === 'Merchant Admin' ? 'success' : 'default'} className={m.role === 'Merchant Admin' ? 'bg-purple-100 text-purple-800' : ''}>
                           {m.role}
                         </Badge>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant={m.status === 'Active' ? 'success' : m.status === 'Invited' ? 'warning' : 'error'}>
                           {m.status}
                         </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{m.lastActive}</td>
                      <td className="px-6 py-4 text-right">
                         {m.status === 'Active' && m.id !== 'user_1' ? (
                           <button onClick={() => setDeactivateConfirmId(m.id)} className="text-red-600 hover:text-red-800 text-xs font-semibold">Deactivate</button>
                         ) : m.status === 'Inactive' ? (
                           <span className="text-gray-400 text-xs">Inactive</span>
                         ) : (
                           <span className="text-gray-400 text-xs">-</span>
                         )}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2>
            </div>
            <form onSubmit={handleInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  value={inviteData.role}
                  onChange={e => setInviteData({...inviteData, role: e.target.value as any})}
                >
                  <option value="Merchant Admin">Merchant Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                <Button type="submit">Send Invitation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivateConfirmId && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Deactivate Member?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to deactivate this team member? They will lose access to RecoverIQ immediately.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeactivateConfirmId(null)}>Cancel</Button>
              <Button onClick={() => handleDeactivate(deactivateConfirmId)} className="bg-red-600 hover:bg-red-700 text-white">Deactivate</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BillingSection({ settings }: SectionProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Billing & Subscription</h2>
            <p className="text-sm text-gray-500">Manage your billing details and view current usage.</p>
          </div>
          <Button variant="outline" onClick={() => setShowModal(true)}>Manage Plan</Button>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-lg p-5 mb-6">
           <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Current Plan</p>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800">{settings.billing.status}</Badge>
           </div>
           <h3 className="text-2xl font-bold text-brand-900 mb-1">{settings.billing.plan}</h3>
           <p className="text-sm text-brand-700">{settings.billing.billingCycle} billing • Next charge on {settings.billing.nextBillingDate}</p>
        </div>

        <div>
           <h3 className="text-sm font-bold text-gray-900 mb-4">Current Cycle Usage</h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                 <p className="text-xs text-gray-500 mb-1">Payments Monitored</p>
                 <p className="text-xl font-bold text-gray-900">{settings.billing.usage.paymentsMonitored.toLocaleString()}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                 <p className="text-xs text-gray-500 mb-1">Recovery Actions</p>
                 <p className="text-xl font-bold text-gray-900">{settings.billing.usage.recoveryActions.toLocaleString()}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                 <p className="text-xs text-gray-500 mb-1">API Requests</p>
                 <p className="text-xl font-bold text-gray-900">{settings.billing.usage.apiRequests.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </Card>

      {/* Info Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <SettingsIcon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Billing Management</h2>
            <p className="text-sm text-gray-500 mb-6">Billing management and Stripe/Razorpay integration will be available in a future release.</p>
            <Button onClick={() => setShowModal(false)} className="w-full">Got it</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DangerZoneSection({ showFeedback }: { showFeedback: (msg: string) => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeactivate = () => {
    setShowConfirm(false);
    showFeedback("Account deactivated locally (mock state).");
  };

  return (
    <Card className="p-6 border-red-200 bg-red-50/30">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="text-sm text-red-600/80">Irreversible and destructive actions.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-red-100 rounded-lg bg-white mb-4">
         <div>
            <p className="font-semibold text-gray-900 text-sm">Sign Out</p>
            <p className="text-xs text-gray-500 mt-0.5">End your current session.</p>
         </div>
         <Button variant="outline" className="mt-3 sm:mt-0" onClick={() => showFeedback("Signed out (mock).")}>Sign Out</Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-red-200 rounded-lg bg-white">
         <div>
            <p className="font-semibold text-red-700 text-sm">Deactivate Account</p>
            <p className="text-xs text-gray-500 mt-0.5">Permanently disable your RecoverIQ account.</p>
         </div>
         <Button variant="outline" className="mt-3 sm:mt-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => setShowConfirm(true)}>
           Deactivate Account
         </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to deactivate this account? This action is mock-only for now.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700 text-white">Deactivate</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
