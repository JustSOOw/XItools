const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// 保持对window对象的全局引用，避免JavaScript对象被垃圾回收时，窗口被自动关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true, // 启用Node.js集成
      contextIsolation: false,
    },
    // 设置应用图标
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // 加载应用
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // 打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口关闭时调用的函数
  mainWindow.on('closed', () => {
    // 取消引用window对象，通常会把多个window对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素
    mainWindow = null;
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，除非用户用Cmd + Q确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
}); 