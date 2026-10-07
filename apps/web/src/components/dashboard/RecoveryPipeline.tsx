import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Search, BrainCircuit, BarChart4, Calendar, ShieldCheck, ChevronRight, XCircle } from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}

interface FunnelData {
  stage: string;
  count: number;
  amount: string;
}

interface RecoveryPipelineProps {
  data: FunnelData[];
}

export function RecoveryPipeline({ data }: RecoveryPipelineProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
        <CardHeader className="border-b border-landing-border/60 pb-4">
          <CardTitle className="text-lg font-bold text-landing-graphite">Recovery Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-24 text-landing-text-sec font-semibold text-sm italic border border-dashed border-landing-border/50 rounded-xl bg-landing-ivory/30">
            Not available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map backend stages to icons/colors
  const stageMap: Record<string, { id: string; icon: React.ElementType; colorClass: string }> = {
    "Failed Payment": { id: 'failed', icon: XCircle, colorClass: 'text-landing-failure bg-landing-failure/10 border-landing-failure/30' },
    "Risk Detected": { id: 'detected', icon: Search, colorClass: 'text-landing-text-sec bg-landing-surface border-landing-border/80' },
    "Recovery Eligible": { id: 'eligible', icon: BrainCircuit, colorClass: 'text-landing-graphite bg-landing-ivory border-landing-border/80' },
    "Action Planned": { id: 'planned', icon: Calendar, colorClass: 'text-landing-champagne bg-landing-champagne/10 border-landing-champagne/30' },
    "Recovered": { id: 'recovered', icon: ShieldCheck, colorClass: 'text-landing-success bg-landing-success/10 border-landing-success/30' },
  };

  const defaultMapping = { id: 'unknown', icon: BarChart4, colorClass: 'text-landing-text-sec bg-landing-ivory border-landing-border/50' };

  const stages: PipelineStage[] = data.map(item => {
    const map = stageMap[item.stage] || defaultMapping;
    return {
      id: map.id,
      name: item.stage,
      count: item.count,
      icon: map.icon,
      colorClass: map.colorClass
    };
  });

  return (
    <Card className="border border-landing-border/40 shadow-sm bg-landing-surface">
      <CardHeader className="border-b border-landing-border/60 pb-4">
        <CardTitle className="text-lg font-bold text-landing-graphite">Recovery Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 md:gap-0 overflow-x-auto pb-4">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-[120px]">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${stage.colorClass}`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-landing-graphite">{stage.count}</div>
                <div className="text-xs font-semibold text-landing-text-sec uppercase tracking-wider mt-1 whitespace-nowrap">{stage.name}</div>
              </div>
              
              {index < stages.length - 1 && (
                <div className="hidden md:flex items-center text-landing-border px-2">
                  <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
