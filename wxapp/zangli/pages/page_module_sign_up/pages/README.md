# 签到打卡 抽奖功能模块说明
- 
## 开放的接口
| 接口名称 | 接口标识 |  
| :----| :---- | 
| 发放奖品 |  sendPrize | 
| 发放积分 |   sendFaceValue | 
## 开放的组件

## 开放的页面

## 表结构设计说明

用户签到记录表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :---- | :----|
| openId |  openId |  string | 小程序 openid |
| 第几天 |  day |  number | eg:1 代表第一天，2代表第二天 |
| 签到时间 |   updatedAt |  int | 时间戳 |
| 是否连续签到 |   isContinuous |  bool | true是连续，false不连续 |

签到奖励配置表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :---- | :----|
| 项目标记 |  tag |  string | 项目唯一标记 |
| 连续几天 |  day |  number | eg:1 代表1天，2代表2天 |
| 常规奖励类型 |  type |  string | 取值：(integral)积分，(virtualGoods)虚拟物品，(goods)实物, (noPrize)无奖励 |
| 常规奖品对象 |  prize | object | 奖品表一条记录对象 |

额外奖励配置表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :---- | :----|
| 记录 ID |  _id |  string | 记录 ID |
| 项目标记 |  tag |  string | 项目唯一标记 |
| 连续几天 |  day |  number | eg:1 代表连续1天，2代表连续2天 |
| 奖励类型 |  type |  string | 取值：(integral)积分，(virtualGoods)虚拟物品，(goods)实物, (noPrize)无奖励 , prizeChange奖励机会 |
| 奖品对象 |  prize | object | 奖品表一条记录对象，如果是奖励机会，则这里存储整个 |

签到规则项目表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :----| :----|
| 项目名 | name |  string | eg: 连续七天签到 |
| 是否开启 |  isOpen | number | 1开启，0不开启|
| 项目标记 |  tag |  string | 项目唯一标记 |

奖品表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :----| :----|
| 奖品id | _id |  string | 奖品 ID |
| 奖品名 | name |  string | eg: 满100减10券 |
| 奖品描述 |  desc |  string | eg:100元红包 |
| 奖励类型 |  type |  string | 取值：(integral)积分，(virtualGoods)虚拟物品，(goods)实物, (noPrize)无奖励 |
| 奖品唯一标记 |  tag |  string | 奖品唯一标记 |
| 奖品总数量 |   nums |  number | 奖品总数量 |
| 奖品剩余量 |   surplusNums |  number | 奖品剩余量 |
| 奖品图片 |    path |  string | 奖品展示图片地址 |
| 奖品是否有效 | isValid |  bool | true有效，false无效 |
| 奖品面值 | faceValue |  number | 比如是积分，10代表10个积分，比如是满减券，比如100，则代表100元 |

中奖记录表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :---- | :----|
| 奖品对象 | prize |  object | 奖品表一条记录对象 |
| openId |  openId |  string | 小程序 openid |
| 奖励时间 |   createTime |  int | 时间戳 |
| 类型 |    type |  number | 1额外奖励，2签到奖励，3抽奖奖励 |
| 奖励描述 |  desc |  string | 奖励简单描述 |
| 连续签到天数 | day |  number | 连续签到几天所获的奖励 |

抽奖机会记录表
| 字段名 | 英文字段 |  数据类型 | 备注 |
| :----| :---- | :---- | :----|
| openId |  openId |  string | 小程序 openid |
| 抽奖机会数 |   nums |  int | 抽奖机会数 |

## C 端接口
| 接口名称 | 接口标识 |  
| :----| :---- | 
| 发送提醒通知 |  doRemind | 
| 设置明天提醒 |   setRemind | 
| 获取完整的签到周期 |  getSignInList | 
| 获取他人获奖消息 |   getOtherMsg | 
| 获取鼓励提示 |  getRemindMsg | 
| 签到 |   doSignIn | 
| 抽奖 |  doPrize | 
| 获取签到规则 |   getSignInRule | 