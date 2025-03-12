/*
 * @Author: kasuie
 * @Date: 2025-02-23 10:38:53
 * @LastEditors: kasuie
 * @LastEditTime: 2025-02-23 11:25:24
 * @Description:
 */
import { defineComponent } from "vue";
import { ConfigProvider, StyleProvider } from "ant-design-vue";

export default defineComponent({
  setup(props, { slots }) {
    return () => (
      // <a-extract-style>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#00b96b",
          },
        }}
      >
        <StyleProvider hash-priority="high">{slots.default?.()}</StyleProvider>
      </ConfigProvider>
      // </a-extract-style>
    );
  },
});
