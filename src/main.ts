/*
 * @Author: kasuie
 * @Date: 2025-02-23 10:01:07
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-16 18:33:45
 * @Description:
 */
import "./assets/main.css";
import "wc-waterfall";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { Button, Progress, message } from "ant-design-vue";

const app = createApp(App);

app.use(Button);
app.use(Progress);

app.use(createPinia());
app.use(router);

app.mount("#app");

app.config.globalProperties.$message = message;
