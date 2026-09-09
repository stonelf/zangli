const {
  temId,
  tag,
  page,
  requestApi,
} = require('../../config');
Component({
  properties: {

    // 是否开启签到
    signInStart: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialogInfo: '', // 弹层标记
    dialogStatus: false, // 普通中奖弹层
    // prizeData: [], // 供抽奖的奖品

    signInTimes: [], // 签到完整天数
    heartenMsg: '', // 鼓励提示
    heartenInfo: {
      day: '',
      name: '',
      type: '',
    }, // 鼓励原子信息
    winPrizeDialog: false, // 抽奖弹层
    flag: false, // 立即抽奖 点击控制
    num: 0, // 当前选中哪个奖品样式
    wonCon: '', // 获奖的内容提示
    extraPrizeId: '', // 额外奖品记录id
    htmlContent: '', // 富文件规则内容
    halfDialog: false,
    // clockN

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** 关闭弹窗 */
    closesignInDialog() {
      if (!this.data.flag) {
        this.setData({
          dialogStatus: false,
          winPrizeDialog: false,
        });
      }
    },
    /** 响应抽奖点击动作 */
    async startPrize() {
      if (!this.data.flag) {
        this.setData({
          flag: true,

        });
        const objPrize = await this.getDoPrize();
        if (Object.values(objPrize).length > 0) {
          await this.PrizeAnimation(objPrize);
        }
      }
    },

    /**
     * 抽奖的动画效果, 真实中奖是由后台传递给小程序端的
     * 小程序端的只是一个动画效果
     * @param { object } objPirze - 中奖的奖品
     **/
    async PrizeAnimation(objPirze) {
      // 取20到35的整数值
      const initial = Math.floor(Math.random() * (35 - 20) + 20);
      // 去除选中样式
      const that = this;
      let x = 0;
      // position用于定位每一个抽奖格;
      const position = [0, 1, 2, 4, 5, 8, 7, 6, 3];
      const currentNum = initial % 9;
      for (let i = 0; i < initial; i++) {
        // eslint-disable-next-line no-loop-func
        setTimeout(() => {
          const item = x % 9;
          that.setData({
            num: position[item],
          });
          x = x + 1;
          if (x === initial) { // 到结尾了，设置中奖的奖品,中奖的是第几个
            that.setData({
              num: that.countPrizeGoods(objPirze),
            });
            setTimeout(() => {
              // 弹出中奖提醒
              const wonCon = objPirze.name ? `抽中${objPirze.name}${objPirze.desc ? `(${objPirze.desc})` : ''}` : '未抽中';
              that.setData({
                flag: false,
                winPrizeDialog: true,
                dialogStatus: false,
                notice: '中奖啦',
                type: objPirze.type,
                path: objPirze.path,
                wonCon,
              });
            }, 10);
          }
        }, i * 150);
      }
    },

    /**
     * 计算中了第几个奖品
     * @param { object } objPirze - 中奖的奖品
     * @returns { number } 返回第几个奖品中奖，0代表第1个
     **/
    async countPrizeGoods(objPirze) {
      return objPirze.index;
    },

    /** 获取完整的签到周期 */
    async getSignInList(isRe = 0) {
      const {
        code,
        msg,
        result,
      } = await requestApi('getSignInList', {
        tag,
      });
      if (code !== 0) {
        throw msg;
      }
      const leftRpx = {
        '3': 6,
        '4': -2,
        '5': -15,
        '6': -16,
        '7': -24
      }
      const arrSignInTimes = [];
      let clockNum = 0;
      let extraDesc = '';
      let descLeft = 0;
      result.forEach((objSignInList) => {
        let status = objSignInList.isSignIn === 1 ? 'activated-star' : 'inactivated-star';
        let iconType = 'star';
        if (objSignInList.extraPrize.length > 0) {
          for (const key of objSignInList.extraPrize) {
            if (key.type !== 'noPrize') {
              extraDesc = `抽${key.name}`;
              break;
            }
            extraDesc = `无奖励`;
          }
          iconType = 'gift';
          status = objSignInList.isSignIn === 1 ? 'activated-gift' : 'inactivated-gift';

          descLeft = leftRpx[String(extraDesc.length)] || -40;
        }
        console.log('extraDesc', extraDesc)
        if (objSignInList.isSignIn === 1) {
          clockNum = clockNum + 1;
        }
        arrSignInTimes.push({
          id: objSignInList.day,
          // id: 2,
          days: `${objSignInList.day}天`,
          // days: '2天',
          iconType,
          extraDesc,
          status,
          descLeft
        });

      });
      if (isRe) {
        return {
          signInTimes: arrSignInTimes,
          clockNum,
        };
      }
      this.setData({
        signInTimes: arrSignInTimes,
        clockNum,
      });
    },

    /** 执行签到 */
    async doSignIn() {
      const {
        code,
        msg,
        result,
      } = await requestApi('doSignIn', {
        tag,
      });
      if (code !== 0) {
        if (code === 5001) {
          wx.showToast({
            title: msg,
          });
        } else {
          wx.showModal({
            title: '提示',
            content: msg,
          });
        }
      } else {
        if (result.type === 'noPrize' && result.extraType === 'noPrize') {
          return true;
        }
        // 弹出签到提醒框, 分额外奖励与积分奖励
        if (result.extraType === 'prizeChance' && result.extraPrize.length > 0) { // 有额外奖励
          const prizeData = [];
          result.extraPrize.forEach((objextraPrize, index) => {
            let newIndex = index;
            if (index === 4) {
              newIndex = newIndex + 1;
              prizeData.push({ // 插入抽奖按钮
                id: 'prize',
                index,
                text: '立即抽奖',
              });
            } else if (index > 4) {
              newIndex = newIndex + 1;
            }
            prizeData.push({
              index: newIndex,
              id: objextraPrize.type === 'integral' ? objextraPrize.faceValue : objextraPrize._id,
              text: objextraPrize.name,
              isIntegral: objextraPrize.type === 'integral',
              path: objextraPrize.path,
              desc: objextraPrize.desc
            });
          });
          this.setData({
            dialogStatus: true,
            dialogInfo: 'activated-gift',
            desc: result.prize.desc,
            prizeData,
            heartenMsg: this.data.heartenMsg,
            extraPrizeId: result.extraPrizeId,
          });
        } else { // 只奖励积分
          this.setData({
            dialogStatus: true,
            dialogInfo: 'activated-star',
            desc: result.prize.desc,
            heartenMsg: this.data.heartenMsg,
          });
        }
      }
    },

    /** 获取鼓励提示信息 */
    async getRemindMsg() {
      const objRemindMsg = await requestApi('getRemindMsg', {
        tag,
      });
      this.data.heartenMsg = (objRemindMsg.result && objRemindMsg.result.heartenMsg) ? objRemindMsg.result.heartenMsg : '';
      this.data.heartenInfo = objRemindMsg.result;
      return [objRemindMsg];
    },

    /** 获取他人获奖消息 */
    async getOtherMsg() {
      const objOtherMsg = await requestApi('getOtherMsg');
      return objOtherMsg;
    },

    /** 抽奖，后台返回中奖的奖品 */
    async getDoPrize() {
      const {
        code,
        msg,
        result,
      } = await requestApi('doPrize', {
        id: this.data.extraPrizeId,
      });
      if (code !== 0) {
        const wonCon = msg;
        this.setData({
          flag: false,
          winPrizeDialog: true,
          dialogStatus: false,
          wonCon,
          notice: '没抽中',
        });
        return false;
      }
      return result;
    },

    /** 设置明天提醒 */
    async setRemind() {
      const objOtherMsg = await requestApi('setRemind', {
        temId,
        page,
      });
      return objOtherMsg;
    },
    /** 订阅明天提醒 */
    subscription() {
      const that = this;
      this.closesignInDialog();
      wx.requestSubscribeMessage({
        tmplIds: [temId],
        success(res) {
          if (res[temId] === 'accept') {
            that.setRemind();
          }

        },
        fail(err) {
          wx.showToast({
            title: `订阅失败\r\n请检查模板id`,
            icon: 'none',
            duration: 2000
          })
        },
      });
    },
    /** 获取签到说明规则 */
    async getSignInRule() {
      const objSignInRule = await requestApi('getSignInRule');
      this.setData({
        htmlContent: objSignInRule.result.rule,
        halfDialog: true,
      });
    },
    doCloseHalfDialog() {
      this.setData({
        halfDialog: false,
      });
    },
  },

  lifetimes: {
    async attached() {
      try {
        await this.getSignInList();
        await this.doSignIn();
        // 同时获取 信息，重新渲染
        const p1 = new Promise((resolve) => {
          const list = this.getSignInList(1);
          resolve(list);
        });
        const p2 = new Promise((resolve) => {
          const msg = this.getOtherMsg();
          resolve(msg);
        });
        const p3 = new Promise((resolve) => {
          const msg = this.getRemindMsg();
          resolve(msg);
        });
        Promise.all([p1, p2, p3]).then((res) => {
          const {
            clockNum,
          } = res[0];
          const {
            signInTimes,
          } = res[0];
          const sucMsg = res[1].result.length > 0 ? res[1].result : ['os*****连续签到2天获得100积分'];
          const heartenInfo = res[2][0].result;
          this.setData({
            clockNum,
            signInTimes,
            sucMsg,
            heartenInfo,
          });
        })
          .catch((e) => {
            throw e;
          });
      } catch (e) {
        console.log('出错误了', e);
      }
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

});
