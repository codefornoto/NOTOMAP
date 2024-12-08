import { GAS_URL } from '../config'
import type { Facility } from '../types/facility'

interface RegionListResponse {
  status: string
  data: Facility[]
}

export async function fetchFacilityList(sheetName: string) {
  try {
    const response = await fetch(`${GAS_URL}?sheetName=${sheetName}`)
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
