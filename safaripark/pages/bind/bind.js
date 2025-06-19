import { API_URLS } from '../../common/config.js';

Page({
  data: {
    phone: '',
    isSubmitting: false
  },

  onLoad: function() {
    // 可以在这里初始化数据
  },

  // 处理输入框变化
  onInputChange: function(e) {
    const value = e.detail.value;
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      this.setData({
        phone: value
      });
    }
  },

  // 绑定手机号
  bindPhone: function() {
    if (this.data.isSubmitting) return;
    
    if (!this.validatePhone(this.data.phone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({ isSubmitting: true });

    // 显示加载提示
    wx.showLoading({
      title: '绑定中...',
      mask: true
    });

    // 更新用户信息
    wx.request({
      url: API_URLS.USER.UPDATE(),
      method: 'POST',
      data: {
        openid: userInfo.openid,
        phone: this.data.phone
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 更新本地存储
          userInfo.phone = this.data.phone;
          wx.setStorageSync('userInfo', userInfo);
          
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              setTimeout(() => {
                // 返回上一个页面
                wx.navigateBack();
              }, 2000);
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '绑定失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isSubmitting: false });
      }
    });
  },

  validatePhone: function(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}); 