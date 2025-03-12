/*
 * @Author: kasuie
 * @Date: 2025-02-24 09:54:42
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-10 21:16:11
 * @Description:
 */
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { clsx, getRandomElements, shuffleArray, storage } from "@kasuie/utils";
import CusImage from "./CusImage";

export default defineComponent({
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
    totalTimer: {
      type: Number,
      default: 60,
    },
  },
  components: {
    CusImage,
  },
  setup(props, { emit }) {
    const activeIndex = ref<number>(0);
    const reply = ref<string>();
    const status = ref<string>("none"); // waiting, correct, error
    const historyData = ref<Array<Record<string, unknown>>>([]);
    const loading = ref(true);
    const startTime = ref(performance.now());
    const elapsed = ref(0);
    const count = ref(0);
    const loadingTime = ref(0);
    const loadingStartTime = ref(0);
    let frameId: number;

    watch(
      loading,
      (val) => {
        if (val) {
          loadingStartTime.value = performance.now();
        } else {
          loadingTime.value += performance.now() - loadingStartTime.value;
        }
      },
      {
        immediate: true,
      }
    );

    const active = computed(() => (props.data[activeIndex.value] || {}) as Record<string, unknown>);
    const options = computed(
      () => onGetOptions(active.value) as Array<Record<string, unknown> | string | unknown>
    );
    const image = computed(() => onGetImage(active.value) as string);
    const percent = computed(() => {
      return (
        (Math.max(props.totalTimer - elapsed.value / 1000, 0) * 100) /
        props.totalTimer
      ).toFixed(1);
    });

    const flxImage = ({ image, imgSource }: Record<string, unknown>) => {
      if (imgSource === 10) {
        return `https://image.anitabi.cn/${image}?plan=h360`;
      } else if (imgSource === 0) {
        return `https://cs.kasuie.cc/${image}`;
      } else {
        return "";
      }
    };

    const onGetOptions = (
      curr: Record<string, unknown>
    ): Array<Record<string, unknown> | string | unknown> => {
      return shuffleArray(
        getRandomElements(
          (props.options as Array<Record<string, unknown>>)
            .map((v) => v.label)
            .filter((v) => v != curr.label) as Array<string>,
          3
        ).concat(curr.label as string)
      );
    };

    const onGetImage = (curr: Record<string, unknown>): string => {
      return flxImage(
        getRandomElements(curr.items as Array<Record<string, unknown>>, 1)?.[0] as Record<
          string,
          unknown
        >
      );
    };

    const onSelect = (select: string) => {
      if (status.value !== "none" || loading.value) return;
      status.value = select === active.value.label ? "correct" : "error";
      historyData.value.unshift({
        ...active.value,
        index: activeIndex.value,
        answer: active.value.label,
        reply: select,
        correct: select === active.value.label,
        time: new Date().getTime(),
      });
      reply.value = select;
      if (select === active.value.label) {
        count.value += 10;
      } else {
        count.value = Math.max(count.value - 5, 0);
      }
      loading.value = true;
      setTimeout(() => {
        status.value = "none";
        reply.value = "";
        ++activeIndex.value;
      }, 800);
    };

    const update = () => {
      const now = performance.now();
      const plusTime = loading.value ? now - loadingStartTime.value : 0;
      elapsed.value = now - startTime.value - plusTime - loadingTime.value;
      if (+percent.value <= 0) {
        cancelAnimationFrame(frameId);
        emit("onResult", count.value, historyData.value);
      } else {
        frameId = requestAnimationFrame(update);
      }
    };

    onMounted(() => {
      startTime.value = performance.now();
      update();
    });

    onUnmounted(() => {
      cancelAnimationFrame(frameId);
    });

    const onClick = () => {
      let nowTheme = null;
      const theme = storage.l.get("theme");
      if (theme === "light" || theme === "dark") {
        // 用户显式选择了 light 或 dark 模式，更新 localStorage
        nowTheme = theme === "light" ? "dark" : "light";
        storage.l.set("theme", nowTheme);
      } else {
        // 用户选择了系统偏好，移除 localStorage 中的主题设置
        nowTheme = "light";
        storage.l.set("theme", "light");
      }
      console.log(nowTheme, theme, "nowTheme>>>>");
      console.log(window.matchMedia("(prefers-color-scheme: dark)"), "dark>>>>");

      // 根据 localStorage 或系统偏好来切换主题
      document.documentElement.classList.toggle(
        "dark",
        nowTheme === "dark" ||
          (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
      document.documentElement.classList.toggle(
        "light",
        nowTheme === "light" ||
          (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    };

    const onLoad = () => {
      loading.value = false;
    };

    const onError = () => {
      loading.value = false;
    };

    const renderSwitch = (condion: boolean, classs: Array<string> = ["", "", ""]) => {
      const commonClass =
        "absolute w-full h-40 -top-8 left-0 transform scale-x-0 transition-transform";
      const span1Class = `${commonClass} ${classs[0]}`;
      const span2Class = `${commonClass} ${classs[1]}`;
      const span3Class = `${commonClass} ${classs[2]}`;
      return (
        <>
          <span
            class={clsx(span1Class, {
              "scale-x-110 duration-300": condion,
            })}
          ></span>
          <span
            class={clsx(span2Class, {
              "scale-x-110 duration-500": condion,
            })}
          ></span>
          <span
            class={clsx(span3Class, {
              "scale-x-110 duration-800": condion,
            })}
          ></span>
        </>
      );
    };

    return () => (
      <div class={"flex flex-col gap-2 items-center w-full pt-4 relative"}>
        <h1 class={"text-2xl md:py-0 py-2"} onClick={() => onClick()}>
          截图猜动画
        </h1>
        <a-progress
          type="circle"
          stroke-color={{
            "0%": "#108ee9",
            "100%": "#87d068",
          }}
          class="absolute top-2 right-2 md:top-4 md:right-8"
          size="small"
          format={(percent: number) => `${Math.floor((percent * props.totalTimer) / 100)}s`}
          percent={+percent.value}
        />
        <div class={"w-[95%] h-[300px] md:w-[500px] md:h-[350px] flex items-center justify-center"}>
          <svg
            v-show={loading.value}
            class="skeleton rounded-xl"
            width="90%"
            height="80%"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
          >
            <rect x="0" y="0" width="100%" height="100%" fill="#ddd">
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>

          <img
            v-show={!loading.value}
            class={"rounded-sm max-h-full"}
            src={image.value}
            onLoad={onLoad}
            onError={onError}
            alt="Anime Screenshot"
          />
        </div>
        <div class={"w-[95%] md:w-[500px] flex items-center justify-between opacity-70"}>
          <span>当前:{activeIndex.value + 1}题</span>
          <span>计分:{count.value}分</span>
        </div>
        <ul
          class={
            "w-[95%] md:w-full flex-shrink-0 overflow-hidden flex justify-center flex-col items-center gap-2"
          }
        >
          {options.value.map((v: Record<string, unknown> | unknown, index: number) => (
            <li
              class={clsx(
                "w-full md:w-72 max-w-full overflow-hidden group relative font-semibold select-none text-center truncate cursor-pointer px-8 py-1.5 bg-blue-300 text-blue-100 rounded-2xl hover:bg-blue-400 duration-300 ease-in-out"
              )}
              key={index}
              onClick={() => onSelect(v as string)}
            >
              {/* <button class="w-32 p-2 h-12 bg-black text-white border-none rounded-md text-xl font-bold cursor-pointer relative z-10 group"> */}
              {v}
              {renderSwitch(reply.value === v && status.value === "correct", [
                "bg-green-300 duration-800 origin-right rotate-12",
                "bg-green-400 duration-500 origin-right rotate-12",
                "bg-green-600 duration-300 origin-right rotate-12",
              ])}
              {renderSwitch(reply.value === v && status.value === "error", [
                "bg-red-300 duration-800 origin-left -rotate-12",
                "bg-red-400 duration-500 origin-left -rotate-12",
                "bg-red-600 duration-300 origin-left -rotate-12",
              ])}
              <span
                class={clsx(
                  "duration-100 opacity-0 flex justify-center items-center absolute z-10 left-0 top-0 w-full h-full",
                  {
                    "opacity-100 duration-1000": reply.value === v,
                  }
                )}
              >
                {`回答${status.value === "correct" ? "正确" : "错误"}`}
              </span>
              {/* </button> */}
            </li>
          ))}
        </ul>
        <ul
          class={
            "w-[95%] md:w-full flex justify-center flex-col items-center duration-300 gap-0.5 text-sm"
          }
        >
          {historyData.value.map((v: Record<string, unknown>, index: number) => {
            if (!v || index >= 5) return null;
            return (
              <li
                class={clsx("w-full md:w-72 font-semibold text-center truncate", {
                  "text-green-300": v.correct,
                  "text-red-300": !v.correct,
                  "text-gray-300": v.correct === undefined,
                })}
                key={index}
              >
                {`${v.reply}`}
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
});
