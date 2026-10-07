import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Rocket, CheckCircle2, AlertTriangle, RefreshCw, Play } from "lucide-react";
import { Button } from "../ui/Button";

type DemoState = "IDLE" | "PROCESSING" | "SUCCESS" | "FAILED" | "RECOVERY";

export function RocketDemo() {
  const [state, setState] = useState<DemoState>("IDLE");
  const [isSuccessDemo, setIsSuccessDemo] = useState(true);

  const handleStartDemo = (success: boolean) => {
    setIsSuccessDemo(success);
    setState("PROCESSING");
    
    // Simulate processing time
    setTimeout(() => {
      setState(success ? "SUCCESS" : "FAILED");
    }, 2500);
  };

  const handleReset = () => setState("IDLE");

  // Get current date/time for the demo
  const now = new Date();
  const demoDate = now.toLocaleDateString();
  const demoTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full max-w-md mx-auto bg-landing-graphite rounded-2xl border border-landing-border/20 overflow-hidden shadow-2xl p-6 text-landing-ivory">
      {/* Explicit Label */}
      <div className="absolute top-4 right-4 bg-landing-deep/80 backdrop-blur-md px-3 py-1.5 rounded-md text-[10px] font-bold text-landing-text-sec uppercase tracking-widest border border-landing-border/10 z-30">
        INTERACTIVE DEMONSTRATION
      </div>

      <div className="text-center mb-8 pt-6 relative z-20">
        <h3 className="text-xl font-bold text-landing-ivory mb-2">Checkout Simulation</h3>
        <p className="text-sm text-landing-text-sec">
          Observe the payment routing flow.
        </p>
      </div>

      {/* Main Interaction Area */}
      <div className="relative h-72 bg-landing-deep rounded-xl border border-landing-border/10 overflow-hidden flex flex-col items-center justify-center mb-6">
        
        <AnimatePresence mode="wait">
          {state === "IDLE" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-16 h-16 rounded-full bg-landing-champagne/10 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-landing-champagne" />
              </div>
              <p className="text-lg font-semibold mb-1 text-landing-ivory">Concept Payment</p>
              <p className="text-xs text-landing-text-sec font-medium">Demonstration purposes only</p>
            </motion.div>
          )}

          {state === "PROCESSING" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center z-20"
            >
              <p className="text-sm font-bold text-landing-champagne mb-8 animate-pulse tracking-widest uppercase">
                Processing payment...
              </p>
            </motion.div>
          )}

          {state === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center px-4 z-20 w-full"
            >
              <div className="w-12 h-12 rounded-full bg-landing-success/20 flex items-center justify-center mb-3 border border-landing-success/30">
                <CheckCircle2 className="w-6 h-6 text-landing-success" />
              </div>
              <p className="text-base font-black text-landing-ivory mb-1 tracking-wide uppercase">Payment recovered</p>
              <p className="text-xs text-landing-success font-bold mb-4 uppercase tracking-wider">Revenue recovered successfully</p>
              
              <div className="w-full bg-landing-graphite/80 rounded-lg p-3 text-left border border-landing-border/10 text-[11px] space-y-1.5 font-mono">
                <div className="text-landing-champagne font-bold text-[10px] uppercase tracking-widest mb-2 border-b border-landing-border/10 pb-1">DEMO TRANSACTION</div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Amount:</span> <span className="text-landing-ivory">₹8,500</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Status:</span> <span className="text-landing-success">Recovered</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Transaction:</span> <span className="text-landing-ivory">DEMO-XXXX</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Date/Time:</span> <span className="text-landing-ivory">{demoDate} {demoTime}</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Account:</span> <span className="text-landing-ivory">1234 XXXX XXXX</span></div>
              </div>
            </motion.div>
          )}

          {state === "FAILED" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center px-4 z-20 w-full"
            >
              <div className="w-12 h-12 rounded-full bg-landing-failure/20 flex items-center justify-center mb-3 border border-landing-failure/30">
                <AlertTriangle className="w-6 h-6 text-landing-failure" />
              </div>
              <p className="text-base font-black text-landing-ivory mb-1 tracking-wide uppercase">Payment failed</p>
              <p className="text-xs text-landing-failure font-bold mb-4 uppercase tracking-wider">Recovery action required</p>
              
              <div className="w-full bg-landing-graphite/80 rounded-lg p-3 text-left border border-landing-border/10 text-[11px] space-y-1.5 font-mono">
                <div className="text-landing-text-sec font-bold text-[10px] uppercase tracking-widest mb-2 border-b border-landing-border/10 pb-1">DEMO TRANSACTION</div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Amount:</span> <span className="text-landing-ivory">₹8,500</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Status:</span> <span className="text-landing-failure">Failed</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Transaction:</span> <span className="text-landing-ivory">DEMO-XXXX</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Date/Time:</span> <span className="text-landing-ivory">{demoDate} {demoTime}</span></div>
                <div className="flex justify-between"><span className="text-landing-text-sec">Account:</span> <span className="text-landing-ivory">1234 XXXX XXXX</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Rocket Animation */}
        <AnimatePresence>
          {state === "PROCESSING" && (
            <motion.div
              key="rocket"
              className="absolute z-10"
              initial={{ y: 200, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={
                isSuccessDemo 
                  ? { y: -200, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } } // Success: Exit UP
                  : { y: 200, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }  // Failure: Reverses direction and exits DOWN
              }
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <div className="relative">
                <motion.div 
                  animate={!isSuccessDemo && state === "PROCESSING" ? {} : { rotate: isSuccessDemo ? 0 : 180 }}
                  transition={{ duration: 0.4 }}
                >
                  <Rocket className="w-12 h-12 text-landing-champagne drop-shadow-[0_0_15px_rgba(199,166,74,0.5)]" />
                </motion.div>
                {/* Exhaust / Trail Effect */}
                <motion.div 
                  className={`absolute left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-landing-champagne/80 to-transparent blur-md rounded-full ${!isSuccessDemo && state !== "PROCESSING" ? '-top-10 rotate-180' : '-bottom-10'}`}
                  animate={{ opacity: [0.4, 0.8, 0.4], scaleY: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>

      {/* Demo Controls */}
      <div className="space-y-3 relative z-20">
        {state === "IDLE" ? (
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => handleStartDemo(true)}
              className="w-full bg-landing-champagne hover:bg-landing-champagne-light text-landing-deep font-bold border-0 h-12 shadow-lg hover:scale-[1.02] transition-transform"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" /> Simulate Payment
            </Button>
            <Button 
              onClick={() => handleStartDemo(false)}
              variant="outline"
              className="w-full border-landing-border/30 text-landing-text-sec hover:bg-landing-deep hover:border-landing-border text-xs"
            >
              Simulate Failure Scenario
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleReset}
            variant="ghost"
            className="w-full text-landing-text-sec hover:text-landing-surface hover:bg-landing-deep"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Demo
          </Button>
        )}
      </div>
    </div>
  );
}
