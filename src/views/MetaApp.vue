<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-16 18:35:29
 * @Description:
-->
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import BScroll from "@better-scroll/core";
import PullDown from "@better-scroll/pull-down";
import PullUp from "@better-scroll/pull-up";
import fetch from "@/lib/fetch";

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const items = ref<Record<string, any>[]>([]);
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true);

const bs = ref<BScroll>();
const isPullUpLoad = ref(false);
const topTip = ref("");

// 模拟加载数据
const loadData = async (init: boolean = false) => {
  console.log("loadData>>>");

  if (isLoading.value || !hasMore.value) return;
  if (init) {
    page.value = 1;
  }

  isLoading.value = true;
  topTip.value = "加载中...";
  // 模拟网络请求
  fetch
    .get(
      "/apis/img/multiples",
      {
        r18: 2,
        sizes: ["original", "small"],
        proxy: "i.pixiv.re",
        size: 10,
        current: page.value,
      },
      {
        headers: {
          author: "kasuie",
        },
      }
    )
    .then((res) => {
      if (res.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { records, pages, current }: any = res.data;
        if (pages === current) hasMore.value = false;
        topTip.value = "加载完成";
        if (init) {
          items.value = records;
        } else {
          items.value.push(...records);
        }
        page.value++;
        isLoading.value = false;
      }
    });
};

const initScroll = () => {
  if (scrollContainer.value) {
    BScroll.use(PullUp).use(PullDown);
    bs.value = new BScroll(scrollContainer.value, {
      scrollY: true,
      pullUpLoad: {
        threshold: -50,
      },
      pullDownRefresh: true,
    });
    bs.value.on("enterThreshold", () => {
      topTip.value = "下拉刷新";
    });
    bs.value.on("leaveThreshold", () => {
      topTip.value = "松手刷新";
    });
    bs.value.on("pullingDown", pullingDownHandler);
    bs.value.on("pullingUp", pullingUpHandler);
  }
};

const pullingDownHandler = async () => {
  console.log("pullingDownHandler>>>");
  await loadData(true);
  bs.value?.finishPullDown();
  setTimeout(() => {
    bs.value?.refresh();
  }, 850);
};

const pullingUpHandler = async () => {
  console.log("pullingUpHandler>>>");
  isPullUpLoad.value = true;
  await loadData();
  bs.value?.finishPullUp();
  setTimeout(() => {
    bs.value?.refresh();
  }, 850);
  isPullUpLoad.value = false;
};

onMounted(() => {
  initScroll();
  loadData();
});

onUnmounted(() => {
  bs.value?.destroy();
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
    <div class="overflow-hidden h-[calc(100vh-7rem)] relative" ref="scrollContainer">
      <div class="px-1">
        <div
          class="w-full absolute p-4 box-border text-center text-gray-600"
          style="transform: translateY(-100%) translateZ(0)"
        >
          <div v-html="topTip"></div>
        </div>
        <!-- 渲染瀑布流内容 -->
        <div class="1columns-2 1gap-2" v-if="items.length">
          <wc-waterfall gap="10" cols="2">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="break-inside-avoid bg-white rounded shadow pb-2 !mb-2"
            >
              <div>
                <img
                  :src="item.urls?.small"
                  :alt="item.title"
                  class="w-full object-cover rounded"
                />
              </div>
              <h2 class="text-blod text-xl py-1">{{ item.title }}</h2>
              <p class="text-xs">{{ item.pid }}</p>
              <div class="flex items-center gap-2 mt-2">
                <img
                  :src="item.urls?.small"
                  :alt="item.title"
                  class="w-8 h-8 object-cover rounded-full"
                />
                <span>{{ item.author }}</span>
              </div>
              <!-- 可以放图片、卡片等内容 -->
            </div>
          </wc-waterfall>
        </div>
        <!-- <div v-else class="text-center text-gray-400 py-8">暂无内容</div> -->
        <div class="w-full p-4 box-border text-center text-gray-600">
          <div v-if="!isPullUpLoad">
            <span>上划加载更多</span>
          </div>
          <div v-else>
            <span>加载中...</span>
          </div>
        </div>
      </div>
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
