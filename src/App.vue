<script setup lang="ts">
import fs from 'fs'
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'

onMounted(() => {
  console.log(fs.writeFileSync.toString());
  console.log(ipcRenderer);
});
</script>

<template>
  <h3>You did it!</h3>
</template>

<style scoped></style>
