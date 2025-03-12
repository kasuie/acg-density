/*
 * @Author: kasuie
 * @Date: 2025-03-04 14:24:35
 * @LastEditors: kasuie
 * @LastEditTime: 2025-03-04 16:37:19
 * @Description:
 */
import { defineComponent } from "vue";

export default defineComponent({
  setup(props, { slots }) {
    const data = [
      {
        url: "https://github.com/kasuie/acg-density",
        text: "Github",
      },
      {
        url: "https://kasuie.cc",
        text: "Blog",
      },
    ];
    return () => (
      <main class="flex flex-col items-center h-screen bg-test">
        <div class="flex-1 w-full">{slots.default?.()}</div>
        <footer class="flex flex-col text-sm items-center justify-center w-full py-1 pb-2">
          <p class="flex items-center justify-center">
            {data.map((item, i: number) => {
              return (
                <>
                  <a href={item.url} target="_blank" class={"text-blue-400"}>
                    {item.text}
                  </a>
                  <i
                    v-show={i != data.length - 1}
                    class="before:p-1 before:content-['•'] befoce:font-semibold opacity-40"
                  ></i>
                </>
              );
            })}
          </p>
        </footer>
      </main>
    );
  },
});
