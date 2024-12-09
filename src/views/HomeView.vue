<template>
  <v-container fluid class="pa-0 container-wrapper">
    <v-app-bar-nav-icon class="menu-button" @click="openMenu"></v-app-bar-nav-icon>
    <v-row class="ma-0">
      <v-col class="pa-0" :cols="windowSize">
        <div style="height: 100vh">
          <l-map
            ref="map"
            :zoom="zoom"
            :use-global-leaflet="false"
            :center="center"
            @click="moveMarker"
            :options="leafletMapOptions"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
              attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            >
            </l-tile-layer>
            <l-marker :lat-lng="[Number(inputLat), Number(inputLon)]"> </l-marker>
            <template v-for="(markerGroup, category) in categorizedPlaces" :key="category">
              <template v-if="isCategoryVisible(category)">
                <l-marker
                  v-for="place in markerGroup"
                  :key="place.id"
                  :lat-lng="[Number(place.lat), Number(place.lng)]"
                >
                  <l-icon
                    icon-url="https://codefornoto.github.io/images/map.png"
                    :icon-size="[0, 0]"
                  ></l-icon>
                  <l-tooltip
                    :options="{
                      permanent: true,
                      interactive: true,
                      opacity: 0.9,
                      className: 'custom-tooltip',
                    }"
                  >
                    {{ place.message || place.category }}
                  </l-tooltip>
                </l-marker>
              </template>
            </template>
            <template v-if="showEvacuationSpace">
              <l-marker
                v-for="place in evacuationSpace"
                :key="place.id"
                :lat-lng="[Number(place.lat), Number(place.lng)]"
                @click="place.showTooltip = !place.showTooltip"
              >
                <l-icon
                  :icon-url="'data:image/svg+xml;utf8,' + encodeURIComponent(mdiExitRunSvg)"
                  :icon-size="[30, 30]"
                  :style="{ color: 'green', opacity: 0.9 }"
                >
                </l-icon>
                <l-tooltip
                  v-if="place.showTooltip"
                  :options="{
                    permanent: true,
                    interactive: true,
                    opacity: 0.9,
                    className: 'custom-tooltip',
                  }"
                >
                  {{ place.name }}
                </l-tooltip>
              </l-marker>
            </template>
            <template v-if="showPreschool">
              <l-marker
                v-for="place in preschool"
                :key="place.id"
                :lat-lng="[Number(place.lat), Number(place.lng)]"
                @click="place.showTooltip = !place.showTooltip"
              >
                <l-icon
                  :icon-url="
                    'data:image/svg+xml;utf8,' + encodeURIComponent(mdiHumanMaleMaleChildSvg)
                  "
                  :icon-size="[30, 30]"
                  :style="{ color: 'green', opacity: 0.9 }"
                ></l-icon>
                <l-tooltip
                  v-if="place.showTooltip"
                  :options="{
                    permanent: true,
                    interactive: true,
                    opacity: 0.9,
                    className: 'custom-tooltip',
                  }"
                >
                  {{ place.name }}
                </l-tooltip>
              </l-marker>
            </template>
            <template v-if="showPublicFacility">
              <l-marker
                v-for="place in publicFacility"
                :key="place.id"
                :lat-lng="[Number(place.lat), Number(place.lng)]"
                @click="place.showTooltip = !place.showTooltip"
              >
                <l-icon
                  :icon-url="
                    'data:image/svg+xml;utf8,' + encodeURIComponent(mdiOfficeBuildingMarkerSvg)
                  "
                  :icon-size="[30, 30]"
                  :style="{ color: 'green', opacity: 0.9 }"
                ></l-icon>
                <l-tooltip
                  v-if="place.showTooltip"
                  :options="{
                    permanent: true,
                    interactive: true,
                    opacity: 0.9,
                    className: 'custom-tooltip',
                  }"
                >
                  {{ place.name }}
                </l-tooltip>
              </l-marker>
            </template>
          </l-map>
        </div>
      </v-col>
      <v-col v-show="12 - windowSize !== 0" :cols="12 - windowSize">
        <v-row class="pa-4 mt-6" v-show="mode === 'admin'">
          <v-col cols="6">
            <v-text-field
              v-model="inputLat"
              label="緯度"
              placeholder="緯度"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="inputLon"
              label="経度"
              placeholder="経度"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="message"
              label="メッセージ"
              placeholder="好きなメッセージを入力して地図上に登録します"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="category"
              label="category"
              placeholder="カテゴリーを入力"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="region"
              :items="regions"
              item-title="name"
              item-id="id"
              label="地域・協議会を入力"
              placeholder="地域・協議会を入力"
              variant="outlined"
            />
          </v-col>
          <v-col cols="4">
            <v-btn color="secondary" @click="register">Register</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-alert
              v-if="showAlert"
              :type="alertType"
              :text="alertMessage"
              class="mt-4"
              closable
              @click:close="showAlert = false"
            ></v-alert>
          </v-col>
          <v-col cols="10">
            <v-select
              v-model="selectedRegion"
              :items="regions"
              item-title="name"
              item-id="id"
              label="地域を選択"
              placeholder="地域を選択してください"
            >
            </v-select>
          </v-col>
          <v-col class="mt-6 px-0"> 全{{ placeCount }}件 </v-col>
        </v-row>
        <!-- 施設の表示 -->
        <v-divider></v-divider>
        <v-row>
          <v-col class="mt-4"> 施設の表示 </v-col>
        </v-row>
        <v-row>
          <v-col cols="4" class="pt-0">
            <div
              @click="toggleVisibility('evacuationSpace')"
              style="cursor: pointer; display: flex; flex-direction: column; align-items: center"
            >
              <v-icon size="48" :class="showEvacuationSpace ? 'green-icon' : 'black-icon'">
                {{ mdiExitRun }}
              </v-icon>
              指定避難所
            </div>
          </v-col>
          <v-col cols="4" class="pt-0">
            <div
              @click="toggleVisibility('preschool')"
              style="cursor: pointer; display: flex; flex-direction: column; align-items: center"
            >
              <v-icon size="48" :class="showPreschool ? 'green-icon' : 'black-icon'">
                {{ mdiHumanMaleMaleChild }}
              </v-icon>
              子育て施設
            </div>
          </v-col>
          <v-col cols="4" class="pt-0">
            <div
              @click="toggleVisibility('publicFacility')"
              style="cursor: pointer; display: flex; flex-direction: column; align-items: center"
            >
              <v-icon size="48" :class="showPublicFacility ? 'green-icon' : 'black-icon'">
                {{ mdiOfficeBuildingMarker }}
              </v-icon>
              公共施設
            </div>
          </v-col>
        </v-row>
        <!-- カテゴリ別表示 -->
        <v-divider class="mt-4"></v-divider>
        <v-row>
          <v-col class="mt-4"> カテゴリ別表示 </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="py-0">
            <v-radio-group inline v-model="toggleAll" @change="toggleAllCategories(toggleAll)">
              <v-radio label="すべて表示" :value="true"></v-radio>
              <v-radio label="すべて非表示" :value="false"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="3"
            class="py-0"
            v-for="category in Object.keys(categorizedPlaces)"
            :key="category"
          >
            <v-checkbox v-model="visibleCategories[category]" :label="category"></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import type { Marker } from '../types/marker'
