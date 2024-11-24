import { GAS_URL } from '../config'
import type { Region } from '../types/region'

interface RegionListResponse {
  status: string
  data: Region[]
}

export async function fetchRegionList() {
  try {
    const response = await fetch(`${GAS_URL}?sheetName=master`)
    const data: RegionListResponse = await response.json()

    if (data.status === 'success') {
      return data.data
    }
    throw new Error('Failed to fetch regions')
  } catch (error) {
    console.error('Error fetching regions:', error)
    return []
  }
}
