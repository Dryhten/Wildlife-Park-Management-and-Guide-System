<template>
  <div>
    <h2>宠物病历数据统计</h2>
    <el-row :gutter="30">
      <!-- 柱状图：不同宠物类型数量 -->
      <el-col :span="8">
        <div ref="typeChart" style="height: 400px; width: 100%;"></div>
      </el-col>
      
      <!-- 饼图：宠物性别占比 -->
      <el-col :span="8">
        <div ref="sexChart" style="height: 400px; width: 100%;"></div>
      </el-col>
      
      <!-- 折线图：每日就诊数量趋势 -->
      <el-col :span="8">
        <div ref="visitChart" style="height: 400px; width: 100%;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';
import { nextTick } from 'vue';

export default {
  name: 'Echarts',
  data() {
    return {
      typeChart: null, // 柱状图
      sexChart: null,  // 饼图
      visitChart: null // 折线图
    };
  },
  mounted() {
    nextTick(() => {
      this.fetchData();
    });
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.typeChart) this.typeChart.dispose();
    if (this.sexChart) this.sexChart.dispose();
    if (this.visitChart) this.visitChart.dispose();
  },
  methods: {
    // 获取后端数据
    fetchData() {
      axios.get('/api/pet/statistics').then(response => {
        const { typeData, sexData, visitData } = response.data;
        this.initTypeChart(typeData);
        this.initSexChart(sexData);
        this.initVisitChart(visitData);
      }).catch(error => {
        console.error("数据加载失败：", error);
      });
    },

    // 初始化柱状图：不同宠物类型数量
    initTypeChart(typeData) {
      this.typeChart = echarts.init(this.$refs.typeChart);
      const option = {
        title: { text: '不同宠物类型数量统计' },
        xAxis: { type: 'category', data: typeData.map(item => item.type) },
        yAxis: {
          type: 'value',
          interval: 1,  // 设置刻度间距为1
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: typeData.map(item => item.count)
        }]
      };
      this.typeChart.setOption(option);
    },

    // 初始化饼图：宠物性别占比
    initSexChart(sexData) {
      this.sexChart = echarts.init(this.$refs.sexChart);
      const option = {
        title: { text: '宠物性别占比' },
        series: [{
          name: '性别占比',
          type: 'pie',
          radius: '50%',
          data: sexData.map(item => ({ name: item.sex, value: item.count }))
        }]
      };
      this.sexChart.setOption(option);
    },

    // 初始化折线图：每日就诊数量趋势
    initVisitChart(visitData) {
      this.visitChart = echarts.init(this.$refs.visitChart);
      const option = {
        title: { text: '每日就诊数量趋势' },
        xAxis: { type: 'category', data: visitData.map(item => item.date) },
        yAxis: { type: 'value', interval: 1 },
        series: [{
          name: '就诊数量',
          type: 'line',
          data: visitData.map(item => item.count)
        }]
      };
      this.visitChart.setOption(option);
    }
  }
};
</script>

<style scoped>
h2 {
  text-align: center;
  margin: 50px auto;
}

.el-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.el-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
