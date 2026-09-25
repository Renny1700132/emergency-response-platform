<script setup lang="ts">
import { ref } from 'vue'
import { useApiClient } from '@/shared/http/api-context'
import { uploadPlatformFile } from '@/features/response/workflow'

const props = defineProps<{ modelValue: string[]; capture?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const api = useApiClient()
const uploading = ref(false), error = ref(''), pending = ref<File | null>(null)

async function upload(file: File) {
  pending.value = file; uploading.value = true; error.value = ''
  try { emit('update:modelValue', [...props.modelValue, await uploadPlatformFile(api, file)]); pending.value = null }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '附件上传失败，请重试。' }
  finally { uploading.value = false }
}
function select(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (file) void upload(file) }
</script>
<template><div class="attachment-upload"><label>拍照或选择附件<input type="file" accept="image/*,.pdf" :capture="capture ? 'environment' : undefined" :disabled="uploading" @change="select" /></label><p v-if="uploading" role="status">附件上传中…</p><div v-if="error" class="upload-error" role="alert"><span>{{ error }}</span><button v-if="pending" type="button" @click="upload(pending)">重试上传</button></div><ul v-if="modelValue.length"><li v-for="id in modelValue" :key="id">{{ id }}</li></ul></div></template>
