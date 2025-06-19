// 切换动物园
switchZoo(e) {
  const zooId = e.currentTarget.dataset.id;
  if (zooId === this.data.currentZooId) return;
  
  this.setData({
    currentZooId: zooId
  });
  
  // 保存当前选择的动物园ID到本地存储
  wx.setStorageSync('currentZooId', zooId);
  
  // 通知所有页面动物园已切换
  getApp().notifyZooChanged();
  
  // 重新加载当前页面数据
  this.loadZooData();
}, 