import type { Region } from '../types/region'
import type { Facility } from '../types/facility'
import { useRoute } from 'vue-router'
import { fetchMarkers } from '../services/getMarkers'
import { fetchRegionList } from '../services/getRegionList'
import { fetchFacilityList } from '../services/getFacilityList'
import { registerMarker } from '../services/registerMarker'
import { mdiExitRun } from '@mdi/js'
import { mdiHumanMaleMaleChild } from '@mdi/js'
import { mdiOfficeBuildingMarker } from '@mdi/js'
const mdiExitRunSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${mdiExitRun}" fill="green"/></svg>`
const mdiHumanMaleMaleChildSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${mdiHumanMaleMaleChild}" fill="green"/></svg>`
const mdiOfficeBuildingMarkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${mdiOfficeBuildingMarker}" fill="green"/></svg>`

const route = useRoute()
const mode = route.query.mode
const regionId = route.query.region
const zoom = ref<number>(route.query.zoom ? Number(route.query.zoom) : 15)
const places = ref<Marker[]>([])
const windowSize = ref(12)
const center = ref([37.39225471283128, 136.9037461280823])
const inputLat = ref(35.6769883)
const inputLon = ref(139.7588499)
const message = ref('')
const category = ref('')
const region = ref('all')
const selectedRegion = ref<Region>({
  id: 'all',
  name: '全地域',
  address: '',
  latitude: '',
  longitude: '',
})
const regions = ref<Region[]>([])
const categorizedPlaces = ref<{ [key: string]: Marker[] }>({})
const visibleCategories = ref<{ [key: string]: boolean }>({})
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref<'success' | 'error'>('success')
const toggleAll = ref(true)
const placeCount = computed(() => {
  return places.value.length
})

