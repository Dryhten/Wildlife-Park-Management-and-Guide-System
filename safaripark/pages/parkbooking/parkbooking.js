import { API_URLS } from '../../common/config.js';

Page({
  data: {
    parkList: [],
    userInfo: null,
    bookingStatus: {
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    },
    statusText: {
      'Pending': '待处理',
      'Completed': '已完成',
      'Cancelled': '已取消'
    },
    booking: {
      parkId: null,
      bookingTime: null,
      status: 'Pending'
    },
    showDetail: false,
    currentPark: null
  },

  getStatusText(status) {
    return this.data.statusText[status] || '未知状态';
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
    const title = isBooked ? '确定取消预约吗？' : '确定预约该园区吗？';

    wx.showModal({
      title: '提示',
      content: title,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          // 根据是否已预约选择不同的接口
          const url = isBooked ? API_URLS.PARK_BOOKING.CANCEL() : API_URLS.PARK_BOOKING.BOOK();
          
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
                this.fetchParkList();  // 刷新列表
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
  },

  // 提交预约
  submitBooking() {
    const booking = this.data.booking;
    
    wx.request({
      url: 'YOUR_API_BASE_URL/park-booking/book',
      method: 'POST',
      data: booking,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 预约成功后的处理逻辑
          this.navigateBack();
        } else {
          wx.showToast({
            title: '预约失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('预约失败:', err);
        wx.showToast({
          title: '预约失败',
          icon: 'error'
        });
      }
    });
  },

  // 更新预约状态
  updateBookingStatus(bookingId, status) {
    wx.request({
      url: `YOUR_API_BASE_URL/park-booking/update-status`,
      method: 'PUT',
      data: {
        bookingId: bookingId,
        status: status
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '状态更新成功',
            icon: 'success'
          });
          // 刷新预约列表
          this.loadBookings();
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('更新失败:', err);
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      }
    });
  },

  // 加载预约列表
  loadBookings() {
    // 实现加载预约列表的逻辑
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 显示园区详情
  showParkDetail: function(e) {
    const parkId = e.currentTarget.dataset.park.parkId;
    wx.showLoading({
      title: '加载中...',
    });
    
    wx.request({
      url: `${API_URLS.PARK.INFO()}/${parkId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          const park = res.data.data;
          const animalData = park.animalDistribution ? JSON.parse(park.animalDistribution) : { animals: [] };
          this.setData({
            showDetail: true,
            currentPark: {
              parkName: park.name,
              background: park.background || '暂无背景信息',
              features: park.features || '暂无特色景点信息',
              animalDistribution: animalData.animals,
              audioGuide: park.audioGuide || '暂无语音介绍'
            }
          });
        } else {
          wx.showToast({
            title: '获取园区信息失败',
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

  // 隐藏园区详情
  hideDetail: function() {
    this.setData({
      showDetail: false,
      currentPark: null
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 在微信小程序中，直接返回即可阻止事件冒泡
    return;
  }
}); 