<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-16 22:58:33
 * @Description:
-->
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref, watchEffect } from "vue";
import BScroll from "@better-scroll/core";
import PullDown from "@better-scroll/pull-down";
import PullUp from "@better-scroll/pull-up";
import fetch from "@/lib/fetch";
import { clsx } from "@kasuie/utils";
import "@/assets/meta.css";

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

const navs = ["发现", "游戏圈"];
const videoRefs = ref<HTMLVideoElement[]>([]);

const activeNav = ref("发现");
const activeTab = ref(1);

const currentVideo = ref<HTMLVideoElement | null>(null);
let observer: IntersectionObserver | null = null;
const observedSet = new Set<HTMLVideoElement>();

const scrollContainer = ref<HTMLElement | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const items = ref<Record<string, any>[]>([]);
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true);

const bs = ref<BScroll>();
const isPullUpLoad = ref(false);
const topTip = ref("");

watchEffect(() => {
  nextTick(() => {
    observeVideos();
  });
});

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
        const data: Array<Record<string, unknown>> = swapTwoRandomElements(records);
        if (init) {
          items.value = data;
        } else {
          items.value.push(...data);
        }
        page.value++;
        isLoading.value = false;
      }
    });
};

const swapTwoRandomElements = <T>(arr: T[]): T[] => {
  if (arr.length < 2) return arr;

  const i = Math.floor(Math.random() * arr.length);
  let j = Math.floor(Math.random() * arr.length);

  // 确保 i 和 j 不相同
  while (j === i) {
    j = Math.floor(Math.random() * arr.length);
  }

  // 交换元素
  [arr[i], arr[j]] = [arr[j], arr[i]];

  arr[i] = {
    ...arr[i],
    video: `https://cs.kasuie.cc/blog/video/demo${i > 5 ? "0" : ""}.mp4`,
  };
  arr[j] = {
    ...arr[j],
    video: `https://cs.kasuie.cc/blog/video/demo${j > 5 ? "1" : "2"}.mp4`,
  };

  return arr;
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
  createObserver();
  observeVideos();
});

onUnmounted(() => {
  bs.value?.destroy();
  observer?.disconnect();
  observedSet.clear();
});

const createObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        console.log(video, ">>>", entries);

        if (!entry.isIntersecting && currentVideo.value === video) {
          video.pause();
          video.muted = true;
          currentVideo.value = null;
        }
      }
    },
    {
      threshold: 0.25,
    }
  );
};

const observeVideos = () => {
  videoRefs.value.forEach((video) => {
    if (video && !observedSet.has(video)) {
      observer?.observe(video);
      observedSet.add(video);
    }
  });
};

const onNavClick = (key: string) => {
  activeNav.value = key;
};

const togglePlay = (videoEl: HTMLVideoElement) => {
  if (!videoEl) return;

  // 如果点击的是当前视频，暂停
  if (currentVideo.value === videoEl) {
    videoEl.pause();
    videoEl.muted = true; // 可选：暂停时静音
    currentVideo.value = null;
  } else {
    // 暂停上一个播放的视频并静音
    if (currentVideo.value && !currentVideo.value.paused) {
      currentVideo.value.pause();
      currentVideo.value.muted = true;
    }

    // 取消静音 + 播放新视频
    videoEl.muted = false;
    videoEl.play();
    currentVideo.value = videoEl;
  }
};

const onTabClick = (index: number) => {
  activeTab.value = index;
};
</script>

<template>
  <div class="flex flex-col h-screen bg-[#f7f6f4]">
    <div class="px-4 h-12 flex items-center justify-between">
      <div class="flex items-center flex-1 gap-6">
        <span
          :class="
            clsx('relative nav-item', {
              'nav-item-active': item === activeNav,
            })
          "
          @click="() => onNavClick(item)"
          v-for="item in navs"
          :key="item"
          >{{ item }}</span
        >
      </div>
      <div class="flex items-center gap-2 pr-1">
        <span>搜</span>
        <span>信</span>
      </div>
    </div>
    <div
      v-show="activeTab === 1"
      class="overflow-hidden h-[calc(100vh-7rem)] relative px-1"
      ref="scrollContainer"
    >
      <div class="">
        <div
          class="w-full absolute p-4 box-border text-center text-gray-600"
          style="transform: translateY(-100%) translateZ(0)"
        >
          <div v-html="topTip"></div>
        </div>
        <!-- 渲染瀑布流内容 -->
        <div class="1columns-2 1gap-2" v-if="items.length">
          <wc-waterfall gap="4" cols="2">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="break-inside-avoid bg-white rounded shadow pb-2"
            >
              <div>
                <video
                  muted
                  loop
                  class="h-36 w-full object-cover rounded"
                  :ref="(el: any) => {
                    videoRefs && el && (videoRefs[index] = el)
                  }"
                  v-if="item.video"
                  :src="item.video"
                ></video>
                <img
                  v-else
                  :src="item.urls?.small"
                  :alt="item.title"
                  class="w-full object-cover rounded"
                />
                <!-- 视频右上角播放按钮 -->
                <!-- 播放按钮 -->
                <button
                  v-if="item.video"
                  @click="togglePlay(videoRefs[index])"
                  class="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
                >
                  ▶️
                </button>
              </div>
              <div class="flex flex-col gap-1 px-2 pt-2">
                <h2 class="text-blod text-xl">{{ item.title }}</h2>
                <p class="text-xs opacity-80">{{ item.author }}</p>
                <div class="flex items-center gap-2 opacity-85">
                  <img
                    :src="item.urls?.small"
                    :alt="item.title"
                    class="w-8 h-8 object-cover rounded-full"
                  />
                  <span class="flex-1">{{ item.author }}</span>
                  <span>赞 79</span>
                </div>
              </div>
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
    <div v-show="activeTab != 1" class="h-[calc(100vh-7rem)] relative px-1">
      {{ tabs[activeTab].name }}...
    </div>
    <ul class="px-8 h-16 w-full flex justify-between items-center">
      <li
        v-for="(item, index) in tabs"
        :key="item.name"
        @click="() => onTabClick(index)"
        :class="
          clsx('flex flex-col justify-center text-sm items-center px-3 duration-300 ease-in-out', {
            'active-tab': index === activeTab,
          })
        "
      >
        <span>{{ index }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
