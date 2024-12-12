<template>
  <l-marker
    v-for="place in props.facilities"
    :key="place.id"
    :lat-lng="[Number(place.lat), Number(place.lng)]"
    @click="place.showTooltip = !place.showTooltip"
  >
    <l-icon
      :icon-url="'data:image/svg+xml;utf8,' + encodeURIComponent(props.iconSvg)"
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

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Facility } from '../types/facility'
import { LMarker, LIcon, LTooltip } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  facilities: {
    type: Array as PropType<Facility[]>,
    required: true,
  },
  iconSvg: {
    type: String,
    required: true,
  },
})
</script>
