// app.js
import { API_URLS } from './common/config.js';

App({
  globalData: {
    locationTimer: null, // 全局定时器 ID
    isLocationActive: false, // 标记定位是否正在运行
    userInfo: null,
    isPersonalized: false,
    lastWarningTime: 0, // 上次警告时间
    warningModalVisible: false, // 警告弹窗是否可见
    token: null,
    zooChanged: false // 添加动物园切换标记
  },

  // 小程序初始化时触发
  onLaunch() {
    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      token: null
    };
    
    // 从本地存储读取用户数据
    this.loadUserData();

    // 请求用户位置权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.startLocationTimer(); // 授权成功后启动定时器
            },
            fail: () => {
              console.log("用户拒绝了位置权限");
            }
          });
        } else {
          this.startLocationTimer(); // 已授权则直接启动定时器
        }
      }
    });

    // 获取个性化设置
    if (this.globalData.userInfo && this.globalData.userInfo.openid) {
      wx.request({
        url: API_URLS.USER_PREFERENCE.GET(),
        data: { openid: this.globalData.userInfo.openid },
        success: (res) => {
          if (res.data.success && res.data.data) {
            this.globalData.isPersonalized = res.data.data.isPersonalized || false;
          }
        }
      });
    }
  },

  // 小程序切换到前台时触发
  onShow() {
    if (!this.globalData.isLocationActive) {
      this.startLocationTimer();
    }
  },

  // 小程序切换到后台时触发
  onHide() {
    this.stopLocationTimer();
  },

  // 启动全局定时器
  startLocationTimer() {
    if (this.globalData.locationTimer) return;

    this.globalData.isLocationActive = true;
    this.globalData.locationTimer = setInterval(() => {
      this.getAndSendLocation();
    }, 5000); // 每5秒检查一次位置
  },

  // 停止全局定时器
  stopLocationTimer() {
    if (this.globalData.locationTimer) {
      clearInterval(this.globalData.locationTimer);
      this.globalData.locationTimer = null;
      this.globalData.isLocationActive = false;
    }
  },

  // 获取位置并检查危险区域
  getAndSendLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        console.log('当前位置:', latitude, longitude);
        this.checkDangerZone(latitude, longitude);
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
      }
    });
  },

  // 检查危险区域
  checkDangerZone(latitude, longitude) {
    // 如果警告弹窗正在显示，不重复检查
    if (this.globalData.warningModalVisible) {
      return;
    }

    // 检查是否在冷却时间内（5分钟）
    const now = Date.now();
    if (now - this.globalData.lastWarningTime < 5 * 60 * 1000) {
      return;
    }

    // 获取用户信息 - 首先尝试从globalData获取
    let userInfo = this.globalData.userInfo;
    
    // 如果globalData中没有，尝试从本地存储获取
    if (!userInfo || !userInfo.id) {
      userInfo = wx.getStorageSync('userInfo');
      
      // 如果找到了存储中的用户信息，更新全局变量
      if (userInfo && userInfo.id) {
        this.globalData.userInfo = userInfo;
        console.log('从本地存储更新全局用户信息', userInfo);
      }
    }
    
    // 确认用户是否已登录
    if (!userInfo || !userInfo.id) {
      console.log('用户未登录或ID无效，开始重新登录流程');
      console.log('本地存储用户信息:', wx.getStorageSync('userInfo'));
      console.log('全局用户信息:', this.globalData.userInfo);
      
      // 尝试重新登录，但不再传递经纬度参数
      this.reLogin();
      return;
    }
    
    console.log('用户已登录，ID:', userInfo.id, '，开始危险区域检查');

    wx.request({
      url: API_URLS.DANGER_ZONE.CHECK(),
      method: 'POST',
      data: {
        latitude: latitude,
        longitude: longitude,
        userId: userInfo.id
      },
      success: (res) => {
        if (res.data.inDangerZone) {
          // 设置警告弹窗为可见
          this.globalData.warningModalVisible = true;
          // 更新最后警告时间
          this.globalData.lastWarningTime = now;

          // 显示警告弹窗
          wx.showModal({
            title: '⚠️ 危险区域警告',
            content: `您已进入危险区域"${res.data.zoneName}"！\n${res.data.description}\n如不在工作人员身边请迅速离开。`,
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#f00',
            complete: () => {
              // 弹窗关闭后，重置警告弹窗状态
              this.globalData.warningModalVisible = false;
            }
          });
        }
      },
      fail: (err) => {
        console.error('检查危险区域失败:', err);
      }
    });
  },

  // 修改：重新登录方法
  reLogin() {
    console.log('开始重新登录流程');
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取到登录code:', res.code);
          wx.request({
            url: API_URLS.USER.LOGIN(),
            method: 'POST',
            data: {
              code: res.code
            },
            success: (loginRes) => {
              if (loginRes.statusCode === 200 && loginRes.data) {
                const userInfo = loginRes.data;
                console.log('登录成功，获取到用户信息:', userInfo);
                
                // 保存用户信息
                this.globalData.userInfo = userInfo;
                wx.setStorageSync('userInfo', userInfo);
                
                // 登录成功后，可以继续之前暂停的操作
                // 重新获取位置并检查危险区域
                this.getAndSendLocation();
                
                // 触发自定义事件，通知所有页面用户信息已更新
                this.notifyAllPages(userInfo);
              } else {
                console.error('重新登录失败:', loginRes);
              }
            },
            fail: (err) => {
              console.error('重新登录请求失败:', err);
            }
          });
        } else {
          console.error('获取登录code失败:', res.errMsg);
        }
      },
      fail: (err) => {
        console.error('调用login接口失败:', err);
      }
    });
  },

  login: function() {
    wx.request({
      url: API_URLS.USER.LOGIN(),
      method: 'POST',
      // ... 其他代码保持不变
    });
  },

  // 加载用户数据
  loadUserData() {
    try {
      // 获取用户信息和token
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      
      if (userInfo && userInfo.openid) {
        console.log('从本地存储加载到用户数据', userInfo);
        this.globalData.userInfo = userInfo;
        this.globalData.token = token;
      } else {
        console.log('未找到存储的用户数据，尝试自动登录');
        // 未找到本地数据，尝试自动登录
        this.autoLogin();
      }
    } catch (e) {
      console.error('读取用户数据失败', e);
      // 发生错误时也尝试自动登录
      this.autoLogin();
    }
  },

  // 自动登录方法
  autoLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('自动登录获取code成功:', res.code);
          wx.request({
            url: API_URLS.USER.LOGIN(),
            method: 'POST',
            data: {
              code: res.code
            },
            success: (loginRes) => {
              if (loginRes.statusCode === 200 && loginRes.data) {
                const userInfo = loginRes.data;
                console.log('自动登录成功，获取到用户信息:', userInfo);
                
                // 保存用户信息
                this.globalData.userInfo = userInfo;
                wx.setStorageSync('userInfo', userInfo);
                
                // 触发自定义事件，通知所有页面用户信息已更新
                this.notifyAllPages(userInfo);
              } else {
                console.error('自动登录失败:', loginRes);
              }
            },
            fail: (err) => {
              console.error('自动登录请求失败:', err);
            }
          });
        } else {
          console.error('获取登录code失败:', res.errMsg);
        }
      },
      fail: (err) => {
        console.error('调用login接口失败:', err);
      }
    });
  },
  
  // 新增：通知所有页面用户信息已更新
  notifyAllPages(userInfo) {
    // 获取所有页面实例
    const pages = getCurrentPages();
    
    // 遍历每个页面实例
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      // 检查页面是否存在onUserInfoUpdated方法
      if (page && typeof page.onUserInfoUpdated === 'function') {
        console.log('通知页面:', page.route);
        try {
          // 调用页面的onUserInfoUpdated方法
          page.onUserInfoUpdated(userInfo);
          
          // 如果是个人页面，强制更新显示
          if (page.route === 'pages/mine/mine') {
            // 确保isLoggedIn状态更新
            page.setData({
              isLoggedIn: true,
              hasUserInfo: true,
              userInfo: userInfo
            });
            console.log('已强制更新个人页面');
          }
        } catch (error) {
          console.error('通知页面更新失败:', error);
        }
      }
    }
    
    // 如果当前没有mine页面实例，下次进入时确保能看到正确状态
    wx.setStorageSync('loginState', true);
  },
  
  // 保存用户数据到全局变量和本地存储
  saveUserData(userInfo, token) {
    if (!userInfo || !token) {
      console.warn('保存的用户数据不完整', userInfo, token);
      return false;
    }
    
    // 保存到全局变量
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    
    // 保存到本地存储
    try {
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('token', token);
      console.log('用户数据已保存');
      return true;
    } catch (e) {
      console.error('保存用户数据失败', e);
      return false;
    }
  },
  
  // 清除用户数据（注销时使用）
  clearUserData() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    
    try {
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      console.log('用户数据已清除');
      return true;
    } catch (e) {
      console.error('清除用户数据失败', e);
      return false;
    }
  },

  // 添加动物园切换通知方法
  notifyZooChanged() {
    this.globalData.zooChanged = true;
  },

  // 重置动物园切换标记
  resetZooChanged() {
    this.globalData.zooChanged = false;
  }
});