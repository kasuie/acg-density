<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-15 15:13:35
 * @Description:
-->
<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import AppProvider from "./components/AppProvider";
import AppLayout from "@/components/AppLayout";
</script>

<template>
  <AppProvider>
    <AppLayout :name="useRoute().name as string">
      <RouterView />
    </AppLayout>
  </AppProvider>
</template>
