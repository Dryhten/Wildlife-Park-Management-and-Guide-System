import { API_URLS } from '../../common/config.js';

Page({
  data: {
    parkList: [],
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/mine/mine'
            });
          }, 1500);
        }
      });
      return;
    }
    this.setData({ userInfo });
    this.fetchParkList();
  },

  onShow() {
    if (this.data.userInfo) {
      this.fetchParkList();
    }
  },

  fetchParkList() {
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: API_URLS.PARK_BOOKING.PARK_LIST(),
      method: 'GET',
      data: {
        openid: this.data.userInfo.openid
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            parkList: res.data.data
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取园区信息失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  handleBooking(e) {
    const { parkId, isBooked } = e.currentTarget.dataset;
    const url = isBooked ? API_URLS.PARK_BOOKING.CANCEL() : API_URLS.PARK_BOOKING.BOOK();
    const title = isBooked ? '确定取消预约吗？' : '确定预约该园区吗？';

    wx.showModal({
      title: '提示',
      content: title,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          wx.request({
            url: url,
            method: 'POST',
            data: {
              openid: this.data.userInfo.openid,
              parkId: parkId
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: res.data.message,
                  icon: 'success'
                });
                this.fetchParkList();
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      }
    });
  }
}); 