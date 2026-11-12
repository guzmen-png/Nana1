import { app, BrowserWindow, shell, systemPreferences } from "electron";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import waitOn from "wait-on";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

let mainWindow = null;
let nextProcess = null;

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

async function ensureMacMediaAccess() {
  if (process.platform !== "darwin") return;
  try {
    const cam = systemPreferences.getMediaAccessStatus("camera");
    if (cam !== "granted") {
      await systemPreferences.askForMediaAccess("camera");
    }
  } catch {
    // older Electron / unsupported — file picker still works
  }
}

function startNextServer(port) {
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  nextProcess = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      ELECTRON_RUN: "1",
    },
    stdio: "inherit",
  });
  nextProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`next start exited with code ${code}`);
    }
  });
}

async function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 430,
    height: 860,
    minWidth: 380,
    minHeight: 700,
    title: "나날",
    backgroundColor: "#D7E5EE",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: "deny" };
  });

  await mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function boot() {
  await app.whenReady();
  await ensureMacMediaAccess();

  const port = await findFreePort();
  startNextServer(port);
  const url = `http://127.0.0.1:${port}`;
  await waitOn({ resources: [url], timeout: 120000 });
  await createWindow(url);

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(url);
    }
  });
}

function shutdown() {
  if (nextProcess && !nextProcess.killed) {
    nextProcess.kill("SIGTERM");
    nextProcess = null;
  }
}

app.on("window-all-closed", () => {
  shutdown();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", shutdown);

boot().catch((error) => {
  console.error(error);
  shutdown();
  app.quit();
});
