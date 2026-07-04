import { contextBridge, ipcRenderer } from "electron";

// レンダラープロセスに公開する最小限のAPI(Security Bible 第1章: 最小権限の原則)。
contextBridge.exposeInMainWorld("musasabi", {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("musasabi:getAppVersion"),
});
