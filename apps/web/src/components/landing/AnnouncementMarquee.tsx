export function AnnouncementMarquee() {
  const announcements = [
    "RecoverIQ is now available in Early Access",
    "Intelligent payment orchestration",
    "Reduce involuntary churn automatically",
    "Advanced risk scoring and recovery",
  ];

  // We duplicate the array to ensure a seamless infinite scroll loop
  const marqueeItems = [...announcements, ...announcements, ...announcements, ...announcements];

  return (
    <div className="w-full bg-landing-graphite border-b border-landing-border/20 text-landing-ivory overflow-hidden relative z-[60]">
      <div className="flex w-max animate-marquee py-2 hover:pause motion-reduce:hidden">
        {marqueeItems.map((text, i) => (
          <div key={i} className="flex items-center mx-4 sm:mx-8 whitespace-nowrap">
            <span className="text-xs font-semibold tracking-wider uppercase text-landing-champagne-light">
              {text}
            </span>
          </div>
        ))}
      </div>
      
      {/* Reduced motion fallback */}
      <div className="hidden motion-reduce:block bg-landing-graphite py-2 text-center text-xs font-semibold tracking-wider uppercase text-landing-champagne-light border-b border-landing-border/20 absolute inset-0 z-10">
        <span className="flex items-center justify-center">
          RecoverIQ is now available in Early Access
        </span>
      </div>
    </div>
  );
}
