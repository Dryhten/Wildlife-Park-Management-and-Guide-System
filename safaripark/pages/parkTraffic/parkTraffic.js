import { API_URLS } from '../../common/config.js';

Page({
  data: {
    trafficData: [],
    lastUpdateTime: '',
    timer: null
  },

  onLoad: function() {
    this.fetchTrafficData();
    // 每30秒更新一次数据
    this.data.timer = setInterval(() => {
      this.fetchTrafficData();
    }, 30000);
  },

  onUnload: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  fetchTrafficData: function() {
    wx.request({
      url: API_URLS.PARK_TRAFFIC.REALTIME(),
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          let trafficData = res.data.data;
          
          // 为每个园区添加状态信息
          trafficData.forEach(item => {
            if (item.currentPeople < 20) {
              item.status = '空闲';
              item.statusClass = 'status-free';
            } else if (item.currentPeople < 50) {
              item.status = '流畅';
              item.statusClass = 'status-smooth';
            } else if (item.currentPeople < 80) {
              item.status = '拥挤';
              item.statusClass = 'status-crowded';
            } else {
              item.status = '繁忙';
              item.statusClass = 'status-busy';
            }
          });
          
          this.setData({
            trafficData: trafficData,
            lastUpdateTime: this.formatTime(new Date())
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败：', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  formatTime: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}); 