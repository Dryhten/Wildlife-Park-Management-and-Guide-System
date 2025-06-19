<template>
  <div id="user-preference-management">
    <h2>用户偏好管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      >
        <el-form-item label="用户ID:" prop="userId">
          <el-input
            v-model.trim="searchForm.userId"
            placeholder="请输入用户ID"
          />
        </el-form-item>
        <el-form-item label="出行方式:" prop="transportMode">
          <el-select v-model="searchForm.transportMode" placeholder="选择出行方式" clearable>
            <el-option label="步行" value="步行"/>
            <el-option label="公交" value="公交"/>
            <el-option label="自驾" value="自驾"/>
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
          <el-button
            type="primary"
            icon="el-icon-download"
            size="small"
            @click="handleDownload()"
          >导出数据</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" fixed></el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="userName" label="用户名称" width="120"></el-table-column>
      <el-table-column label="个性化推荐" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isPersonalized"
            :disabled="!isshow[scope.$index]"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="出行方式" width="120">
        <template slot-scope="scope">
          <el-select 
            v-if="isshow[scope.$index]"
            v-model="scope.row.transportMode" 
            placeholder="选择出行方式"
            size="mini"
          >
            <el-option label="步行" value="步行"></el-option>
            <el-option label="公交" value="公交"></el-option>
            <el-option label="自驾" value="自驾"></el-option>
          </el-select>
          <span v-else>{{ scope.row.transportMode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="喜爱动物" width="300">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.favoriteAnimals"
            size="mini"
            type="textarea"
          ></el-input>
          <span v-else>{{ scope.row.favoriteAnimals }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180"></el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button
            v-if="isshow[scope.$index]"
            size="mini"
            type="success"
            icon="el-icon-check"
            @click="handleCheck(scope.$index, scope.row)"
          >保存</el-button>
          <el-button
            v-else
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      layout="->,total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 40]"
      :current-page="searchForm.current"
      :page-size="searchForm.size"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { Message, MessageBox } from "element-ui";
import store from "@/store"; // 确保引入 Vuex store
import { mapState } from 'vuex';

export default {
  name: 'UserPreferenceManagement',
  data() {
    return {
      searchForm: {
        current: 1,
        size: 10,
        userId: '',
        transportMode: ''
      },
      loading: false,
      total: 0,
      tableData: [],
      isshow: [],
      originalRows: [] // 保存原始数据
    }
  },
  computed: {
    ...mapState('user', ['userInfo']),
    isSystemAdmin() {
      return this.userInfo && this.userInfo.role === '1';
    }
  },
  created() {
    this.getPageList()
  },
  methods: {
    getPageList() {
      this.loading = true
      const params = {
        ...this.searchForm
      }
      this.$axios.get("/api/admin/user-preference/list", { params })
        .then(res => {
          if (res.data.success) {
            this.tableData = res.data.records
            this.total = res.data.total
            this.isshow = new Array(this.tableData.length).fill(false)
            this.originalRows = JSON.parse(JSON.stringify(this.tableData))
          } else {
            Message.error(res.data.message || '获取用户偏好列表失败')
          }
          this.loading = false
        })
        .catch(error => {
          console.error("Error fetching preferences:", error)
          Message.error('获取用户偏好列表失败')
          this.loading = false
        })
    },
    handleSearch() {
      this.searchForm.current = 1
      this.getPageList()
    },
    handleClear() {
      this.$refs.searchForm.resetFields()
      this.getPageList()
    },
    handleSizeChange(val) {
      this.searchForm.size = val
      this.getPageList()
    },
    handleCurrentChange(val) {
      this.searchForm.current = val
      this.getPageList()
    },
    handleEdit(index, row) {
      this.$set(this.isshow, index, true)
      
      // 如果不是系统管理员，对字段编辑进行限制
      if (!this.isSystemAdmin) {
        // 记住原始值，确保非系统管理员不能修改关键字段
        const originalUserId = this.tableData[index].userId;
        
        // 监听userId变化
        this.$watch(`tableData.${index}.userId`, (newVal) => {
          if (!this.isSystemAdmin && newVal !== originalUserId) {
            this.$set(this.tableData[index], 'userId', originalUserId);
            Message.warning('只有系统管理员才能修改用户ID');
          }
        });
      }
      // 系统管理员不受任何限制，可以编辑所有字段
    },
    handleCheck(index, row) {
      const updatedRow = { ...row }
      delete updatedRow.createdAt
      delete updatedRow.updatedAt
      delete updatedRow.userName

      // 获取原始数据
      const originalRow = this.originalRows[index]

      // 比较更新前后的数据
      if (
        updatedRow.isPersonalized === originalRow.isPersonalized &&
        updatedRow.transportMode === originalRow.transportMode &&
        updatedRow.favoriteAnimals === originalRow.favoriteAnimals
      ) {
        Message.warning("内容未改变")
        this.$set(this.isshow, index, false)
        return
      }

      this.$axios.post("/api/admin/user-preference/update", updatedRow)
        .then(res => {
          if (res.data.success) {
            Message.success('更新成功')
            this.$set(this.isshow, index, false)
            this.getPageList()
          } else {
            Message.error(res.data.message || '更新失败')
          }
        })
        .catch(error => {
          console.error("Error updating preference:", error)
          Message.error('更新失败')
        })
    },
    handleDelete(index, row) {
      MessageBox.confirm(
        '确定要删除该用户偏好记录吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .post("/api/admin/user-preference/delete", { id: row.id })
          .then(() => {
            Message.success("删除成功");
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error deleting user preference:", error);
          });
      }).catch(() => {
        Message.info('已取消删除');
      });
    },
    handleDownload() {
      window.open("/api/admin/user-preference/download")
    }
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