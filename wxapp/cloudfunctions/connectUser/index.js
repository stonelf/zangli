// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database(),
connectCollection = db.collection('connect');

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var cmd = event.cmd;
  if(cmd == "add"){
    var id=event.app+"-"+event.appUser;
    var data = {
      _id : id,
      openId : wxContext.OPENID,
      app:event.app,
      appUser:event.appUser
    }
    try{
      return await connectCollection.add({data:data});
    }catch(e){
      if(-502001 == e.errCode){
        console.log("用户已绑定")
        return (await connectCollection.doc(id).get()).data;
      }else{
        
      };
    }
  }else if(cmd == "disconnect"){
    var id=event.app+"-"+event.appUser;
    try{
      return await connectCollection.doc(id).remove()
    }catch(e){
      return e;
    }
  }else if(cmd == "query"){
    var id=event.app+"-"+event.appUser;
    return (await connectCollection.where({_id:id}).count()).total;
  }else{
    return "指令"+cmd+"未实现"
  }

 
}