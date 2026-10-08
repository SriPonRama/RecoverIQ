import { CreditCard, ShieldCheck, Zap, BarChart3, Clock, AlertCircle } from "lucide-react";

export function BillingSettings() {
  return (
    <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#171717]">Billing & Subscription</h3>
          <p className="mt-1 text-sm text-[#6B6862]">
            Manage your SaaS subscription, invoices, and billing configuration.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#171717] rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#C7A64A] animate-pulse"></div>
          <span className="text-xs font-medium text-[#FFFCF7]">Developer Preview</span>
        </div>
      </div>

      <div className="px-8 py-10 bg-[#FFFCF7]">
        {/* Status Alert */}
        <div className="mb-10 bg-white border border-[#DED9CF] rounded-xl p-6 shadow-sm flex gap-4 items-start">
          <div className="mt-0.5 h-10 w-10 shrink-0 bg-[#FFFCF7] border border-[#DED9CF] rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[#C7A64A]" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-[#171717]">SaaS Billing Infrastructure Not Configured</h4>
            <p className="mt-1 text-sm text-[#6B6862] leading-relaxed">
              RecoverIQ is currently operating in Developer Preview. Full multi-tenant SaaS billing, invoice management, and automated subscription handling (via external providers like Stripe or Chargebee) are not yet integrated into this environment. 
              Your merchant account is currently enjoying unrestricted access to all premium features under a legacy free tier.
            </p>
          </div>
        </div>

        {/* Current Included Features */}
        <div>
          <h4 className="text-sm font-bold text-[#171717] uppercase tracking-wider mb-6">Currently Included in Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white border border-[#DED9CF] rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-[#C7A64A]/50 hover:shadow-md">
              <div className="p-2 bg-[#FFFCF7] border border-[#DED9CF] rounded-lg shrink-0">
                <Zap className="w-5 h-5 text-[#C7A64A]" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#171717]">Real AI Decision Engine</h5>
                <p className="text-xs text-[#6B6862] mt-1">Unlimited risk evaluations using the integrated OpenAI Responses API with fallback execution.</p>
              </div>
            </div>

            <div className="bg-white border border-[#DED9CF] rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-[#C7A64A]/50 hover:shadow-md">
              <div className="p-2 bg-[#FFFCF7] border border-[#DED9CF] rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-[#171717]" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#171717]">Automated Recovery Worker</h5>
                <p className="text-xs text-[#6B6862] mt-1">Background BullMQ/Redis worker processing recoveries synchronously with merchant retry configurations.</p>
              </div>
            </div>

            <div className="bg-white border border-[#DED9CF] rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-[#C7A64A]/50 hover:shadow-md">
              <div className="p-2 bg-[#FFFCF7] border border-[#DED9CF] rounded-lg shrink-0">
                <BarChart3 className="w-5 h-5 text-[#C7A64A]" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#171717]">Analytics & Trends</h5>
                <p className="text-xs text-[#6B6862] mt-1">Full access to multi-dimensional analytics, time-series plotting, and real-time dashboard metrics.</p>
              </div>
            </div>

            <div className="bg-white border border-[#DED9CF] rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all hover:border-[#C7A64A]/50 hover:shadow-md">
              <div className="p-2 bg-[#FFFCF7] border border-[#DED9CF] rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#171717]" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#171717]">Merchant & Webhook Isolation</h5>
                <p className="text-xs text-[#6B6862] mt-1">Multi-tenant architecture securely isolates risk cases, payments, and integrations per merchant.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="px-8 py-5 border-t border-[#DED9CF] bg-white flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-[#6B6862]">
          <CreditCard className="w-4 h-4" />
          <span>Payment method configuration disabled</span>
        </div>
        <button
          disabled
          className="inline-flex justify-center items-center rounded-xl border border-[#DED9CF] bg-[#F9F8F6] py-2 px-4 text-sm font-semibold text-[#A3A09A] cursor-not-allowed"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
