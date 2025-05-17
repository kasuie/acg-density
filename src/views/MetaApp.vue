<!--
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-17 21:41:49
 * @Description:
-->
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import BScroll from "@better-scroll/core";
import PullDown from "@better-scroll/pull-down";
import PullUp from "@better-scroll/pull-up";
import fetch from "@/lib/fetch";
import { clsx } from "@kasuie/utils";
import {
  Home,
  Search,
  Chat,
  Night,
  Cookie,
  Person,
  Discord,
  Good,
  Play,
  Pause,
} from "@/components/IconLib";
import "@/assets/meta.css";
import { makeBlurDataURL } from "@/lib/image";
import { useRoute } from "vue-router";

const tabs = reactive([
  {
    name: "首页",
    icon: Home,
  },
  {
    name: "社区",
    icon: Night,
  },
  {
    name: "创作",
    icon: Cookie,
  },
  {
    name: "找游戏",
    icon: Discord,
  },
  {
    name: "我的",
    icon: Person,
  },
]);

const navs = ["发现", "游戏圈"];
const videoRefs = ref<HTMLVideoElement[]>([]);

const activeNav = ref("发现");
const activeTab = ref(1);

const currentVideoIndex = ref<number>();
const currentVideo = ref<HTMLVideoElement | null>(null);

const scrollContainer = ref<HTMLElement | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const items = ref<Record<string, any>[]>([]);
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true);

const bs = ref<BScroll>();
const isPullUpLoad = ref(false);
const topTip = ref("");

const imageLoaded = ref<boolean[]>([]);
const route = useRoute();

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
      }
    })
    .finally(() => {
      isLoading.value = false;
      isPullUpLoad.value = false;
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
      bounceTime: 800,
      useTransition: false,
      // pullDownRefresh: true,
      pullDownRefresh: {
        threshold: 70,
        stop: 30,
      },
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
  isLoading.value = false;
  await loadData(true).then(() => {
    bs.value?.finishPullDown();
    setTimeout(() => {
      bs.value?.refresh();
    }, 850);
  });
};

const pullingUpHandler = async () => {
  console.log("pullingUpHandler>>>");
  isPullUpLoad.value = true;
  await loadData().then(() => {
    bs.value?.finishPullUp();
    setTimeout(() => {
      bs.value?.refresh();
    }, 850);
  });
};

onMounted(() => {
  const initPage = route.query.page;
  if (initPage) {
    page.value = +initPage > 10 ? 10 : +initPage;
  }
  initScroll();
  loadData();
});

onUnmounted(() => {
  bs.value?.destroy();
});

const onNavClick = (key: string) => {
  activeNav.value = key;
};

const togglePlay = (videoEl: HTMLVideoElement, index: number) => {
  if (!videoEl) return;

  // 如果点击的是当前视频，暂停
  if (currentVideo.value === videoEl) {
    videoEl.pause();
    videoEl.muted = true; // 可选：暂停时静音
    currentVideo.value = null;
    currentVideoIndex.value = -1;
  } else {
    // 暂停上一个播放的视频并静音
    if (currentVideo.value && !currentVideo.value.paused) {
      currentVideo.value.pause();
      currentVideo.value.muted = true;
    }
    currentVideoIndex.value = index;
    // 取消静音 + 播放新视频
    videoEl.muted = false;
    videoEl.play();
    currentVideo.value = videoEl;
  }
};

const onTabClick = (index: number) => {
  activeTab.value = index;
};

function handleImageLoad(index: number) {
  imageLoaded.value[index] = true;
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#f7f6f4] min-w-[360px]">
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
      <div class="flex items-center gap-4 pr-1">
        <Search size="24" />
        <Chat size="24" />
      </div>
    </div>
    <div
      v-show="activeTab === 1"
      class="overflow-hidden h-[calc(100vh-7rem)] relative px-1"
      ref="scrollContainer"
    >
      <div class="relative">
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
              class="break-inside-avoid bg-white rounded-b-lg shadow pb-2"
            >
              <div>
                <video
                  muted
                  loop
                  class="h-36 w-full object-cover rounded-t-md"
                  :ref="(el: any) => {
                    videoRefs && el && (videoRefs[index] = el)
                  }"
                  v-if="item.video"
                  :src="item.video"
                ></video>
                <div
                  v-else
                  class="relative w-full overflow-hidden rounded-t-md"
                  :style="{ aspectRatio: `${item.width} / ${item.height}` }"
                >
                  <img
                    :src="makeBlurDataURL(item.width, item.height)"
                    :width="item.width"
                    :height="item.height"
                    class="w-full h-full object-cover transition-opacity duration-300"
                    :style="{ opacity: imageLoaded[index] ? 0 : 1 }"
                  />
                  <img
                    :src="item.urls?.small"
                    :alt="item.title"
                    class="w-full object-cover absolute top-0 left-0 transition-opacity duration-300"
                    :style="{ opacity: imageLoaded[index] ? 1 : 0 }"
                    @load="handleImageLoad(index)"
                  />
                </div>
                <span
                  v-if="item.video"
                  @touchend="togglePlay(videoRefs[index], index)"
                  @click="togglePlay(videoRefs[index], index)"
                  class="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
                >
                  <Pause v-if="currentVideoIndex === index" />
                  <Play v-else />
                </span>
              </div>
              <div class="flex flex-col gap-1 px-2 pt-2">
                <p class="text-blod text-xl text-line-2">{{ item.title }}</p>
                <p class="text-xs opacity-80">{{ item.author }}</p>
                <div class="flex items-center gap-2 text-xs opacity-85">
                  <img
                    :src="item.urls?.small"
                    :alt="item.title"
                    class="w-6 h-6 object-cover rounded-full"
                  />
                  <span class="flex-1 truncate">{{ item.author }}</span>
                  <span class="flex items-center gap-1"><Good size="14" /> 79</span>
                </div>
              </div>
            </div>
          </wc-waterfall>
        </div>
        <div v-if="hasMore" class="w-full p-4 box-border text-center text-gray-600">
          <div v-if="!isPullUpLoad">
            <span>上划加载更多</span>
          </div>
          <div v-else>
            <span>加载中...</span>
          </div>
        </div>
        <div v-else class="text-center text-gray-400 py-8">暂无内容</div>
      </div>
    </div>
    <div v-show="activeTab != 1" class="h-[calc(100vh-7rem)] relative px-1">
      {{ tabs[activeTab].name }}...
    </div>
    <ul class="px-4 h-16 w-full flex justify-between items-center">
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
        <span><component :is="item.icon" size="24" /></span>
        <span class="text-xs">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
