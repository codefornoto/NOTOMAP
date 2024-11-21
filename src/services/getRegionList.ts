import { GAS_URL } from '../config'

interface RegionListResponse {
  status: string
  data: {
    id: number
    name: string
    address: string
    latitude: string
    longitude: string
  }[]
}

export async function fetchMarkers() {
  try {
    const response = await fetch(`${GAS_URL}?sheetName=master`)
    const data: RegionListResponse = await response.json()

    if (data.status === 'success') {
      return data.data
    }
    throw new Error('Failed to fetch markers')
  } catch (error) {
    console.error('Error fetching markers:', error)
    return []
  }
}
