import { API_URLS } from '../../common/config.js';

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      name: '',
      gender: '',
      realName: '',
      phone: '',
      idNumber: ''
    },
  },

  onLoad: function() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (storedUserInfo && storedUserInfo.openid) {
      // 使用存储的 openid 从后端获取最新的用户信息
      this.fetchUserInfo(storedUserInfo.openid);
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
              avatarUrl: avatarUrl
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

  changeAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          'userInfo.avatarUrl': tempFilePaths[0]
        });
      }
    });
  },

  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`userInfo.${field}`]: e.detail.value
    });
  },

  onGenderChange: function(e) {
    const gender = ['男', '女'][e.detail.value];
    // 根据性别选择头像
    const avatarUrl = gender === '女' ? 
        '../../images/mine/woman.png' : 
        '../../images/mine/man.png';
    
    this.setData({
        'userInfo.gender': gender,
        'userInfo.avatarUrl': avatarUrl
    });
  },

  validateInfo: function() {
    const { phone, idNumber } = this.data.userInfo;
    const phoneRegex = /^1[3-9]\d{9}$/;
    const idNumberRegex = /^\d{15}|\d{18}$/;

    if (phone && !phoneRegex.test(phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return false;
    }

    if (idNumber && !idNumberRegex.test(idNumber)) {
      wx.showToast({
        title: '身份证格式不正确',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  saveInfo: function() {
    if (!this.validateInfo()) return;

    const storedUserInfo = wx.getStorageSync('userInfo');
    if (!storedUserInfo || !storedUserInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 添加 openid 到要保存的数据中
    const saveData = {
      ...this.data.userInfo,
      openid: storedUserInfo.openid
    };

    wx.request({
      url: API_URLS.USER.UPDATE(),
      method: 'POST',
      data: saveData,
      success: (res) => {
        if (res.data.success) {
          // 更新本地存储的用户信息
          wx.setStorageSync('userInfo', {
            ...storedUserInfo,
            ...this.data.userInfo
          });
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 返回上一个页面
          wx.navigateBack();
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
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
  }
}); 