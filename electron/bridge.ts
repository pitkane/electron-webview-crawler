import { contextBridge, ipcRenderer } from 'electron'

// import { magicWindow } from './main'

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  sendMessage: (message: object) => {
    ipcRenderer.send('message', message)
  },

  test: () => {
    console.log('moro')
    // console.log(magicWindow?.isFullScreen())
    console.log('moro')
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Main', api)
