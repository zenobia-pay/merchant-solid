import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

interface KVNamespace {
  get(key: string, options?: any): Promise<any>;
  put(key: string, value: any, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface Env {
  __STATIC_CONTENT: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: { waitUntil(promise: Promise<any>): void }
  ): Promise<Response> {
    try {
      // Get the asset from KV
      const url = new URL(request.url);
      const response = await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
      });

      // If the URL doesn't have a file extension, serve the index.html (SPA fallback)
      if (!url.pathname.includes(".")) {
        const indexResponse = await getAssetFromKV({
          request: new Request(`${url.origin}/index.html`, request),
          waitUntil: ctx.waitUntil.bind(ctx),
        });
        return indexResponse;
      }

      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};
