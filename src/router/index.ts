/*
 * @Author: kasuie
 * @Date: 2025-02-24 09:15:18
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-12 17:01:58
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";
import AnimationScreenshot from "../views/AnimationScreenshot.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: AnimationScreenshot,
    },
  ],
});

export default router;
