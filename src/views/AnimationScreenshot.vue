<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-06 18:07:33
 * @Description:
-->
<script setup lang="ts">
import { ref } from "vue";
import AnimeGame from "@/components/AnimeGame";
import { clsx } from "@kasuie/utils";
const isPlaying = ref(false);
const data = ref<Array<Record<string, string | number>>>([]);
const options = ref<Array<Record<string, string>>>([]);
const score = ref<number>(0);
const correct = ref<number>(0);
const error = ref<number>(0);
const showResult = ref(false);
import fetch from "@/lib/fetch";
const startGame = () => {
  fetch.get("/apis/ds/aGameData").then((res) => {
    if (res.success) {
      const { options: optionsData, subjects } =
        (res.data as Record<string, Array<Record<string, unknown>>>) || {};
      options.value = (optionsData as Array<Record<string, string>>).map((v) => ({
        ...v,
        label: v.nameCn,
      }));
      data.value = (subjects as Array<Record<string, string | number>>).map((v) => ({
        ...v,
        label: v.nameCn,
      }));
      isPlaying.value = true;
      showResult.value = false;
      correct.value = 0;
      error.value = 0;
    }
  });
  console.log("开始游戏");
};
const onResult = (result: number, records: Array<Record<string, unknown>>) => {
  console.log("结束游戏");
  score.value = result;
  records.forEach((record) => {
    if (record.correct) {
      correct.value += 1;
    } else {
      error.value += 1;
    }
  });
  isPlaying.value = false;
  showResult.value = true;
};
</script>

<template>
  <div
    :class="
      clsx('flex justify-center h-full', {
        'items-center': showResult || !isPlaying,
      })
    "
  >
    <div v-if="showResult" class="flex flex-col items-center gap-3">
      <h1 class="text-2xl font-extrabold">游戏结束</h1>
      <p class="text-sm">答对: {{ correct }}，答错：{{ error }}</p>
      <p class="text-sm">得分: {{ score }}</p>
      <button
        @click="startGame"
        class="flex rounded-2xl cursor-pointer overflow-hidden items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white shadow hover:bg-black/90 h-10 px-4 py-2 max-w-52 whitespace-pre md:flex group relative w-full justify-center gap-2 transition-all duration-300 ease-out hover:ring-2 hover:ring-black hover:ring-offset-2"
      >
        <span
          class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
        ></span>
        <div class="flex items-center">
          <span class="ml-1 text-white">再来一局</span>
        </div>
      </button>
      <p class="text-xs cursor-pointer select-none flex items-center gap-2">
        <!-- <span class="text-blue-400 underline">详情></span> -->
        <span @click="() => (showResult = false)" class="text-blue-400 underline">退出></span>
      </p>
    </div>
    <div v-if="!showResult && !isPlaying" class="flex flex-col items-center gap-3">
      <h1 class="text-2xl font-extrabold">截图猜动画</h1>
      <p class="text-sm">规定时间内根据截图猜动画作品名</p>
      <p class="text-sm">猜对得分猜错扣分</p>
      <button
        @click="startGame"
        class="flex rounded-2xl cursor-pointer overflow-hidden items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white shadow hover:bg-black/90 h-10 px-4 py-2 max-w-52 whitespace-pre md:flex group relative w-full justify-center gap-2 transition-all duration-300 ease-out hover:ring-2 hover:ring-black hover:ring-offset-2"
      >
        <span
          class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
        ></span>
        <div class="flex items-center">
          <span class="ml-1 text-white">开始游戏</span>
        </div>
      </button>
    </div>
    <AnimeGame
      v-if="!showResult && isPlaying"
      @onResult="onResult"
      :data="data"
      :options="options"
    ></AnimeGame>
  </div>
</template>
