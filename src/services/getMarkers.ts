import { GAS_URL } from '../config'

interface MarkerResponse {
  status: string
  data: {
    id: number
    lat: string
    lng: string
    message: string
    category?: string
  }[]
}

export async function fetchMarkers() {
  try {
    const response = await fetch(GAS_URL)
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
