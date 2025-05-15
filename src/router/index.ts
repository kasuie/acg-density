/*
 * @Author: kasuie
 * @Date: 2025-02-24 09:15:18
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-15 15:02:27
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";
import AnimationScreenshot from "../views/AnimationScreenshot.vue";
import MetaApp from "@/views/MetaApp.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: AnimationScreenshot,
    },
    {
      path: "/metaApp",
      name: "metaApp",
      component: MetaApp,
    },
  ],
});

export default router;
