import { API_URLS } from '../../common/config.js';

Page({
  data: {
    bookingData: [],
    showModal: false,
    currentPerformance: null
  },

  onLoad() {
    // 检查用户登录状态
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
    this.fetchBookings();
  },

  fetchBookings() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    wx.request({
      url: API_URLS.PERFORMANCE_BOOKING.BOOKING_LIST(),
      method: 'GET',
      data: {
        openid: userInfo.openid
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          this.setData({
            bookingData: res.data.records.map(booking => ({
              ...booking,
              showTimeFormatted: this.formatDateTime(booking.show_date, booking.show_time)
            }))
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取预约失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取预约数据失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 格式化日期时间
  formatDateTime(showDate, showTime) {
    if (!showDate || !showTime) return '';
    return `${showDate} ${showTime}`;
  },

  // 显示表演详情
  showPerformanceDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showModal: true,
      currentPerformance: item
    });
  },

  // 关闭悬浮窗
  closeModal() {
    this.setData({
      showModal: false,
      currentPerformance: null
    });
  },

  // 处理取消按钮点击
  handleCancelClick(e) {
    // 直接调用取消预约方法
    this.cancelBooking(e);
  },

  cancelBooking(event) {
    const id = event.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');
    
    wx.showModal({
      title: '取消预约',
      content: '您确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: API_URLS.PERFORMANCE_BOOKING.UPDATE_STATUS(),
            method: 'POST',
            data: {
              id: id,
              openid: userInfo.openid,
              status: '已取消'
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                this.fetchBookings(); // 重新获取预约列表
              } else {
                wx.showToast({
                  title: res.data.message || '取消失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('取消预约失败:', err);
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
}); 