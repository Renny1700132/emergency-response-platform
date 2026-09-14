<script setup>defineProps({text:{type:String,required:true}})</script>
<template><span class="status-tag" :data-status="text">{{ text }}</span></template>