Page({
  data: {
    animalInfo: null
  },
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.recognizeAnimal(tempFilePath);
      }
    });
  },
  recognizeAnimal(imagePath) {
    // 这里调用后台API进行动物识别
    // 假设返回的数据格式为 { name: '狮子', habit: '群居', habitat: '非洲草原' }
    const animalInfo = {
      name: '狮子',
      habit: '群居',
      habitat: '非洲草原'
    };
    this.setData({ animalInfo });
  }
});