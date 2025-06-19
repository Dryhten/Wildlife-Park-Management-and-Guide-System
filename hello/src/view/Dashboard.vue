<template>
  <div class="dashboard">
    <!-- 数据源切换开关 -->
    <el-row :gutter="20" class="switch-row">
      <el-col :span="24">
        <el-switch
          v-model="useRealData"
          active-text="使用真实数据"
          inactive-text="使用模拟数据"
          @change="handleDataSourceChange">
        </el-switch>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 顶部数据卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <i class="el-icon-s-order"></i>
            <span>今日订单数</span>
          </div>
          <div class="card-number">{{ todayOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <i class="el-icon-user"></i>
            <span>当前游客数</span>
          </div>
          <div class="card-number">{{ todayVisitors }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <i class="el-icon-money"></i>
            <span>今日收入</span>
          </div>
          <div class="card-number">¥{{ todayIncome }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <i class="el-icon-tickets"></i>
            <span>今日预警次数</span>
          </div>
          <div class="card-number">{{ pendingOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>近7天订单趋势</span>
          </div>
          <div ref="orderChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>园区实时流量分布</span>
          </div>
          <div ref="trafficChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>热门动物表演预订</span>
          </div>
          <div ref="performanceChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>实时安全预警</span>
          </div>
          <div class="alert-list">
            <div v-for="(alert, index) in mockData.safetyAlerts" :key="index" class="alert-item">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-time">{{ alert.time }}</div>
              <div class="alert-description">{{ alert.description }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  data() {
    return {
      useRealData: false,
      todayOrders: 0,
      todayVisitors: 0,
      todayIncome: 0,
      pendingOrders: 0,
      orderChart: null,
      trafficChart: null,
      performanceChart: null,
      incomeChart: null,
      refreshTimer: null,
      // 模拟数据
      mockData: {
        todayOrders: 89,
        todayVisitors: 2560,
        todayIncome: 12800,
        pendingOrders: 5,
        orderTrend: [120, 180, 150, 200, 160, 140, 89],
        trafficData: [
          { value: 800, name: '熊猫馆', currentPeople: 500, queuePeople: 300 },
          { value: 600, name: '狮虎山', currentPeople: 400, queuePeople: 200 },
          { value: 450, name: '海洋馆', currentPeople: 300, queuePeople: 150 },
          { value: 350, name: '鸟类园', currentPeople: 250, queuePeople: 100 },
          { value: 400, name: '猴山', currentPeople: 300, queuePeople: 100 }
        ],
        performanceData: [280, 250, 220, 200, 180],
        performanceNames: ['海豚表演', '大象表演', '鹦鹉表演', '海狮表演', '猴子表演'],
        safetyAlerts: [
          {
            id: 1,
            title: '安全预警 #1',
            zone: '熊猫馆',
            reporter: '张管理员',
            time: '2024-03-20 14:30:00',
            description: '区域：熊猫馆\n报告人：张管理员'
          },
          {
            id: 2,
            title: '安全预警 #2',
            zone: '狮虎山',
            reporter: '李管理员',
            time: '2024-03-20 13:15:00',
            description: '区域：狮虎山\n报告人：李管理员'
          },
          {
            id: 3,
            title: '安全预警 #3',
            zone: '海洋馆',
            reporter: '王管理员',
            time: '2024-03-20 12:00:00',
            description: '区域：海洋馆\n报告人：王管理员'
          }
        ]
      }
    }
  },
  mounted() {
    this.initCharts()
    this.fetchData()
    // 添加定时刷新
    this.startAutoRefresh()
  },
  methods: {
    startAutoRefresh() {
      // 每30秒刷新一次数据
      this.refreshTimer = setInterval(() => {
        if (this.useRealData) {
          this.fetchRealData()
        }
      }, 30000)
    },
    async fetchData() {
      try {
        if (this.useRealData) {
          await this.fetchRealData()
        } else {
          // 使用模拟数据
          this.todayOrders = this.mockData.todayOrders
          this.todayVisitors = this.mockData.todayVisitors
          this.todayIncome = this.mockData.todayIncome
          this.pendingOrders = this.mockData.pendingOrders
          
          // 重置图表数据为模拟数据
          this.mockData.orderTrend = [120, 180, 150, 200, 160, 140, 89]
          this.mockData.trafficData = [
            { value: 800, name: '熊猫馆', currentPeople: 500, queuePeople: 300 },
            { value: 600, name: '狮虎山', currentPeople: 400, queuePeople: 200 },
            { value: 450, name: '海洋馆', currentPeople: 300, queuePeople: 150 },
            { value: 350, name: '鸟类园', currentPeople: 250, queuePeople: 100 },
            { value: 400, name: '猴山', currentPeople: 300, queuePeople: 100 }
          ]
          this.mockData.performanceData = [280, 250, 220, 200, 180]
          this.mockData.performanceNames = ['海豚表演', '大象表演', '鹦鹉表演', '海狮表演', '猴子表演']
          this.mockData.safetyAlerts = [
            {
              id: 1,
              title: '安全预警 #1',
              zone: '熊猫馆',
              reporter: '张管理员',
              time: '2024-03-20 14:30:00',
              description: '区域：熊猫馆\n报告人：张管理员'
            },
            {
              id: 2,
              title: '安全预警 #2',
              zone: '狮虎山',
              reporter: '李管理员',
              time: '2024-03-20 13:15:00',
              description: '区域：狮虎山\n报告人：李管理员'
            },
            {
              id: 3,
              title: '安全预警 #3',
              zone: '海洋馆',
              reporter: '王管理员',
              time: '2024-03-20 12:00:00',
              description: '区域：海洋馆\n报告人：王管理员'
            }
          ]
          
          // 更新图表
          this.updateCharts()
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败，请稍后重试')
      }
    },
    async fetchRealData() {
      try {
        // 获取今日订单数据
        const orderResponse = await this.$axios.get('/api/admin/dashboard/orders/today')
        this.todayOrders = orderResponse.data.total || 0
        this.pendingOrders = orderResponse.data.pending || 0

        // 获取今日游客数据
        const visitorResponse = await this.$axios.get('/api/admin/dashboard/visitors/today')
        this.todayVisitors = visitorResponse.data.total || 0

        // 获取今日收入数据
        const incomeResponse = await this.$axios.get('/api/admin/dashboard/income/today')
        this.todayIncome = incomeResponse.data.total || 0

        // 获取订单趋势数据
        const trendResponse = await this.$axios.get('/api/admin/dashboard/orders/trend')
        this.mockData.orderTrend = trendResponse.data || this.mockData.orderTrend

        // 获取园区流量数据
        const trafficResponse = await this.$axios.get('/api/admin/dashboard/park_traffic/realtime')
        this.mockData.trafficData = trafficResponse.data.map(item => ({
          name: item.parkName,
          value: item.currentPeople + item.queuePeople,
          currentPeople: item.currentPeople,
          queuePeople: item.queuePeople
        }))

        // 获取表演预订数据
        const performanceResponse = await this.$axios.get('/api/admin/dashboard/performance_booking/stats')
        const performanceData = performanceResponse.data
        this.mockData.performanceData = performanceData.map(item => item.count)
        this.mockData.performanceNames = performanceData.map(item => item.type)

        // 获取安全预警数据
        const alertsResponse = await this.$axios.get('/api/admin/dashboard/safety_alerts')
        this.mockData.safetyAlerts = alertsResponse.data

        // 更新图表
        this.updateCharts()
      } catch (error) {
        console.error('获取真实数据失败:', error)
        throw error
      }
    },
    handleDataSourceChange() {
      // 立即更新数据
      this.fetchData()
      // 如果切换到模拟数据，清除定时器
      if (!this.useRealData && this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
      // 如果切换到真实数据，启动定时器
      if (this.useRealData) {
        this.startAutoRefresh()
      }
    },
    updateCharts() {
      if (!this.orderChart || !this.trafficChart || !this.performanceChart) {
        console.error('图表实例未初始化')
        return
      }

      // 更新订单趋势图
      this.orderChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>订单数：{c}'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          name: '订单数'
        },
        series: [{
          data: this.mockData.orderTrend,
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }]
      })

      // 更新园区流量图
      this.trafficChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['园内人数', '排队人数']
        },
        xAxis: {
          type: 'category',
          data: this.mockData.trafficData.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '人数'
        },
        series: [
          {
            name: '园内人数',
            type: 'bar',
            data: this.mockData.trafficData.map(item => item.currentPeople),
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '排队人数',
            type: 'bar',
            data: this.mockData.trafficData.map(item => item.queuePeople),
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      })

      // 更新表演预订图
      this.performanceChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br/>预订数：{c}'
        },
        xAxis: {
          type: 'category',
          data: this.mockData.performanceNames,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '预订数'
        },
        series: [{
          data: this.mockData.performanceData,
          type: 'bar',
          barWidth: '60%'
        }]
      })
    },
    initCharts() {
      // 初始化订单趋势图
      this.orderChart = echarts.init(this.$refs.orderChart)
      this.orderChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>订单数：{c}'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          name: '订单数'
        },
        series: [{
          data: this.mockData.orderTrend,
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }]
      })

      // 初始化园区流量图
      this.trafficChart = echarts.init(this.$refs.trafficChart)
      this.trafficChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['园内人数', '排队人数']
        },
        xAxis: {
          type: 'category',
          data: this.mockData.trafficData.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '人数'
        },
        series: [
          {
            name: '园内人数',
            type: 'bar',
            data: this.mockData.trafficData.map(item => item.currentPeople),
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '排队人数',
            type: 'bar',
            data: this.mockData.trafficData.map(item => item.queuePeople),
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      })

      // 初始化表演预订图
      this.performanceChart = echarts.init(this.$refs.performanceChart)
      this.performanceChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br/>预订数：{c}'
        },
        xAxis: {
          type: 'category',
          data: this.mockData.performanceNames,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '预订数'
        },
        series: [{
          data: this.mockData.performanceData,
          type: 'bar',
          barWidth: '60%'
        }]
      })
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    // 销毁图表实例
    this.orderChart && this.orderChart.dispose()
    this.trafficChart && this.trafficChart.dispose()
    this.performanceChart && this.performanceChart.dispose()
    this.incomeChart && this.incomeChart.dispose()
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.switch-row {
  margin-bottom: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.card-header i {
  font-size: 20px;
  margin-right: 10px;
  color: #409EFF;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-top: 20px;
}

.alert-list {
  height: 300px;
  overflow-y: auto;
}

.alert-item {
  padding: 15px;
  border-bottom: 1px solid #EBEEF5;
  transition: all 0.3s;
}

.alert-item:hover {
  background-color: #F5F7FA;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.alert-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.alert-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
</style> 