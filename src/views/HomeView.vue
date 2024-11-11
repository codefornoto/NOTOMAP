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
            <template v-for="(markerGroup, category) in categorizedPlaces" :key="category">
              <template v-if="isCategoryVisible(category)">
                <l-marker
                  v-for="place in markerGroup"
                  :key="place.id"
                  :lat-lng="[place.lat, place.lng]"
                  class="markerInvisible"
                >
                  <l-icon icon-url="nothing" :icon-size="[0, 0]"></l-icon>
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
        <v-row class="pa-4 mt-6">
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
          <v-col cols="8">
            <v-text-field
              v-model="category"
              label="category"
              placeholder="カテゴリーを入力"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-btn color="secondary" @click="register">Register</v-btn>
          </v-col>

          <v-col cols="4">
            <v-btn color="primary" @click="search">Search</v-btn>
          </v-col>
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
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import type { Marker } from '../types/marker'
import { useRoute } from 'vue-router'

const route = useRoute()
const centerLat = route.query.lat ? route.query.lat : 37.39225471283128
const centerLng = route.query.lng ? route.query.lng : 136.9037461280823
const zoom = ref<number>(route.query.zoom ? Number(route.query.zoom) : 15)

import { fetchMarkers } from '../services/getMarkers'
import { registerMarker } from '../services/registerMarker'
const places = ref<Marker[]>([])
const windowSize = ref(12)
const center = ref([centerLat, centerLng])
// const iconMarkers = L.featureGroup()
const inputLat = ref(35.6769883)
const inputLon = ref(139.7588499)
const message = ref('メッセージを入力してregisterボタンを押してください')
const tmpMarker = ref([35.6769883, 139.7588499])
const category = ref('')

const categorizedPlaces = ref<{ [key: string]: Marker[] }>({})
const visibleCategories = ref<{ [key: string]: boolean }>({})
const isCategoryVisible = (category: string) => {
  return visibleCategories.value[category] !== false
}

const search = () => {
  center.value = [inputLat.value, inputLon.value]
  tmpMarker.value = center.value as number[]
}

const moveMarker = (e: { latlng?: { lat: number; lng: number } }) => {
  if (!e.latlng) {
    return
  }
  tmpMarker.value = [e.latlng.lat, e.latlng.lng]
  inputLat.value = e.latlng.lat
  inputLon.value = e.latlng.lng
}

function openMenu() {
  if (windowSize.value == 8) {
    windowSize.value = 12
  } else {
    windowSize.value = 8
  }
}

const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref<'success' | 'error'>('success')

const register = async () => {
  try {
    const newMarker = {
      lat: inputLat.value.toString(),
      lng: inputLon.value.toString(),
      message: message.value,
      category: category.value || 'user-added',
    }

    await registerMarker(newMarker)
    const updatedMarkers = await fetchMarkers()
    places.value = updatedMarkers
    categorizePlaces()
    message.value = ''
    category.value = ''

    alertType.value = 'success'
    alertMessage.value = 'マーカーが正常に登録されました'
    showAlert.value = true

    setTimeout(() => {
      showAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error registering marker:', error)

    alertType.value = 'error'
    alertMessage.value = 'マーカーの登録に失敗しました'
    showAlert.value = true
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

onMounted(async () => {
  try {
    const data = await fetchMarkers()
    places.value = data
    categorizePlaces()
    Object.keys(categorizedPlaces.value).forEach((category) => {
      visibleCategories.value[category] = true
    })
  } catch (error) {
    console.error('Error loading markers:', error)
  }
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
