export type Airline = {
  code: string;
  name: string;
};

type ApiAirline = {
  iata_code: string;
  airline_name: string;
};

export async function loadAirlines(apiBase: string = 'http://localhost:8000'): Promise<Airline[]> {
  const url = `${apiBase}/api/v1/airlines`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load airlines: ${response.status}`);
  }
  const data: ApiAirline[] = await response.json();
  return data
    .filter((a) => a.iata_code && a.airline_name)
    .map((a) => ({ code: a.iata_code, name: a.airline_name }));
}


