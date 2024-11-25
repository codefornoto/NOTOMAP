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
          <v-col cols="12">
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
        </v-row>
        <v-row>
          <v-col cols="3" v-for="category in Object.keys(categorizedPlaces)" :key="category">
            <v-checkbox v-model="visibleCategories[category]" :label="category"></v-checkbox>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import type { Marker } from '../types/marker'
import type { Region } from '../types/region'
import { useRoute } from 'vue-router'
import { fetchMarkers } from '../services/getMarkers'
import { fetchRegionList } from '../services/getRegionList'
import { registerMarker } from '../services/registerMarker'

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
    // @ts-expect-error: regions.value.find() の引数は型 'string' を期待しますが、引数 'item' は型 'any' です。
    // このエラーは、regions.value.find() の引数が 'any' 型であるため発生します。
    // これを解決するには、regions.value.find() の引数の型を明示的に指定する必要があります。
    const selected = regions.value.find((item: { name: string }) => item.name === newRegion)
    console.log(newRegion)
    console.log(selected)
    if (selected) {
      center.value = [Number(selected.latitude), Number(selected.longitude)]
      region.value = selected.name
      showMessage('success', '選択した地域に移動しました。')

      try {
        await getMarker(region.value)
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
  Object.keys(categorizedPlaces.value).forEach((category) => {
    visibleCategories.value[category] = true
  })
}

// 画面起動時にlocalStorageから値を取得
onMounted(async () => {
  try {
    const regionData = await fetchRegionList()
    regions.value = regionData
    // await getMarker('all')
  } catch (error) {
    console.error('Error loading markers:', error)
  }

  if (regionId) {
    const targetRegion = regions.value.find((item) => item.id === regionId)
    console.log(regionId)
    if (targetRegion) {
      selectedRegion.value = targetRegion
      region.value = targetRegion.name
      center.value = [Number(targetRegion.latitude), Number(targetRegion.longitude)]
      await getMarker(targetRegion.name)
    }
  }

  // 初期マーカーを取得
  getMarker(region.value || 'all')
})
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
</style>
