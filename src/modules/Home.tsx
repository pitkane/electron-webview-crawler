import * as cheerio from 'cheerio'

import { Button } from '../components/Button'
import { Container, Image, Text } from './Home.styles'
import { requestWebviewSource, getWebview } from '../utils/utils'
// import { magicWindow } from '../../electron/main'

const openNewWindow = () => {
  window.Main.sendMessage({ type: 'NEW_WINDOW' })
  console.log('Message sent! Check main process log in terminal.')
}

const getUrlOfNewWindow = () => {
  window.Main.sendMessage({ type: 'GET_SOURCE_CODE' })
}

const toggleWebviewDevTools = async () => {
  const webview = getWebview()
  webview.isDevToolsOpened() ? webview.closeDevTools() : webview.openDevTools()
}

const startProcessing = async () => {
  const html = await requestWebviewSource()

  const $ = cheerio.load(html)
  console.log($.html())

  // const moro = $('div[class=numbers--2XuwX]').html()
  const moro = $('div.statistics--1YYQv.number-container--2fA8h')

  const numbers = moro.map((i, element) => {
    // console.log(i, element)

    // resolve value for the first time
    const singleNumberElement = element.children[0] as cheerio.Element
    let dataRoleValue = singleNumberElement.attribs['data-role']
    dataRoleValue = dataRoleValue.replace('number-', '')

    // resolve color
    let color
    const colorClasses = singleNumberElement.attribs.class
    if (colorClasses.includes('red--nFMDg')) color = 'RED'
    else if (colorClasses.includes('black--2XLNv')) color = 'BLACK'
    else {
      color = 'GREEN'
    }

    const singleNumberValueElement = singleNumberElement.children[0] as any
    const singleNumberValue = singleNumberValueElement.children[0].data

    return { number: dataRoleValue, innerValue: singleNumberValue, color: color }
  })
  console.log(numbers)
}

export const Home = () => {
  return (
    <Container>
      <Image src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg" alt="ReactJS logo" />
      <Text>An Electron boilerplate including TypeScript, React, Jest and ESLint.</Text>
      <Button onClick={openNewWindow}>Open New Window</Button>
      <Button onClick={getUrlOfNewWindow}>getUrl</Button>
      <Button onClick={startProcessing}>Start processing</Button>
      <Button onClick={toggleWebviewDevTools}>Toggle DevTools</Button>
    </Container>
  )
}
