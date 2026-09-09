// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database(),
appCollection = db.collection('appsInfo');
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(JSON.stringify(event))
  var appId = event.appId;//wx147cadd808668707
  if(appId && appId.length==18){
    var res = await appCollection.where({appId:appId}).get();
    if(res.data.length==1){
      return res.data[0].appName;
    }else{
      console.log("app未登记")
      return "unknow_app";
    }
  }else{
    console.log("appId 不合法");
    return "invalid_appid";
  }
}