// 施設データ
const evacuationSpace = ref<Facility[]>([])
const publicFacility = ref<Facility[]>([])
const preschool = ref<Facility[]>([])
const showEvacuationSpace = ref(false)
const showPublicFacility = ref(false)
const showPreschool = ref(false)

const leafletMapOptions = {
  doubleClickZoom: false,
}

const isCategoryVisible = (category: string | number) => {
  return visibleCategories.value[category] !== false
}

const moveMarker = (e: { latlng?: { lat: number; lng: number } }) => {
  if (!e.latlng) {
    return
  }
  inputLat.value = e.latlng.lat
  inputLon.value = e.latlng.lng
}

function openMenu() {
  windowSize.value = windowSize.value === 8 ? 12 : 8
}

function showMessage(type: 'success' | 'error', message: string) {
  alertType.value = type
  alertMessage.value = message
  showAlert.value = true

  setTimeout(() => {
    showAlert.value = false
  }, 5000)
}
const register = async () => {
  try {
    const newMarker = {
      lat: inputLat.value.toString(),
      lng: inputLon.value.toString(),
      message: message.value,
      category: category.value || 'user-added',
      region: region.value || 'user-added',
    }

    await registerMarker(newMarker)
    await getMarker(region.value)
    visibleCategories.value[newMarker.category] = true
    message.value = ''

    showMessage('success', 'マーカーが正常に登録されました')
  } catch (error) {
    console.error('Error registering marker:', error)

    showMessage('error', 'マーカーの登録に失敗しました')
  }
}

const categorizePlaces = () => {
  categorizedPlaces.value = {}
  places.value.forEach((place) => {
    const category = place.category || '未分類'
    if (!categorizedPlaces.value[category]) {
      categorizedPlaces.value[category] = []
    }
    categorizedPlaces.value[category].push(place)
  })
}

watch(selectedRegion, async (newRegion) => {
  if (newRegion) {
    // @ts-expect-error: regions.value.find() の引数は型 'string' を期待しますが、数 'item' は型 'any' で。
    // このエラーは、regions.value.find() の引数が 'any' 型であるため発生します。
    // これを解決するには、regions.value.find() の引数の型を明示的に指定する必要があります。
    const selected = regions.value.find((item: { name: string }) => item.name === newRegion)
    if (selected) {
      center.value = [Number(selected.latitude), Number(selected.longitude)]
      region.value = selected.name
      showMessage('success', '選択した地域に移動しました。')

      try {
        await getMarker(region.value)
        resetVisibleCategory()
      } catch {
        //
      }
    }
  }
})

async function getMarker(region: string) {
  const data = await fetchMarkers(region)
  places.value = data
  categorizePlaces()
}

function resetVisibleCategory() {
  Object.keys(categorizedPlaces.value).forEach((category) => {
    visibleCategories.value[category] = true
  })
  toggleAll.value = true
}

const toggleAllCategories = (value: boolean) => {
  Object.keys(visibleCategories.value).forEach((category) => {
    visibleCategories.value[category] = value
  })
}
// 画面起動時にlocalStorageから値を取得
onMounted(async () => {
  try {
    const regionData = await fetchRegionList('master')
    regions.value = regionData

    // Promise.allを使用して複数の非同期処理をまとめて実行
    const [evacuationData, publicFacilityData, preschoolData] = await Promise.all([
      fetchFacilityList('evacuation_space'),
      fetchFacilityList('public_facility'),
      fetchFacilityList('preschool'),
    ])

    evacuationSpace.value = evacuationData
    publicFacility.value = publicFacilityData
    preschool.value = preschoolData
  } catch (error) {
    console.error('Error loading markers:', error)
  }

  if (regionId) {
    const targetRegion = regions.value.find((item) => item.id === regionId)
    if (targetRegion) {
      selectedRegion.value = targetRegion
      region.value = targetRegion.name
      center.value = [Number(targetRegion.latitude), Number(targetRegion.longitude)]
    }
  }

  await getMarker(region.value || 'all')
  resetVisibleCategory()
})

const toggleVisibility = (type: 'evacuationSpace' | 'preschool' | 'publicFacility') => {
  if (type === 'evacuationSpace') {
    showEvacuationSpace.value = !showEvacuationSpace.value
  } else if (type === 'preschool') {
    showPreschool.value = !showPreschool.value
  } else if (type === 'publicFacility') {
    showPublicFacility.value = !showPublicFacility.value
  }
}
</script>

<style scoped>
.container-wrapper {
  position: relative;
}

.menu-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

:deep(.custom-tooltip) {
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
}

:deep(.v-alert) {
  margin-bottom: 0;
}

.green-icon {
  color: green;
}
.black-icon {
  color: black;
}
</style>
