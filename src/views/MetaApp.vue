<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-15 17:32:43
 * @Description:
-->
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

const tabs = reactive([
  {
    name: "首页",
    icon: "iconfont icon-shouye",
  },
  {
    name: "社区",
    icon: "iconfont icon-game",
  },
  {
    name: "创作",
    icon: "iconfont icon-wode",
  },
  {
    name: "找游戏",
    icon: "iconfont icon-wode",
  },
  {
    name: "我的",
    icon: "iconfont icon-wode",
  },
]);

const scrollContainer = ref<HTMLElement | null>(null);
const items = ref<{ title: string }[]>([]);
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true);

// 模拟加载数据
const loadData = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  // 模拟网络请求
  await new Promise((r) => setTimeout(r, 500));
  const newItems = Array.from({ length: 10 }, (_, i) => ({
    title: `项目 ${(page.value - 1) * 10 + i + 1}`,
  }));

  if (newItems.length === 0) hasMore.value = false;

  items.value.push(...newItems);
  page.value++;
  isLoading.value = false;
};

// 监听滚动触底
const onScroll = () => {
  const el = scrollContainer.value;
  if (!el) return;

  const scrollBottom = el.scrollTop + el.clientHeight;
  if (scrollBottom >= el.scrollHeight - 50) {
    loadData();
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-4 h-12 flex items-center justify-between">
      <div class="flex items-center flex-1">
        <span>发现</span>
        <span>游戏圈</span>
      </div>
      <div class="flex items-center">
        <span>x</span>
        <span>x</span>
      </div>
    </div>
    <div class="overflow-auto h-[calc(100vh-7rem)]" ref="scrollContainer" @scroll="onScroll">
      <!-- 渲染瀑布流内容 -->
      <div class="columns-2 gap-4" v-if="items.length">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="break-inside-avoid mb-4 h-58 bg-white rounded shadow p-2"
        >
          <p class="text-sm">{{ item.title }}</p>
          <!-- 可以放图片、卡片等内容 -->
        </div>
      </div>
      <div v-else class="text-center text-gray-400 py-8">暂无内容</div>
    </div>
    <ul class="px-8 h-16 w-full flex justify-between items-center">
      <li
        v-for="(item, index) in tabs"
        :key="item.name"
        class="flex flex-col justify-center items-center px-3"
      >
        <span>{{ index }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
