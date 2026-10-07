import { useState, useEffect } from 'react';

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'razorpay-checkout-js';
    if (document.getElementById(scriptId)) {
      // Script is already injecting
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script');
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to prevent reloading overhead across navigation
    };
  }, []);

  return isLoaded;
}

// Add types for window
declare global {
  interface Window {
    Razorpay: any;
  }
}
