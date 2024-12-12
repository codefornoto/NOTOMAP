<template>
  <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center">
    <v-icon size="48" :class="props.isShow ? 'green-icon' : 'black-icon'">
      {{ props.icon }}
    </v-icon>
    {{ props.alt }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isShow: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.green-icon {
  color: green;
}
.black-icon {
  color: black;
}
</style>
