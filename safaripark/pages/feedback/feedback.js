import { API_URLS } from '../../common/config.js';

Page({
  data: {
    name: '',
    contact: '',
    feedbackText: '',
    rating: 0
  },

  inputName(e) {
    this.setData({
      name: e.detail.value
    });
  },

  inputContact(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  inputFeedback(e) {
    this.setData({
      feedbackText: e.detail.value
    });
  },

  setRating(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({ rating });
  },

  submitFeedback() {
    if (this.data.name.trim() === '') {
      wx.showToast({
        title: '请输入您的名字',
        icon: 'none'
      });
      return;
    }
    if (this.data.contact.trim() === '') {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      });
      return;
    }
    if (this.data.rating === 0) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }
    if (this.data.feedbackText.trim() === '') {
      wx.showToast({
        title: '反馈内容不能为空',
        icon: 'none'
      });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: API_URLS.FEEDBACK.ADD(),
      method: 'POST',
      data: {
        openid: userInfo.openid,
        name: this.data.name,
        contact: this.data.contact,
        content: this.data.feedbackText,
        rating: this.data.rating
      },
      success: (res) => {
        if (res.data.success) {
          this.resetForm();
          wx.navigateBack();
          wx.showToast({
            title: '反馈提交成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
        }
      }
    });
  },

  resetForm() {
    this.setData({
      name: '',
      contact: '',
      feedbackText: '',
      rating: 0
    });
  }
});