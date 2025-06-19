Page({
  data: {
    // 初始化数据
  },

  onLoad: function() {
    // 页面加载时的逻辑
  },

  makePhoneCall: function(e) {
    const phoneNumber = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success: function() {
        console.log('拨号成功');
      },
      fail: function() {
        console.log('拨号失败');
      }
    });
  }
}); 