/*
 * @Author: kasuie
 * @Date: 2025-03-03 14:48:49
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-03 15:11:45
 * @Description:
 */
import { computed, defineComponent, useAttrs } from "vue";
import { ref } from "vue";

export default defineComponent({
  props: {
    src: {
      type: String,
    },
    alt: {
      type: String,
    },
  },
  setup(props, {}) {
    const attrs = useAttrs(); // 获取未声明的属性
    const imageSrc = computed(() => (props.src || "") as string);
    const loading = ref(true);

    const onLoadstart = () => {
      loading.value = true;
      console.log(333);
    };

    const onLoad = () => {
      loading.value = false;
      console.log(1111);
    };

    const onError = () => {
      loading.value = false;
      console.log(2222);
    };

    return () => (
      <div class="w-full h-full max-w-full max-h-full relative">
        <svg
          v-show={loading.value}
          class="skeleton"
          width="100%"
          height="100%"
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
          src={imageSrc.value}
          onLoadstart={onLoadstart}
          onLoad={onLoad}
          onError={onError}
          {...attrs}
        />
      </div>
    );
  },
});
