import { useState } from "react"
import { Settings as SettingsIcon, AlertCircle } from "lucide-react"
import { AccountSettings } from "../components/settings/AccountSettings"
import { GeneralSettings } from "../components/settings/GeneralSettings"
import { SecuritySettings } from "../components/settings/SecuritySettings"
import { TeamSettings } from "../components/settings/TeamSettings"
import { NotificationsSettings } from "../components/settings/NotificationsSettings"
import { RecoverySettings } from "../components/settings/RecoverySettings"
import { RiskSettings } from "../components/settings/RiskSettings"
import { DangerZoneSettings } from "../components/settings/DangerZoneSettings"
import { BillingSettings } from "../components/settings/BillingSettings"

type SettingsTab = 'General' | 'Account' | 'Security' | 'Notifications' | 'Recovery' | 'Risk' | 'Team' | 'Billing' | 'Danger Zone';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');

  const tabs: { id: SettingsTab; label: string; description: string; status?: "AVAILABLE" | "COMING SOON" | "RESTRICTED" }[] = [
    { id: 'General', label: 'GENERAL', description: 'Workspace preferences', status: 'AVAILABLE' },
    { id: 'Account', label: 'ACCOUNT', description: 'Personal profile', status: 'AVAILABLE' },
    { id: 'Security', label: 'SECURITY', description: 'Password & sessions', status: 'AVAILABLE' },
    { id: 'Team', label: 'TEAM', description: 'Manage access', status: 'AVAILABLE' },
    { id: 'Notifications', label: 'NOTIFICATIONS', description: 'Alert preferences', status: 'AVAILABLE' },
    { id: 'Recovery', label: 'RECOVERY', description: 'Engine preferences', status: 'AVAILABLE' },
    { id: 'Risk', label: 'RISK', description: 'AI configuration', status: 'AVAILABLE' },
    { id: 'Billing', label: 'BILLING', description: 'Subscription', status: 'COMING SOON' },
    { id: 'Danger Zone', label: 'DANGER ZONE', description: 'Destructive actions', status: 'RESTRICTED' },
  ];

  const getUnavailableMessage = (tab: SettingsTab) => {
    switch (tab) {
      case 'Notifications':
        return "Notification preferences are not configurable yet. Coming soon.";
      case 'Recovery':
        return "Recovery preferences are not available yet. Coming soon.";
      case 'Risk':
        return "Risk preferences are not configurable yet. Coming soon.";
      case 'Billing':
        return "Billing settings are not available yet. Coming soon.";
      case 'Danger Zone':
        return "Account deactivation and deletion are restricted.";
      default:
        return "Settings management will become available once the required backend capabilities are implemented.";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return <AccountSettings />;
      case 'General':
        return <GeneralSettings />;
      case 'Security':
        return <SecuritySettings />;
      case 'Team':
        return <TeamSettings />;
      case 'Notifications':
        return <NotificationsSettings />;
      case 'Recovery':
        return <RecoverySettings />;
      case 'Risk':
        return <RiskSettings />;
      case 'Billing':
        return <BillingSettings />;
      case 'Danger Zone':
        return <DangerZoneSettings />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center border border-[#DED9CF] rounded-2xl bg-[#FFFCF7] shadow-sm">
            <div className="h-16 w-16 bg-white border border-[#DED9CF] rounded-full flex items-center justify-center mb-6 shadow-sm">
              {activeTab === 'Danger Zone' ? (
                 <AlertCircle className="h-8 w-8 text-[#8A3F3F]" />
              ) : (
                <SettingsIcon className="h-8 w-8 text-[#6B6862]" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-[#111111] mb-2">{(activeTab as string).toUpperCase()}</h2>
            <p className="text-[#6B6862] max-w-md mx-auto">
              {getUnavailableMessage(activeTab as SettingsTab)}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 mt-8">
      
      {/* PAGE HEADER */}
      <div className="border-b border-[#DED9CF] pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717] font-sans">Settings</h1>
        <p className="text-base text-[#6B6862] mt-2 max-w-xl">
          Control your workspace, account, security and recovery configuration.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-72 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const isRestricted = tab.id === 'Danger Zone';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal text-left ${
                    isActive
                      ? isRestricted ? 'bg-[#8A3F3F]/10 border border-[#8A3F3F]/20' : 'bg-white border border-[#DED9CF] shadow-sm'
                      : 'border border-transparent hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm font-semibold tracking-wide ${isActive ? (isRestricted ? 'text-[#8A3F3F]' : 'text-[#171717]') : (isRestricted ? 'text-[#8A3F3F]/70' : 'text-[#171717]/70')}`}>
                      {tab.label}
                    </span>
                    {tab.status === 'COMING SOON' && !isActive && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6862]/60 bg-black/5 px-2 py-0.5 rounded-full ml-2">
                        Soon
                      </span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${isActive ? (isRestricted ? 'text-[#8A3F3F]/80' : 'text-[#6B6862]') : 'text-[#6B6862]/70'}`}>
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
