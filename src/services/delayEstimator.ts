export type DelayEstimateRequest = {
  day: number;
  month: number;
  departureAirport: string;
  arrivalAirport: string;
  airlineCode?: string; // Optional airline filter (e.g., UA, AA)
};

export type DelayEstimateResponse = {
  minutes: number;
  confidence: number; // 0..1
};

// Mock service to simulate an AI estimate. Replace with real API call.
export async function estimateDelay(
  payload: DelayEstimateRequest,
): Promise<DelayEstimateResponse> {
  await new Promise((r) => setTimeout(r, 700));

  // Very naive heuristic just to make the UI feel realistic
  const base = (payload.month >= 6 && payload.month <= 8) ? 25 : 12; // summer busier
  const airportFactor =
    (payload.departureAirport.startsWith('L') || payload.arrivalAirport.startsWith('L'))
      ? 1.3
      : 1.0;
  const randomness = Math.random() * 15;
  // Airline factor: some LCCs more variable
  const airlineFactor = (() => {
    switch (payload.airlineCode) {
      case 'NK': // Spirit
      case 'F9': // Frontier
        return 1.25;
      case 'WN': // Southwest
      case 'B6': // JetBlue
        return 1.15;
      case 'UA':
      case 'AA':
      case 'DL':
        return 1.05;
      case 'HA':
        return 0.95;
      default:
        return 1.0;
    }
  })();
  const minutes = Math.round(base * airportFactor * airlineFactor + randomness);
  const confidence = Math.max(0.5, Math.min(0.95, 0.9 - Math.abs(45 - minutes) / 100));

  return { minutes, confidence };
}


