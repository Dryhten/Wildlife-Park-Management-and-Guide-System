<template>
  <div class="performance-management">
    <h2 class="title">动物表演管理</h2>
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="园区ID:" prop="parkId">
          <el-input
            v-model.trim="searchForm.parkId"
            placeholder="请输入园区ID"
          />
        </el-form-item>
        <el-form-item label="表演名称:" prop="title">
          <el-input
            v-model.trim="searchForm.title"
            placeholder="请输入表演名称"
          />
        </el-form-item>
        <el-form-item label="状态:" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="正常" :value="1" />
            <el-option label="取消" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="operation-bar">
      <el-button type="primary" @click="showAddDialog">添加表演</el-button>
      <el-button type="success" @click="handleDownload">导出Excel</el-button>
    </div>

    <el-table :data="performanceList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="表演名称" />
      <el-table-column prop="duration" label="演出时长" width="120" />
      <el-table-column prop="location" label="演出地点" />
      <el-table-column prop="showTime" label="表演时间" width="120" />
      <el-table-column prop="showDate" label="表演日期" width="120" />
      <el-table-column prop="maxCapacity" label="最大容量" width="100" />
      <el-table-column prop="currentBookings" label="当前预约" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button 
            size="mini" 
            type="primary" 
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button 
            size="mini" 
            type="danger" 
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="performanceForm" :rules="rules" ref="performanceForm" label-width="100px">
        <el-form-item label="表演名称" prop="title">
          <el-input v-model="performanceForm.title" />
        </el-form-item>
        <el-form-item label="演出时长" prop="duration">
          <el-input v-model="performanceForm.duration" />
        </el-form-item>
        <el-form-item label="演出地点" prop="location">
          <el-input v-model="performanceForm.location" />
        </el-form-item>
        <el-form-item label="表演时间" prop="showTime">
          <el-time-picker v-model="performanceForm.showTime" format="HH:mm" />
        </el-form-item>
        <el-form-item label="表演日期" prop="showDate">
          <el-date-picker v-model="performanceForm.showDate" type="date" />
        </el-form-item>
        <el-form-item label="最大容量" prop="maxCapacity">
          <el-input-number v-model="performanceForm.maxCapacity" :min="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="performanceForm.status">
            <el-option label="正常" :value="1" />
            <el-option label="取消" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="表演简介" prop="description">
          <el-input type="textarea" v-model="performanceForm.description" />
        </el-form-item>
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input v-model="performanceForm.imageUrl" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message, MessageBox } from "element-ui";

export default {
  name: 'PerformanceManagement',
  data() {
    return {
      searchForm: {
        parkId: '',
        title: '',
        status: ''
      },
      performanceList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '',
      performanceForm: {
        title: '',
        duration: '',
        location: '',
        showTime: '',
        showDate: '',
        maxCapacity: 1,
        status: 1,
        description: '',
        imageUrl: '',
        parkId: ''
      },
      rules: {
        title: [{ required: true, message: '请输入表演名称', trigger: 'blur' }],
        duration: [{ required: true, message: '请输入演出时长', trigger: 'blur' }],
        location: [{ required: true, message: '请输入演出地点', trigger: 'blur' }],
        showTime: [{ required: true, message: '请选择表演时间', trigger: 'change' }],
        showDate: [{ required: true, message: '请选择表演日期', trigger: 'change' }],
        maxCapacity: [{ required: true, message: '请输入最大容量', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await this.$axios.get('/api/admin/performance/list', {
          params: {
            current: this.currentPage,
            size: this.pageSize,
            ...this.searchForm
          }
        })
        this.performanceList = response.data.records
        this.total = response.data.total
      } catch (error) {
        console.error('获取表演列表失败:', error)
        this.$message.error('获取表演列表失败')
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    resetSearch() {
      this.searchForm = {
        parkId: '',
        title: '',
        status: ''
      }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    showAddDialog() {
      this.dialogTitle = '添加表演'
      this.performanceForm = {
        title: '',
        duration: '',
        location: '',
        showTime: '',
        showDate: '',
        maxCapacity: 1,
        status: 1,
        description: '',
        imageUrl: '',
        parkId: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑表演'
      this.performanceForm = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      MessageBox.confirm(
        '确定要删除该表演信息吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .post("/api/admin/performance/delete", row)
          .then(() => {
            Message.success("删除成功");
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error deleting performance:", error);
          });
      }).catch(() => {
        Message.info('已取消删除');
      });
    },
    async handleSubmit() {
      try {
        await this.$refs.performanceForm.validate()
        const url = this.dialogTitle === '添加表演' ? '/api/admin/performance/add' : '/api/admin/performance/update'
        const response = await this.$axios.post(url, this.performanceForm)
        if (response.data === 'success') {
          this.$message.success(this.dialogTitle === '添加表演' ? '添加成功' : '更新成功')
          this.dialogVisible = false
          this.fetchData()
        } else {
          this.$message.error(this.dialogTitle === '添加表演' ? '添加失败' : '更新失败')
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        this.$message.error('提交失败')
      }
    },
    async handleDownload() {
      try {
        const response = await this.$axios.get('/api/admin/performance/download', {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '表演信息.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败')
      }
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
.performance-management {
  padding: 20px;
}
.search-bar {
  margin-bottom: 20px;
}
.operation-bar {
  margin-bottom: 20px;
}
.el-pagination {
  margin-top: 20px;
  text-align: right;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
  