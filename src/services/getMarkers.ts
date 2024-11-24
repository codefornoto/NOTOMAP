import { GAS_URL } from '../config'
import type { Marker } from '../types/marker'

interface MarkerResponse {
  status: string
  data: Marker[]
}

export async function fetchMarkers(region?: string) {
  try {
    const response = await fetch(`${GAS_URL}?sheetName=Marker&region=${region}`, {
      method: 'GET',
    })
    const data: MarkerResponse = await response.json()

    if (data.status === 'success') {
      return data.data
    }
    throw new Error('Failed to fetch markers')
  } catch (error) {
    console.error('Error fetching markers:', error)
    return []
  }
}
