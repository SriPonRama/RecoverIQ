import { CreditCard } from "lucide-react";

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#DED9CF] p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-[#FFFCF7] border border-[#DED9CF] rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-[#6B6862]" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#171717] mb-2">Billing & Subscription</h2>
        <p className="text-[#6B6862] max-w-md mx-auto">
          Billing integration with external payment gateways is not yet available. Your account is currently operating under a legacy free tier.
        </p>
      </div>
    </div>
  );
}
