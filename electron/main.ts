import { app, BrowserWindow, ipcMain } from 'electron'
import { includes } from 'lodash'
import * as queryString from 'query-string'
import { URL } from 'url'
import WebSocket from 'ws'

export let mainWindow: BrowserWindow | null
export let magicWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

let sessionId: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      devTools: true, // false if you want to remove dev tools access for the user
      nodeIntegration: true,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,

      webviewTag: true, // https://www.electronjs.org/docs/api/webview-tag,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const registerListeners = () => {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on('message', async (_, message) => {
    console.log(message)

    switch (message.type) {
      case 'NEW_WINDOW':
        magicWindow = new BrowserWindow({
          // icon: path.join(assetsPath, 'assets', 'icon.png'),
          width: 1600,
          height: 1200,
          backgroundColor: '#191622',
          webPreferences: {
            devTools: true, // false if you want to remove dev tools access for the user
            nodeIntegration: true,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,

            webSecurity: false,
            webviewTag: true, // https://www.electronjs.org/docs/api/webview-tag,
          },
        })

        magicWindow.loadURL('https://google.com')
        magicWindow.webContents.openDevTools({ mode: 'detach' })

        magicWindow.webContents.session.webRequest.onCompleted({ urls: ['*://*/*'] }, (details: any) => {
          console.log(details)
          if (includes(details.url, 'manifest-ws.json')) {
            const url = details.url

            const fullToken = queryString.parseUrl(url)
            const videoSessionId = fullToken.query.videoSessionId as string
            sessionId = videoSessionId.split('-')[1]
          }
        })

        break
      case 'GET_SOURCE_CODE':
        // console.log(magicWindow?.webContents.getURL())

        const wsUrl = new URL('wss://')
        wsUrl.searchParams.set('EVOSESSIONID', sessionId)

        const finalWsUrl = wsUrl.toString()

        const connection = new WebSocket(finalWsUrl)

        connection.on('message', function incoming(data: any) {
          console.log(data)
        })

      // try {
      //   await magicWindow?.webContents.savePage('/tmp/1.html', 'HTMLComplete')
      //   console.log('success 1')
      // } catch (error) {
      //   console.log(error)
      // }

      // try {
      //   await magicWindow?.webContents.savePage('/tmp/2.html', 'HTMLOnly')
      //   console.log('success 2')
      // } catch (error) {
      //   console.log(error)
      // }

      // try {
      //   await magicWindow?.webContents.savePage('/tmp/3.html', 'MHTML')
      //   console.log('success 3')
      // } catch (error) {
      //   console.log(error)
      // }

      // console.log(
      //   magicWindow?.webContents.executeJavaScript(`
      // ipcRenderer.send('message', document.body.innerHTML);
      // `)

      // magicWindow?.focus()
      // sleep(1000)

      // console.log('mouseDown')

      // magicWindow?.webContents.sendInputEvent({
      //   type: 'mouseDown',
      //   x: 1250,
      //   y: 1025,
      //   globalX: 1250,
      //   globalY: 1025,
      // })

      // sleep(20)

      // console.log('mouseUp')
      // magicWindow?.webContents.sendInputEvent({
      //   type: 'mouseUp',
      //   x: 1250,
      //   y: 1025,
      //   globalX: 1250,
      //   globalY: 1025,
      // })

      // magicWindow?.webContents
      //   .executeJavaScript(
      //     `
      //     function sleep(ms) {
      //       return new Promise(resolve => setTimeout(resolve, ms));
      //     };

      //     async function gogogo() {
      //       document.querySelectorAll('[data-role=triangle-button')[0].click();
      //       await sleep(2000);
      //       document.querySelectorAll('[data-role=paginator-item-numbers')[0].click();
      //       await sleep(2000);
      //       document.querySelector("div.numbers--2XuwX.statistics--3gy21.fadeable--1kZDu");
      //       console.log("done")
      //     }

      //     gogogo()
      //     `
      //   )
      //   .then((result) => {
      //     console.log(result)

      //     const $ = cheerio.load(result)
      //     console.log($.html())
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })
    }
  })
}

app
  .on('ready', createMainWindow)
  .whenReady()
  .then(() => {
    registerListeners()
    mainWindow?.webContents.openDevTools()
  })
  .catch((e) => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})
