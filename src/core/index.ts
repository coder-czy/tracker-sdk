import {
  DefaultOptions,
  Options,
  TrackerConfig,
  reportTrackerData,
} from '../type/index'
import { createHistoryEvent } from '../utils/pv'

const MouseEventList: string[] = [
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseout',
  'mouseover',
]

export default class Tracker {
  public data: Options
  constructor(options: Options) {
    this.data = Object.assign(this.initDef(), options)
    this.installTracker()
  }

  private initDef(): DefaultOptions {
    window.history['pushState'] = createHistoryEvent('pushState')
    window.history['replaceState'] = createHistoryEvent('replaceState')
    return <DefaultOptions>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    }
  }

  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid
  }

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra
  }

  public sendTracker<T extends reportTrackerData>(data: T) {
    this.reportTracker(data)
  }

  private captureEvent<T>(
    mouseEventList: string[],
    targetKey: string,
    data?: T
  ) {
    mouseEventList.forEach((event) => {
      window.addEventListener(event, () => {
        this.reportTracker({ event, targetKey, data })
      })
    })
  }

  private installTracker() {
    if (this.data.historyTracker) {
      this.captureEvent(['pushState', 'replaceState', 'popstate'], 'history-pv')
    }
    if (this.data.hashTracker) {
      this.captureEvent(['hashchange'], 'hash-pv')
    }
    if (this.data.domTracker) {
      this.domTracker()
    }
    if (this.data.jsError) {
      this.errorEvent()
      this.promiseReject()
    }
  }

  //dom点击上报
  private domTracker() {
    MouseEventList.forEach((event) => {
      window.addEventListener(event, (e) => {
        const target = e.target as HTMLElement
        const targetValue = target.getAttribute('target-key')
        if (targetValue) {
          this.sendTracker({
            targetKey: targetValue,
            event,
          })
        }
      })
    })
  }

  //捕获js报错
  private errorEvent() {
    window.addEventListener('error', (event) => {
      this.sendTracker({
        targetKey: 'message',
        event: 'error',
        message: event.message,
      })
    })
  }
  //捕获promise 错误
  private promiseReject() {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch((error) => {
        this.sendTracker({
          targetKey: 'message',
          event: 'promise',
          message: error,
        })
      })
    })
  }
  //上报
  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: Date.now() })
    let headers = {
      type: 'application/x-www-form-urlencoded',
    }
    let blob = new Blob([JSON.stringify(params)], headers)
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}
