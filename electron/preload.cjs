const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("nanalDesktop", {
  platform: process.platform,
  isMacApp: true,
});
