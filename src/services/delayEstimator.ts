export type DelayEstimateRequest = {
  AIRLINE: string;
  ORIGIN_AIRPORT: string;
  DESTINATION_AIRPORT: string;
  MONTH: number;
  DAY_OF_WEEK: number;
  SCHEDULED_DEPARTURE: number;
  DISTANCE: number;
};

export type DelayEstimateResponse = {
  predicted_delay: number;
  model_version: string;
  using_model: boolean;
};

export async function estimateDelay(
  payload: DelayEstimateRequest,
  apiBase: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
): Promise<DelayEstimateResponse> {
  const url = `${apiBase}/api/v1/predict-booking`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.status}`);
  }
  return response.json() as Promise<DelayEstimateResponse>;
}


