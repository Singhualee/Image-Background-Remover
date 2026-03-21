import { onRequestPost as __api_remove_bg_ts_onRequestPost } from "E:\\code2026\\Image-Background-Remover\\Image-Background-Remover\\functions\\api\\remove-bg.ts"

export const routes = [
    {
      routePath: "/api/remove-bg",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_remove_bg_ts_onRequestPost],
    },
  ]