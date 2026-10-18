export interface CityMeta {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const INDIA_CITIES: Record<string, CityMeta> = {
  mumbai:       { name: 'Mumbai',       state: 'Maharashtra',    lat: 19.08, lng: 72.88 },
  delhi:        { name: 'Delhi',        state: 'Delhi',          lat: 28.61, lng: 77.21 },
  bangalore:    { name: 'Bangalore',    state: 'Karnataka',      lat: 12.97, lng: 77.59 },
  hyderabad:    { name: 'Hyderabad',    state: 'Telangana',      lat: 17.39, lng: 78.49 },
  ahmedabad:    { name: 'Ahmedabad',    state: 'Gujarat',        lat: 23.02, lng: 72.57 },
  chennai:      { name: 'Chennai',      state: 'Tamil Nadu',     lat: 13.08, lng: 80.27 },
  kolkata:      { name: 'Kolkata',      state: 'West Bengal',    lat: 22.57, lng: 88.36 },
  pune:         { name: 'Pune',         state: 'Maharashtra',    lat: 18.52, lng: 73.86 },
  jaipur:       { name: 'Jaipur',       state: 'Rajasthan',      lat: 26.91, lng: 75.79 },
  surat:        { name: 'Surat',        state: 'Gujarat',        lat: 21.17, lng: 72.83 },
  lucknow:      { name: 'Lucknow',      state: 'Uttar Pradesh',  lat: 26.85, lng: 80.95 },
  kanpur:       { name: 'Kanpur',       state: 'Uttar Pradesh',  lat: 26.45, lng: 80.35 },
  nagpur:       { name: 'Nagpur',       state: 'Maharashtra',    lat: 21.15, lng: 79.09 },
  indore:       { name: 'Indore',       state: 'Madhya Pradesh', lat: 22.72, lng: 75.86 },
  bhopal:       { name: 'Bhopal',       state: 'Madhya Pradesh', lat: 23.26, lng: 77.41 },
  patna:        { name: 'Patna',        state: 'Bihar',          lat: 25.61, lng: 85.14 },
  vadodara:     { name: 'Vadodara',     state: 'Gujarat',        lat: 22.31, lng: 73.19 },
  rajkot:       { name: 'Rajkot',       state: 'Gujarat',        lat: 22.30, lng: 70.80 },
  udaipur:      { name: 'Udaipur',      state: 'Rajasthan',      lat: 24.59, lng: 73.71 },
  jodhpur:      { name: 'Jodhpur',      state: 'Rajasthan',      lat: 26.24, lng: 73.02 },
  coimbatore:   { name: 'Coimbatore',   state: 'Tamil Nadu',     lat: 11.00, lng: 76.96 },
  kochi:        { name: 'Kochi',        state: 'Kerala',         lat:  9.93, lng: 76.27 },
  chandigarh:   { name: 'Chandigarh',   state: 'Chandigarh',     lat: 30.73, lng: 76.78 },
  guwahati:     { name: 'Guwahati',     state: 'Assam',          lat: 26.14, lng: 91.74 },
  ranchi:       { name: 'Ranchi',       state: 'Jharkhand',      lat: 23.34, lng: 85.31 },
};

const CITY_KEY = 'navkar_user_city';

export function getUserCity(): string | null {
  try { return localStorage.getItem(CITY_KEY); } catch { return null; }
}

export function setUserCity(cityId: string): void {
  try { localStorage.setItem(CITY_KEY, cityId); } catch { /* noop */ }
}
