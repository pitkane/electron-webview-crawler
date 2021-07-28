import { WebviewTag } from 'electron'

export const getWebview = (): WebviewTag => {
  const webview = document.getElementsByTagName('webview')[0] as WebviewTag
  return webview
}

export const requestWebviewSource = async (): Promise<any> => {
  const webview = getWebview()

  return new Promise((resolve, reject) => {
    try {
      webview
        .executeJavaScript(
          `
	      document.getElementsByTagName('html')[0].innerHTML`
        )
        .then((result) => {
          resolve(result)
        })
    } catch (error) {
      reject(error)
    }
  })
}
