const AUTH_BASE = 'https://syncplay.yslow.cn';
// 与后端一致：scene 字符集与长度
const TICKET_RE = /^[A-Za-z0-9!#$&'()*+,/:;=?@._~-]{1,32}$/;
const QR_TTL = 300;

Page({
  data: {
    phase: 'loading', // loading | authed | done | bad | error
    msg: '',
    om: '',
    isSa: false,
    nicknameInput: '',
    count: QR_TTL,
    canConfirm: false
  },

  onNickInput(e) { this.setData({ nicknameInput: e.detail.value || '' }); },

  ticket: '',
  mToken: '',
  timer: null,

  onLoad(options) {
    const scene = (options && options.scene) || '';
    let ticket = '';
    try { ticket = decodeURIComponent(scene); } catch (e) { ticket = scene; }
    if (!ticket || !TICKET_RE.test(ticket)) {
      this.setData({ phase: 'bad' });
      return;
    }
    this.ticket = ticket;
    this.startCountdown();
    this.doWxLogin();
  },

  onUnload() { this.stopCountdown(); },

  startCountdown() {
    this.setData({ count: QR_TTL });
    this.stopCountdown();
    this.timer = setInterval(() => {
      const n = this.data.count - 1;
      if (n <= 0) {
        this.stopCountdown();
        this.setData({ phase: 'error', msg: '二维码已过期，请回到电脑端重新扫码' });
        return;
      }
      this.setData({ count: n });
    }, 1000);
  },
  stopCountdown() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },

  request(path, payload) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: AUTH_BASE + path,
        method: 'POST',
        data: payload,
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          const d = res.data || {};
          if (res.statusCode === 200 && d.ok !== false) resolve(d);
          else reject(new Error((d && d.error) || ('HTTP ' + res.statusCode)));
        },
        fail: (e) => reject(new Error(e.errMsg || '网络错误'))
      });
    });
  },

  doWxLogin() {
    wx.login({
      success: (lg) => {
        if (!lg.code) { this.setData({ phase: 'error', msg: '微信登录失败，请重试' }); return; }
        this.request('/api/auth/wx/login', { code: lg.code })
          .then((d) => {
            this.mToken = d.token;
            this.setData({
              phase: 'authed',
              om: d.openid_masked || '',
              isSa: !!d.is_sa,
              nicknameInput: d.nickname || '',
              canConfirm: true
            });
          })
          .catch((e) => this.setData({ phase: 'error', msg: e.message }));
      },
      fail: () => this.setData({ phase: 'error', msg: '微信登录失败，请重试' })
    });
  },

  onConfirm() {
    if (!this.data.canConfirm) return;
    this.setData({ canConfirm: false });
    const nickname = (this.data.nicknameInput || '').trim().slice(0, 40);
    this.request('/api/auth/qr/confirm', { ticket: this.ticket, token: this.mToken, nickname })
      .then(() => {
        this.stopCountdown();
        this.setData({ phase: 'done' });
        setTimeout(() => {
          wx.exitMiniProgram({ fail: () => wx.navigateBack({ fail: () => {} }) });
        }, 1200);
      })
      .catch((e) => {
        this.setData({ phase: 'error', msg: e.message || '确认失败' });
      });
  },

  onCancel() { wx.navigateBack({ fail: () => {} }); }
});
