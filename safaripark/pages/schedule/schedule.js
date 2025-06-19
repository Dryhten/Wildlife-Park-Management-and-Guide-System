import { API_URLS } from '../../common/config.js';

Page({
  data: {
    scheduleData: [],
    showModal: false,
    selectedItem: {}
  },

  onLoad() {
    this.fetchPerformances();
  },

  fetchPerformances() {
    wx.request({
      url: API_URLS.PERFORMANCE.PERFORMANCES(),
      method: 'GET',
      success: (res) => {
        if (res.data) {
          this.setData({
            scheduleData: res.data
          });
        }
      },
      fail: (err) => {
        console.error('获取表演数据失败:', err);
      }
    });
  },

  // 显示表演详情
  showModal(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showModal: true,
      selectedItem: item
    });
  },

  // 关闭悬浮窗
  closeModal() {
    this.setData({
      showModal: false,
      selectedItem: {}
    });
  },

  // 预约演出
  reserveShow(event) {
    const id = event.currentTarget.dataset.id;
    const selectedItem = this.data.scheduleData.find(item => item.id === id);
    const userInfo = wx.getStorageSync('userInfo');
    
    wx.showModal({
      title: '预约演出',
      content: `您确定要预约 ${selectedItem.title} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: API_URLS.PERFORMANCE_BOOKING.BOOK(),
            method: 'POST',
            data: {
              openid: userInfo.openid,
              performanceId: selectedItem.id,
              bookingDate: selectedItem.showDate
            },
            success: (res) => {
              if (res.data === 'success') {
                wx.showToast({
                  title: '预约成功',
                  icon: 'success'
                });
                // 关闭悬浮窗
                this.closeModal();
              } else {
                wx.showToast({
                  title: res.data,
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('预约失败:', err);
              wx.showToast({
                title: '预约失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
}); 