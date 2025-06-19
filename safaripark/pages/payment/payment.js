import { API_BASE_URL, API_PATHS } from '../../common/config.js';
import { PAYMENT_METHODS } from '../../common/const.js';

Page({
  data: {
    minutes: 30,
    seconds: '00',
    totalAmount: 0,
    orderIds: [],
    paymentMethods: Object.values(PAYMENT_METHODS),
    selectedMethod: '',
    timer: null
  },

  onLoad: function(options) {
    console.log('支付页面接收到的参数:', options);
    
    if (!options.totalAmount || !options.orderIds) {
      console.error('缺少必要的支付参数');
      wx.showToast({
        title: '订单参数错误',
        icon: 'none',
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
      return;
    }

    try {
      const totalAmount = parseFloat(options.totalAmount);
      const orderIds = JSON.parse(options.orderIds);
      
      console.log('解析后的订单金额:', totalAmount);
      console.log('解析后的订单IDs:', orderIds);

      this.setData({
        totalAmount: totalAmount,
        orderIds: orderIds,
        selectedMethod: this.data.paymentMethods[0] // 默认选中第一个支付方式
      });
      
      this.startTimer();
    } catch (error) {
      console.error('参数解析错误:', error);
      wx.showToast({
        title: '订单数据错误',
        icon: 'none',
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }
  },

  onUnload: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  startTimer: function() {
    let totalSeconds = 30 * 60;
    const timer = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timer);
        this.handlePaymentTimeout();
        return;
      }

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      this.setData({
        minutes: minutes,
        seconds: seconds < 10 ? '0' + seconds : seconds
      });

      totalSeconds--;
    }, 1000);

    this.setData({ timer });
  },

  onPaymentMethodChange: function(e) {
    this.setData({
      selectedMethod: e.detail.value
    });
  },

  cancelPayment: function() {
    wx.switchTab({
      url: '/pages/mine/mine'
    });
  },

  confirmPayment: function() {
    if (!this.data.selectedMethod) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }

    // 显示支付中的加载提示
    wx.showLoading({
      title: '支付中...',
    });

    // 模拟支付过程
    setTimeout(() => {
      wx.hideLoading();
      this.updateOrderStatus();
    }, 1500);
  },

  updateOrderStatus: function() {
    const { orderIds } = this.data;
    console.log('开始更新订单状态，订单IDs:', orderIds);
    
    if (!orderIds || orderIds.length === 0) {
        console.error('没有找到订单ID');
        wx.showToast({
            title: '订单数据错误',
            icon: 'none'
        });
        return;
    }

    // 更新所有订单状态
    Promise.all(orderIds.map(orderId => {
        console.log('正在更新订单:', orderId);
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${API_BASE_URL}${API_PATHS.ORDER.UPDATE_STATUS}`,
                method: 'POST',
                data: {
                    orderId: orderId,
                    status: '待出行'
                },
                success: (res) => {
                    console.log('订单状态更新响应:', res.data);
                    if (res.data === "订单状态更新成功") {
                        resolve();
                    } else {
                        reject(new Error(res.data));
                    }
                },
                fail: (err) => {
                    console.error('更新订单状态失败:', err);
                    reject(err);
                }
            });
        });
    }))
    .then(() => {
        console.log('所有订单状态更新成功');
        wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
            success: () => {
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/mine/mine'
                    });
                }, 2000);
            }
        });
    })
    .catch((error) => {
        console.error('订单状态更新失败:', error);
        wx.showToast({
            title: '状态更新失败',
            icon: 'none'
        });
    });
  },

  handlePaymentTimeout: function() {
    const { orderIds } = this.data;
    console.log('订单超时，开始更新状态为已失效，订单IDs:', orderIds);
    
    // 更新所有订单状态为已失效
    Promise.all(orderIds.map(orderId => {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${API_BASE_URL}${API_PATHS.ORDER.UPDATE_STATUS}`,
                method: 'POST',
                data: {
                    orderId: orderId,
                    status: '已失效'
                },
                success: (res) => {
                    console.log('订单失效状态更新响应:', res.data);
                    if (res.data === "订单状态更新成功") {
                        resolve();
                    } else {
                        reject(new Error(res.data));
                    }
                },
                fail: (err) => {
                    console.error('更新订单失效状态失败:', err);
                    reject(err);
                }
            });
        });
    }))
    .then(() => {
        console.log('所有订单已更新为失效状态');
        wx.showToast({
            title: '支付超时',
            icon: 'none',
            duration: 2000,
            success: () => {
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/mine/mine'
                    });
                }, 2000);
            }
        });
    })
    .catch((error) => {
        console.error('更新订单失效状态失败:', error);
        wx.showToast({
            title: '状态更新失败',
            icon: 'none'
        });
    });
  }
}); 