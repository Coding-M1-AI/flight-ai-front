/**
 * Service for explaining predictions using SHAP
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface ExplainRequest {
  AIRLINE: string
  ORIGIN_AIRPORT: string
  DESTINATION_AIRPORT: string
  MONTH: number
  DAY_OF_WEEK: number
  SCHEDULED_DEPARTURE: number
  DISTANCE: number
}

export interface ExplainResponse {
  image_base64: string
  model_version: string
}

/**
 * Get SHAP explanation for a prediction
 */
export async function explainPrediction(request: ExplainRequest): Promise<ExplainResponse> {
  const response = await fetch(`${API_BASE}/api/v1/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
