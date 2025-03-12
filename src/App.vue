<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-04 14:26:10
 * @Description:
-->
<script setup lang="ts">
import { RouterView } from "vue-router";
import AppProvider from "./components/AppProvider";
import AppLayout from "@/components/AppLayout";
</script>

<template>
  <AppProvider>
    <AppLayout>
      <RouterView />
    </AppLayout>
  </AppProvider>
</template>
