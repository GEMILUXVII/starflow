import { ProxyAgent, setGlobalDispatcher } from "undici";

export async function register() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    const proxyAgent = new ProxyAgent(proxyUrl);
    setGlobalDispatcher(proxyAgent);
    console.log("Proxy configured:", proxyUrl);
  }
}
