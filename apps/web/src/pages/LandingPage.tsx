import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AnnouncementMarquee } from "../components/landing/AnnouncementMarquee";

import heroImage from "../assets/images/landing/01-payment-phone.png";
import recoveryImage from "../assets/images/landing/02-revenue-growth.png";
import aiRiskImage from "../assets/images/landing/03-risk-network.png";
import analyticsImage from "../assets/images/landing/04-analytics-tablet.png";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yParallaxSubtle = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <div className="min-h-screen font-sans text-landing-deep bg-landing-ivory selection:bg-landing-champagne selection:text-landing-deep">
      
      {/* Animated Announcement Marquee */}
      <AnnouncementMarquee />

      {/* Navbar - Premium Minimalist */}
      <header className="sticky top-0 z-50 w-full bg-landing-ivory/90 backdrop-blur-xl border-b border-landing-border/50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-landing-graphite shadow-sm">
              <ShieldCheck className="h-5 w-5 text-landing-champagne" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-landing-deep">RecoverIQ</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            <a href="#problem" className="text-sm font-semibold tracking-wide text-landing-text-sec hover:text-landing-deep transition-colors">The Problem</a>
            <a href="#intelligence" className="text-sm font-semibold tracking-wide text-landing-text-sec hover:text-landing-deep transition-colors">Intelligence</a>
            <a href="#recovery" className="text-sm font-semibold tracking-wide text-landing-text-sec hover:text-landing-deep transition-colors">Recovery</a>
            <a href="#analytics" className="text-sm font-semibold tracking-wide text-landing-text-sec hover:text-landing-deep transition-colors">Analytics</a>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold tracking-wide text-landing-deep hover:text-landing-champagne transition-colors">
              Sign In
            </Link>
            <Link to="/login">
              <Button size="lg" className="bg-landing-champagne text-landing-deep hover:bg-landing-champagne-light border-0 shadow-lg font-bold tracking-wide rounded-full px-8">
                Get Started
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-landing-deep"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute w-full bg-landing-ivory border-b border-landing-border px-6 py-6 shadow-2xl flex flex-col gap-6 z-50"
          >
            <a href="#problem" className="text-lg font-bold text-landing-deep" onClick={() => setMobileMenuOpen(false)}>The Problem</a>
            <a href="#intelligence" className="text-lg font-bold text-landing-deep" onClick={() => setMobileMenuOpen(false)}>Intelligence</a>
            <a href="#recovery" className="text-lg font-bold text-landing-deep" onClick={() => setMobileMenuOpen(false)}>Recovery</a>
            <a href="#analytics" className="text-lg font-bold text-landing-deep" onClick={() => setMobileMenuOpen(false)}>Analytics</a>
            <hr className="border-landing-border" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-landing-deep text-left">Sign In</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-landing-champagne text-landing-deep hover:bg-landing-champagne-light rounded-full py-6 text-lg font-bold">
                Get Started
              </Button>
            </Link>
          </motion.div>
        )}
      </header>

      <main>
        {/* HERO SECTION - Premium Fintech Asymmetric */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-landing-ivory">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  <motion.p variants={wordAnimation} className="text-[10px] md:text-xs font-bold tracking-widest text-landing-text-sec uppercase mb-6">
                    AI-POWERED REVENUE RECOVERY
                  </motion.p>
                  
                  <motion.h1 
                    className="text-6xl lg:text-[5rem] font-black tracking-tighter text-landing-deep leading-[1.05] mb-8"
                    variants={staggerContainer}
                  >
                    <motion.span className="block" variants={wordAnimation}>Recover</motion.span>
                    <motion.span className="block" variants={wordAnimation}>lost</motion.span>
                    <motion.span className="block" variants={wordAnimation}>revenue.</motion.span>
                    <motion.span className="block text-landing-champagne italic" variants={wordAnimation}>Automatically.</motion.span>
                  </motion.h1>
                  
                  <motion.p variants={fadeInUp} className="text-lg text-landing-text-sec leading-relaxed max-w-md mb-10 font-medium">
                    RecoverIQ detects failed payments, evaluates recovery opportunities, and intelligently recovers revenue before it becomes lost.
                  </motion.p>
                  
                  <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-14 rounded-full px-10 text-base bg-landing-graphite text-landing-surface hover:bg-landing-deep shadow-xl transition-transform hover:scale-105 active:scale-95">
                        Start Recovering <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <a href="#problem" className="w-full sm:w-auto text-center sm:text-left text-sm font-bold text-landing-deep hover:text-landing-champagne transition-colors py-4 px-6">
                      See How It Works
                    </a>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Right Content - Oversized Image with Framing */}
              <div className="lg:col-span-7 relative flex items-center justify-end mt-16 lg:mt-0">
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-2 lg:p-6 motion-reduce:hidden">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -top-4 right-4 lg:-top-8 lg:right-12 bg-landing-ivory/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-landing-border/50"
                  >
                    <p className="text-[9px] font-bold text-landing-text-sec uppercase tracking-widest mb-1">MARKETING VISUAL</p>
                    <p className="text-xl font-black text-landing-deep">Intelligent Routing</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="absolute -bottom-4 -left-4 lg:-bottom-8 lg:left-8 bg-landing-deep/95 backdrop-blur-md px-6 py-5 rounded-3xl shadow-xl border border-landing-border/20"
                  >
                    <p className="text-[10px] font-bold text-landing-champagne uppercase tracking-widest mb-1">RECOVERY DECISION</p>
                    <p className="text-2xl font-black text-landing-ivory">Retry Strategy</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-[650px] rounded-[2rem] lg:rounded-[4rem] overflow-hidden shadow-2xl border border-landing-border/30 bg-landing-surface"
                >
                  <img 
                    src={heroImage} 
                    alt="Smartphone Payment Card Visual" 
                    className="w-full h-auto object-cover"
                  />
                  {/* Warm overlay */}
                  <div className="absolute inset-0 bg-landing-champagne/5 pointer-events-none mix-blend-overlay"></div>
                </motion.div>
                
                {/* Decorative blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-landing-champagne/20 blur-[120px] rounded-full -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION - THE PROBLEM */}
        <section id="problem" className="py-32 bg-landing-surface overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tighter text-landing-deep leading-tight mb-8">
                Failed payments shouldn't become <br className="hidden md:block" />
                <span className="italic text-landing-champagne">lost customers.</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-landing-text-sec font-medium leading-relaxed max-w-2xl mx-auto">
                Failed payments create avoidable revenue leakage. RecoverIQ identifies the failure, evaluates recovery potential, and chooses the appropriate recovery action.
              </motion.p>
            </motion.div>

            {/* Visual Storytelling Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: "01", title: "FAILED PAYMENT", color: "border-landing-failure", bg: "bg-landing-ivory", fill: "bg-landing-failure" },
                { step: "02", title: "RISK", color: "border-landing-champagne", bg: "bg-landing-ivory", fill: "bg-landing-champagne" },
                { step: "03", title: "DECISION", color: "border-landing-graphite", bg: "bg-landing-ivory", fill: "bg-landing-graphite" },
                { step: "04", title: "RECOVERY", color: "border-landing-success", bg: "bg-landing-surface shadow-md", fill: "bg-landing-success" }
              ].map((stage, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`group relative overflow-hidden flex flex-col items-center justify-center p-8 rounded-3xl border-t-4 ${stage.color} ${stage.bg} transition-shadow duration-300 hover:shadow-xl`}
                >
                  <div className={`absolute top-0 left-0 w-full h-0 transition-all duration-300 ease-out group-hover:h-full ${stage.fill}`}></div>
                  <span className="relative z-10 text-[10px] font-bold text-landing-text-sec group-hover:text-white transition-colors duration-300 mb-2">{stage.step}</span>
                  <span className="relative z-10 text-sm font-black tracking-widest text-landing-deep group-hover:text-white transition-colors duration-300 uppercase">{stage.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION - REVENUE RECOVERY */}
        <section id="recovery" className="py-32 bg-landing-ivory">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <div className="order-2 lg:order-1">
                <motion.div
                  style={{ y: yParallaxSubtle }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border border-landing-border/50"
                >
                  <img src={recoveryImage} alt="Financial Growth and Revenue Recovery" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-landing-champagne/10 pointer-events-none mix-blend-overlay"></div>
                </motion.div>
              </div>

              <div className="order-1 lg:order-2">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  <motion.h2 variants={fadeInUp} className="text-5xl lg:text-7xl font-black tracking-tighter text-landing-deep leading-[1.05] mb-8">
                    Turn payment failures<br />
                    <span className="italic text-landing-champagne">into recovered revenue.</span>
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-xl text-landing-text-sec font-medium leading-relaxed mb-10">
                    Reclaim involuntary churn by intelligently identifying which payments are simply false declines versus genuine risks. Boost your bottom line without lifting a finger.
                  </motion.p>
                  <motion.div variants={fadeInUp}>
                    <Button onClick={() => navigate('/recovery')} size="lg" className="h-14 rounded-full px-8 text-base bg-landing-graphite text-landing-surface hover:bg-landing-deep hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl">
                      Explore Recovery
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION - INTELLIGENCE (Dark Cinematic Section) */}
        <section id="intelligence" className="py-32 bg-[#111111] text-[#F4F1EA]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-24">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8"
              >
                Every failed payment<br />
                has a <span className="italic text-[#C7A64A]">recovery opportunity.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-[#6B6862] font-medium leading-relaxed max-w-2xl mx-auto"
              >
                RecoverIQ evaluates payment and customer signals to identify which failed transactions are worth recovering and which recovery action has the highest potential.
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <div>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <motion.h3 variants={fadeInUp} className="text-4xl font-black tracking-tighter mb-10">
                    Decisions made by <span className="italic text-[#C7A64A]">data.</span>
                  </motion.h3>
                  
                  <div className="flex flex-col gap-8">
                    <motion.div variants={fadeInUp} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C7A64A] mt-2 shrink-0"></div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">Payment Signals</h4>
                        <p className="text-sm text-[#6B6862]">Analyze decline codes and banking responses instantly.</p>
                      </div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C7A64A] mt-2 shrink-0"></div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">Risk Signals</h4>
                        <p className="text-sm text-[#6B6862]">Evaluate behavioral patterns and transaction velocity.</p>
                      </div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C7A64A] mt-2 shrink-0"></div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">Customer Context</h4>
                        <p className="text-sm text-[#6B6862]">Incorporate account history and lifetime value.</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="relative rounded-[2rem] lg:rounded-tl-[6rem] lg:rounded-br-[6rem] overflow-hidden shadow-2xl border border-white/10 bg-[#171717]"
                >
                  <img src={aiRiskImage} alt="Network and Financial Intelligence" className="w-full h-auto object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                  <div className="absolute inset-0 bg-[#C7A64A]/10 pointer-events-none"></div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION - RECOVERY FLOW (Journey) */}
        <section className="py-24 bg-landing-surface border-y border-landing-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-landing-border z-0 -translate-y-1/2 overflow-hidden">
                <motion.div 
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center z-10 w-32"
                >
                  {/* Trail */}
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-landing-champagne"></div>
                  {/* Arrowhead */}
                  <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-landing-champagne"></div>
                </motion.div>
              </div>
              
              {[
                { step: "01", label: "Payment Failed" },
                { step: "02", label: "Risk Detected" },
                { step: "03", label: "AI Decision" },
                { step: "04", label: "Recovery Action" },
                { step: "05", label: "Revenue Recovered", active: true }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex lg:flex-col items-center gap-6 lg:gap-4 bg-landing-surface lg:bg-transparent pr-4 lg:pr-0"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm z-10 ${item.active ? 'bg-landing-champagne text-landing-deep border-none' : 'bg-landing-ivory text-landing-text-sec border border-landing-border'}`}>
                    {item.step}
                  </div>
                  <span className={`text-sm lg:text-center font-bold uppercase tracking-widest ${item.active ? 'text-landing-deep' : 'text-landing-text-sec'}`}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION - ANALYTICS */}
        <section id="analytics" className="py-32 bg-landing-ivory">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <div className="order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-landing-border bg-landing-surface p-2"
                >
                  <img src={analyticsImage} alt="Tablet with Analytics Charts" className="w-full h-auto object-cover rounded-xl" />
                </motion.div>
              </div>

              <div className="order-1 lg:order-2">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  <motion.h2 variants={fadeInUp} className="text-5xl lg:text-6xl font-black tracking-tighter text-landing-deep mb-8 leading-tight">
                    See where your<br />
                    revenue is <span className="text-landing-champagne italic">leaking.</span>
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-xl text-landing-text-sec font-medium mb-10 leading-relaxed">
                    Understand payment failures, recovery performance, risk distribution, and recovery outcomes in one elegant dashboard. Total visibility into your payment health.
                  </motion.p>
                  <motion.div variants={fadeInUp}>
                    <Button onClick={() => navigate('/analytics')} size="lg" className="h-14 rounded-full px-8 text-base bg-landing-champagne text-landing-deep hover:bg-landing-champagne-light hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                      View Analytics Engine
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>



        {/* FINAL CTA */}
        <section className="py-32 bg-landing-champagne overflow-hidden relative">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-landing-deep tracking-tighter mb-6 leading-[1.1]">
              Stop leaving revenue<br />
              behind.
            </h2>
            <p className="text-xl text-landing-deep/80 font-semibold mb-12 max-w-2xl mx-auto">
              Recover more from every payment failure with intelligent revenue recovery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-16 rounded-full px-12 text-lg bg-landing-deep text-landing-ivory hover:bg-landing-graphite shadow-2xl font-bold hover:scale-105 transition-transform">
                  Start Recovering Revenue
                </Button>
              </Link>
              <a href="#problem" className="w-full sm:w-auto text-center sm:text-left text-base font-bold text-landing-deep hover:text-white transition-colors py-4 px-6">
                See How It Works
              </a>
            </div>
          </div>
          
          {/* Subtle decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
             <div className="absolute -top-[50%] -right-[10%] w-[80%] h-[150%] rounded-full bg-white blur-[100px]"></div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-landing-surface pt-20 pb-10 border-t border-landing-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-landing-graphite">
                  <ShieldCheck className="h-4 w-4 text-landing-champagne" />
                </div>
                <span className="text-xl font-black tracking-tighter text-landing-deep">RecoverIQ</span>
              </div>
              <p className="text-sm text-landing-text-sec font-medium leading-relaxed">
                Intelligent payment recovery for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-landing-deep mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-landing-text-sec">
                <li><a href="#problem" className="hover:text-landing-champagne transition-colors">The Problem</a></li>
                <li><a href="#intelligence" className="hover:text-landing-champagne transition-colors">Intelligence</a></li>
                <li><a href="#recovery" className="hover:text-landing-champagne transition-colors">Recovery</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-landing-deep mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-landing-text-sec">
                <li><a href="#" className="hover:text-landing-champagne transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-landing-champagne transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-landing-champagne transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-landing-deep mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-landing-text-sec">
                <li><a href="#" className="hover:text-landing-champagne transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-landing-champagne transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-landing-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-landing-text-sec">© 2026 RecoverIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
