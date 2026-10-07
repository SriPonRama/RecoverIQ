/**
 * A generic abstraction for a simulated recovery payment provider.
 */

export interface RecoveryProviderResult {
  success: boolean;
  externalReference?: string;
  errorCode?: string;
  errorMessage?: string;
  simulated: boolean;
}

export async function executeSimulatedRecovery(amount: number, method: string): Promise<RecoveryProviderResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const reference = `sim_rec_${Math.random().toString(36).substring(2, 9)}`;

  // Let's create a deterministic mock result for tests. 
  // We can base it on amount to force fails for specific testing if we want,
  // but a generic success is fine for this simulated phase.
  if (amount === 999999) { // Special test case for failure
    return {
      success: false,
      errorCode: "SIMULATED_DECLINE",
      errorMessage: "The simulated provider declined the transaction",
      simulated: true
    };
  }

  return {
    success: true,
    externalReference: reference,
    simulated: true
  };
}
