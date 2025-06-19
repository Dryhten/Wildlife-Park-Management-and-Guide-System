<template>
  <div id="park-traffic-management">
    <h2>园区流量管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      >
        <el-form-item label="园区:" prop="parkId">
          <el-select v-model="searchForm.parkId" placeholder="选择园区" clearable>
            <el-option v-for="park in parks" :key="park.id" :label="park.name" :value="park.id"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleSearch()"
          >查询</el-button>
          <el-button 
            size="small" 
            icon="el-icon-refresh" 
            @click="handleClear()"
          >重置</el-button>
          <el-button
            type="success"
            icon="el-icon-refresh"
            size="small"
            @click="getPageList()"
          >刷新数据</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" fixed></el-table-column>
      <el-table-column prop="parkId" label="园区ID" width="100"></el-table-column>
      <el-table-column prop="parkName" label="园区名称" width="150"></el-table-column>
      <el-table-column label="当前人数" width="150">
        <template slot-scope="scope">
          <el-tag :type="getPeopleCountType(scope.row.currentPeople)">
            {{ scope.row.currentPeople }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排队人数" width="150">
        <template slot-scope="scope">
          <el-tag :type="getQueueCountType(scope.row.queuePeople)">
            {{ scope.row.queuePeople }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180"></el-table-column>
    </el-table>

    <!-- 更新对话框 -->
    <el-dialog title="更新园区流量" :visible.sync="dialogVisible" width="40%">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="当前人数" prop="currentPeople">
          <el-input-number v-model="form.currentPeople" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="排队人数" prop="queuePeople">
          <el-input-number v-model="form.queuePeople" :min="0"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
import store from "@/store";

export default {
  name: 'ParkTrafficManagement',
  data() {
    return {
      searchForm: {
        parkId: ''
      },
      loading: false,
      dialogVisible: false,
      tableData: [],
      parks: [],
      form: {
        id: '',
        parkId: '',
        currentPeople: 0,
        queuePeople: 0
      },
      rules: {
        currentPeople: [{ required: true, message: '请输入当前人数', trigger: 'blur' }],
        queuePeople: [{ required: true, message: '请输入排队人数', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getParks()
    this.getPageList()
  },
  methods: {
    getParks() {
      this.$axios.get("/api/admin/park/list").then(res => {
        this.parks = res.data.records || []
      }).catch(error => {
        console.error("Error fetching parks:", error)
      })
    },
    getPageList() {
      this.loading = true
      const params = {
        parkId: this.searchForm.parkId
      }
      this.$axios.get("/api/admin/park_traffic/list", { params })
        .then(res => {
          this.tableData = res.data.records || []
          this.loading = false
        })
        .catch(error => {
          console.error("Error fetching data:", error)
          this.loading = false
        })
    },
    getPeopleCountType(count) {
      if (count >= 1000) return 'danger'
      if (count >= 500) return 'warning'
      return 'success'
    },
    getQueueCountType(count) {
      if (count >= 100) return 'danger'
      if (count >= 50) return 'warning'
      return 'success'
    },
    handleSearch() {
      this.getPageList()
    },
    handleClear() {
      this.$refs.searchForm.resetFields()
      this.getPageList()
    },
    handleUpdate(row) {
      this.form = { ...row }
      this.dialogVisible = true
    },
    
  }
}
</script>

<style scoped>
.pagination {
  margin: 50px auto;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.demo-form-inline {
  margin: 20px 0;
}
</style> 