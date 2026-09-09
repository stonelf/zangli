# 场景模块小程序开发

该文件夹目录，代表是一个完整的『签到打卡』场景功能模块的代码，在安装完后，使用时，需要注意几个点

需要修改 config.js 文件，修改几项配置方可完整跑起来

config.js 几个变量的配置说明：

```javascript
temId: 该订阅提醒模板 ID，需要登录当前小程序的 mp 管理系统，进入 <https://mp.weixin.qq.com/>

在订阅消息模板中搜索"签到提醒"模板，然后点击选用, 详细内容配置如下效果：
温馨提示：{{thing2.DATA}}
签到奖励：{{thing1.DATA}}
活动名称：{{thing3.DATA}}
模板内容设置: 消息模板内容在自定义创建的云函数中 page_module_tcb_sign_up/api/sendmsg 中设置。

tag:表示当前选用模板id 签到固定为continuous-weekly

page: 即使用者订阅后，会收到一个服务通知消息，提醒签到打卡，然后点击这条消息，需要跳转到的小程序页面，这里根据自己页面路径自由配置。比如 pages/index/card

```

## 目录结构

- 目前三个重要的文件夹，components,pages,images
- 每个功能模块组成的文件分布在这三个文件夹里，用一个子文件夹装载
- 在 components/ 存储所有签到的组件模块
- 在 pages/ 下存放签到页面入口
- 在每个功能模块下必须放置一个 readme.md 文件，说明此模块的使用方式及开放的接口
- 在 images/ 下存放所有的签到相关的图片
