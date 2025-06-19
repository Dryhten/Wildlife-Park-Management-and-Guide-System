Page({
  data: {
    latitude: 39.90469,
    longitude: 116.40717,
    markers: [{
      id: 1,
      latitude: 39.90469,
      longitude: 116.40717,
      name: '北京动物园'
    }]
  },
  startNavigation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        wx.openLocation({
          latitude,
          longitude,
          name: '北京动物园',
          address: '北京市西城区西直门外大街137号'
        });
      }
    });
  }
});