import { GAS_URL } from '../config'
import type { Marker } from '../types/marker'

export async function registerMarker(markerData: Partial<Marker>) {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(markerData),
    })
    const result = await response.json()

    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to register marker')
    }

    return result.data
  } catch (error) {
    console.error('Error registering marker:', error)
    throw error
  }
}
