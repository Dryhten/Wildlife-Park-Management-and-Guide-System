import { API_URLS } from '../../common/config';
Component({
  data: {
    showResult: false,
    detectionResult: null,
    imageUrl: '',
    animalInfo: null,
    accuracy: '',
    errorMessage: ''
  },

  methods: {
    onScan() {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.setData({ imageUrl: tempFilePath });
          
          wx.showLoading({ title: '识别中...' });
          wx.uploadFile({
            url: API_URLS.ANIMAL_DETECTION.DETECT(),
            filePath: tempFilePath,
            name: 'image',
            success: (uploadRes) => {
              try {
                const result = JSON.parse(uploadRes.data);
                console.log('识别结果：', result);
                
                if (result.success && result.detections && result.detections.length > 0) {
                  // 找出最大的检测框
                  let maxArea = 0;
                  let mainDetection = null;
                  result.detections.forEach(detection => {
                    const area = (detection.bbox[2] - detection.bbox[0]) * (detection.bbox[3] - detection.bbox[1]);
                    if (area > maxArea) {
                      maxArea = area;
                      mainDetection = detection;
                    }
                  });
                  
                  console.log('主要检测结果：', mainDetection);

                  if (mainDetection) {
                    // 计算准确率
                    const accuracy = (mainDetection.confidence * 100).toFixed(2) + '%';
                    
                    // 更新状态但不显示，等待获取动物信息后再显示
                    this.setData({
                      detectionResult: result.detections,
                      accuracy: accuracy,
                      errorMessage: ''
                    });

                    // 获取动物详细信息
                    wx.request({
                      url: API_URLS.ANIMAL_DETECTION.INFO(mainDetection.class),
                      success: (infoRes) => {
                        console.log('动物信息：', infoRes.data);
                        
                        if (infoRes.data.success && infoRes.data.data) {
                          // 获取到动物信息后，更新状态并显示弹窗
                          this.setData({
                            showResult: true,
                            animalInfo: infoRes.data.data
                          });
                          console.log('弹窗显示状态：', this.data.showResult);
                        } else {
                          // 未找到动物信息
                          const errorMsg = infoRes.data.message || '未找到该动物信息';
                          this.setData({
                            showResult: true,
                            animalInfo: null,
                            errorMessage: errorMsg
                          });
                          console.log('未找到动物信息：', errorMsg);
                        }
                      },
                      fail: (err) => {
                        console.error('获取动物信息失败：', err);
                        this.setData({
                          showResult: true,
                          animalInfo: null,
                          errorMessage: '获取动物信息失败，请稍后重试'
                        });
                      }
                    });
                  } else {
                    wx.showToast({
                      title: '识别结果处理失败',
                      icon: 'none'
                    });
                  }
                } else {
                  wx.showToast({
                    title: '未能识别到动物',
                    icon: 'none'
                  });
                }
              } catch (error) {
                console.error('解析识别结果失败：', error, uploadRes.data);
                wx.showToast({
                  title: '解析识别结果失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('上传失败：', err);
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      });
    },

    onModalTap() {
      console.log('关闭弹窗');
      this.setData({
        showResult: false,
        detectionResult: null,
        imageUrl: '',
        animalInfo: null,
        accuracy: '',
        errorMessage: ''
      });
    },

    onContentTap(e) {
      // 阻止事件冒泡，防止点击内容区域时关闭弹窗
      e.stopPropagation();
    }
  }
}); 