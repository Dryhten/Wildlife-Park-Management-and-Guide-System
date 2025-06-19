import { API_URLS } from '../../common/config.js';

Page({
  data: {
    hasUserInfo: false,
    userInfo: {},
    orderCount: {
      all: 0,
      waitPay: 0,
      waitUse: 0,
      completed: 0,
      refund: 0
    },
    isLoggedIn: false,
    bookingData: []
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    // 检查是否有新的登录状态
    const loginState = wx.getStorageSync('loginState');
    if (loginState === true) {
      console.log('mine页面检测到登录状态标记，重新获取用户信息');
      // 清除标记，避免重复处理
      wx.removeStorageSync('loginState');
    }
    
    this.checkLoginStatus();
  },

  checkLoginStatus: function() {
    // 先从全局应用实例获取用户信息
    const app = getApp();
    let userInfo = app.globalData.userInfo;
    
    // 如果全局数据中没有，尝试从本地存储获取
    if (!userInfo || !userInfo.openid) {
      userInfo = wx.getStorageSync('userInfo');
      
      // 如果找到了存储中的用户信息，更新全局变量
      if (userInfo && userInfo.openid) {
        app.globalData.userInfo = userInfo;
        console.log('从本地存储更新全局用户信息', userInfo);
      }
    }

    if (userInfo && userInfo.openid) {
      // 关键修改：设置isLoggedIn状态为true
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo,
        isLoggedIn: true
      });
      
      console.log('mine页面检测到用户已登录:', userInfo);
      
      // 用户ID是关键
      if (userInfo.id) {
        // 获取更多用户信息
        this.fetchUserInfo(userInfo.openid);
        // 获取订单数量
        this.fetchOrderCounts(userInfo.openid);
      } else {
        console.log('用户信息中缺少ID，可能需要重新登录');
        // 尝试获取完整用户信息
        this.fetchUserInfo(userInfo.openid);
      }
    } else {
      this.setData({
        hasUserInfo: false,
        userInfo: {},
        isLoggedIn: false
      });
      console.log('用户未登录或登录信息无效');
    }
  },

  // 从后端获取用户信息
  fetchUserInfo: function(openid) {
    wx.request({
      url: `${API_URLS.USER.GET()}?openid=${openid}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          const dbUserInfo = res.data.data;
          // 根据性别选择头像，如果没有性别信息则使用默认头像
          const avatarUrl = dbUserInfo.gender ? 
            (dbUserInfo.gender === '女' ? '../../images/mine/woman.png' : '../../images/mine/man.png') :
            this.data.defaultAvatarUrl;
          this.setData({
            userInfo: {
              ...dbUserInfo,
              avatarUrl: avatarUrl,
              status: dbUserInfo.phone ? '已认证' : '未认证'
            }
          });
        } else {
          // 如果获取失败，使用默认头像
          this.setData({
            'userInfo.avatarUrl': this.data.defaultAvatarUrl
          });
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        // 如果请求失败，使用默认头像
        this.setData({
          'userInfo.avatarUrl': this.data.defaultAvatarUrl
        });
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 用户点击登录按钮时调用
  goToLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: API_URLS.USER.LOGIN(),
            method: 'POST',
            data: {
              code: res.code
            },
            success: (res) => {
              if (res.statusCode === 200) {
                const userInfo = {
                  openid: res.data.openid,
                  name: res.data.name || '微信用户'
                };
                wx.setStorageSync('userInfo', userInfo);
                this.setData({ isLoggedIn: true });
                this.fetchUserInfo(userInfo.openid); // 登录成功后获取完整用户信息
                
                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
              } else {
                console.error('登录失败:', res.data);
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('请求失败:', err);
              wx.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            }
          });
        } else {
          console.error('登录失败！' + res.errMsg);
        }
      }
    });
  },

  // 绑定手机号
  goToBind: function() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/bind/bind'
    });
  },

  // 跳转到订单页面并设置状态
  goToOrders: function(e) {
    const status = e.currentTarget.dataset.status;
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/order/order?status=${status}`
    });
  },

  // 跳转到个人信息页面
  goToPersonalInfo: function() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/personalInfo/personalInfo'
    });
  },
  goToPerformancebooking: function() {
    wx.navigateTo({
      url: '/pages/performancebooking/performancebooking'
    });
  },

  // 跳转到个性化设置页面
  goToPerference: function() {
    wx.navigateTo({
      url: '/pages/preference/preference',
    });
  },

  // 跳转到联系客服页面
  goToContact: function() {
    wx.navigateTo({
      url: '/pages/contact/contact'
    });
  },

  // 跳转到分享页面
  goToShare: function() {
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '野生动物园自助导览小程序 - 与动物亲密接触',
      imageUrl: '/images/logo/logo.png' // 使用现有的logo图片
    }
  },

  // 分享给朋友
  onShareAppMessage: function() {
    return {
      title: '野生动物园自助导览小程序 - 与动物亲密接触',
      path: '/pages/index/index',
      imageUrl: '/images/logo/logo.png' // 使用现有的logo图片
    }
  },

  // 获取订单数量
  fetchOrderCounts: function(openid) {
    // 实现获取订单数量的逻辑
  },

  // 添加用户信息更新处理函数
  onUserInfoUpdated: function(userInfo) {
    console.log('个人页面接收到用户信息更新:', userInfo);
    if (userInfo && userInfo.openid) {
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo,
        isLoggedIn: true
      });
      
      // 获取更多用户信息
      this.fetchUserInfo(userInfo.openid);
      // 获取订单数量
      this.fetchOrderCounts(userInfo.openid);
    }
  }
});
