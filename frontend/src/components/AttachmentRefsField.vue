<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const text = computed({
  get: () => props.modelValue.join(', '),
  set: (value: string) => emit('update:modelValue', value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean)),
})
</script>
<template>
  <label>附件文件 ID（由中台文件服务上传后返回）<textarea v-model="text" rows="2" placeholder="file-id-1, file-id-2" /></label>
</template>
