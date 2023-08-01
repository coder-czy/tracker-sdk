# 前端埋点 SDK

## 参数

| 参数           | 是否必传 | 描述                          |
| -------------- | -------- | ----------------------------- |
| requestUrl     | 是       | 接口地址                      |
| historyTracker | 否       | history 上报                  |
| hashTracker    | 否       | hash 上报                     |
| domTracker     | 否       | 携带 tracker-key 点击事件上报 |
| sdkVersionsdk  | 否       | 版本                          |
| extra          | 否       | 透传字段                      |
| jsError        | 否       | js 和 promise 报错异常上报    |

## 方法

| 参数        | 描述            | 参数                     |
| ----------- | --------------- | ------------------------ |
| setUserId   | 修改上报的 uuid | uuid                     |
| setExtra    | 上报的额外信息  | any                      |
| sendTracker | 手动上报方法    | {event,targetKey,...any} |

## 案例

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <body>
    <script src="./dist/index.js"></script>
    <script>
      new tracker({
        historyTracker: true,
        hashTracker: true,
        domTracker: true,
        jsError: true,
        requestUrl: 'https://mock.apifox.cn/m1/420596-0-default/tracker',
      })
    </script>
    <button target-key="test">含有埋点</button>
    <button>没有埋点</button>
  </body>
</html>
```

## 注意事项

- dom 埋点上传需在元素上添加 `tracker-key` 属性
- 埋点上报采用 `navigator.sendBeacon`，这个上报的机制 跟 `XMLHttpRequest` 对比 `navigator.sendBeacon` 即使页面关闭了 也会完成请求 而 `XMLHttpRequest` 不一定，`navigator.sendBeacon` 只支持 `post` 并且传输的数据格式为 `blob`
