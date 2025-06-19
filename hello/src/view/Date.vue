<template>
  <div class="chart-container">
    <el-row :gutter="30"> <!-- 确保 gutter 是数字 -->
      <el-col :span="24"> <!-- span 值应在 1 到 24 之间 -->
        <Echarts :option="option" style="width: 1000px" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Echarts from "../components/Echarts.vue";

export default {
  components: {
    Echarts,
  },
  data() {
    return {
      option: { // 初始化 option 属性
      }
    };
  },
  created: function () {
    // 可以在这里添加初始化逻辑
  },
  methods: {}
}
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
}
</style>