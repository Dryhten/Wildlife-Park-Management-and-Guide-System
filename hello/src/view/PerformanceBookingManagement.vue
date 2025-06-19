<template>
    <div id="performance-booking-management">
      <h2>表演预订管理</h2>
  
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

          <el-form-item label="表演ID:" prop="performanceId">
            <el-input
              v-model.trim="searchForm.performanceId"
              placeholder="请输入表演ID"
            />
          </el-form-item>
        
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="handleSearch()"
              >查询</el-button
            >
            <el-button size="small" icon="el-icon-refresh" @click="handleClear()"
              >重置</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-download"
              size="small"
              @click="handledownload()"
              >下载</el-button
            >
            <!-- 新增按钮 -->
            <el-button type="success" icon="el-icon-plus" size="small" @click="handleAdd()"
              >新增</el-button
            >
          </el-form-item>
        </el-form>
        </el-row>
  
      <!-- 数据表格 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="预订ID" width="80" fixed></el-table-column>
      <el-table-column label="用户ID" width="120">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.userId"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.userName }}</span>
          </template>
        </el-table-column>
      <el-table-column label="表演ID" width="120">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.performanceId"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.performanceId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="表演名称" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.performanceName }}</span>
          </template>
        </el-table-column>
      <el-table-column label="预订时间" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.bookingTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预订状态" width="200">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-select v-model="scope.row.status" size="mini">
              <el-option
                v-for="status in statusOptions"
                :key="status"
                :label="status"
                :value="status"
              ></el-option>
            </el-select>
          </span>
          <span v-else>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template slot-scope="scope">
            <el-button
              v-if="isshow[scope.$index]"
              size="mini"
              type="success"
              icon="el-icon-check"
              @click="handleCheck(scope.$index, scope.row)"
              >保存</el-button
            >
            <el-button
              v-else
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
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
  
      <!-- 新增对话框 -->
      <el-dialog title="新增表演预订" :visible.sync="addDialogVisible" width="50%">
        <el-form
          ref="addForm"
          :model="addForm"
          :rules="addFormRules"
          label-width="120px"
        >
          <el-form-item label="用户ID" prop="userId">
            <el-input
              v-model.trim="addForm.userId"
              placeholder="请输入用户ID"
            />
          </el-form-item>
          <el-form-item label="表演ID" prop="performanceId">
            <el-input
              v-model.trim="addForm.performanceId"
              placeholder="请输入表演ID"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit()">添 加</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { Message, MessageBox } from "element-ui";
  import store from "@/store"; // 确保引入 Vuex store
  
  export default {
    data() {
      return {
        searchForm: {
          current: 1,
          size: 10,
          userId: "",
          performanceId: "",
        },
        total: 0,
        tableData: [],
        isshow: [],
        originalRows: [], // 保存原始数据
        addDialogVisible: false, // 控制新增对话框的显示
        addForm: {
          userId: "",
          performanceId: "",
          status: "Pending",
        },
        addFormRules: {
          userId: [{ required: true, message: "用户ID不能为空", trigger: "blur" }],
          performanceId: [
            { required: true, message: "表演ID不能为空", trigger: "blur" },
          ],
        },
        statusOptions: ['Pending', 'Confirmed', 'Cancelled'] // 根据后端状态选项进行调整
      };
    },
    computed: {
      // 判断是否为系统管理员
      isSystemAdmin() {
        const currentUser = store.state.user;
        return currentUser && currentUser.role === '1';
      }
    },
    created() {
      this.handleSearch();
    },
    methods: {
      getPageList() {
        this.$axios
          .get("/api/admin/performance_booking/list", { params: this.searchForm })
          .then((res) => {
            this.tableData = res.data.records || [];
            this.total = res.data.total || 0;
            this.isshow = new Array(this.tableData.length).fill(false);
            this.originalRows = JSON.parse(JSON.stringify(this.tableData)); // 保存原始数据
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      },
      handleSearch() {
        this.getPageList();
      },
      handleClear() {
        this.$refs.searchForm.resetFields();
        this.getPageList();
      },
      handledownload() {
        window.open("/api/admin/performance_booking/download");
      },
      handleEdit(index, row) {
        this.$set(this.isshow, index, true);
        
        // 如果不是系统管理员，对字段编辑进行限制
        if (!this.isSystemAdmin) {
          // 记住原始值以便在保存时恢复
          const originalUserId = this.tableData[index].userId;
          const originalPerformanceId = this.tableData[index].performanceId;
          
          // 监听变化，如果不是系统管理员尝试修改这些字段，则恢复原始值
          this.$watch(`tableData.${index}.userId`, (newVal) => {
            if (!this.isSystemAdmin && newVal !== originalUserId) {
              this.$set(this.tableData[index], 'userId', originalUserId);
              Message.warning('只有系统管理员才能修改用户ID');
            }
          });
          
          this.$watch(`tableData.${index}.performanceId`, (newVal) => {
            if (!this.isSystemAdmin && newVal !== originalPerformanceId) {
              this.$set(this.tableData[index], 'performanceId', originalPerformanceId);
              Message.warning('只有系统管理员才能修改表演ID');
            }
          });
        }
        // 系统管理员不受任何限制，可以编辑所有字段
      },
      handleCheck(index, row) {
        const updatedRow = { ...row };
        delete updatedRow.bookingTime; // 删除 bookingTime 字段，避免更新时发送
  
        // 获取原始数据
        const originalRow = this.originalRows[index];
  
        // 比较更新前后的数据
        if (
          updatedRow.userId === originalRow.userId &&
          updatedRow.performanceId === originalRow.performanceId &&
          updatedRow.status === originalRow.status
        ) {
          Message.warning("内容未改变");
          this.$set(this.isshow, index, false);
          return;
        }
  
        // 获取当前登录管理员的昵称
        const currentUser = store.state.user;
        const updatedBy = currentUser ? currentUser.nickname : "Unknown";
        // 设置更新时间和更新者
        updatedRow.updatedAt = new Date().toISOString();
        updatedRow.updatedBy = updatedBy;
  
        this.$axios
          .post("/api/admin/performance_booking/update", updatedRow)
          .then(() => {
            Message.success("更新成功");
            this.$set(this.isshow, index, false);
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error updating performance booking:", error);
          });
      },
      handleDelete(index, row) {
        MessageBox.confirm(
          '确定要删除该表演预订记录吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.$axios
            .post("/api/admin/performance-booking/delete", row)
            .then(() => {
              Message.success("删除成功");
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error deleting performance booking:", error);
            });
        }).catch(() => {
          Message.info('已取消删除');
        });
      },
      handleSizeChange(val) {
        this.searchForm.size = val;
        this.getPageList();
      },
      handleCurrentChange(val) {
        this.searchForm.current = val;
        this.getPageList();
      },
      handleAdd() {
        this.addDialogVisible = true;
        this.addForm = {
          userId: "",
          performanceId: "",
          status: "Pending",
        };
      },
      handleSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            const formData = { ...this.addForm };
  
            // 获取当前登录管理员的昵称
            const currentUser = store.state.user;
            const updatedBy = currentUser ? currentUser.nickname : "Unknown";
  
            // 设置更新时间和更新者
            formData.updatedAt = new Date().toISOString();
            formData.updatedBy = updatedBy;
  
            this.$axios
              .post("/api/admin/performance_booking/add", formData)
              .then(() => {
                Message.success("新增成功");
                this.addDialogVisible = false;
                this.handleSearch();
              })
              .catch((error) => {
                console.error("Error adding performance booking:", error);
              });
          } else {
            Message.error("填写的表单信息有误，请检查");
            return false;
          }
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .pagination {
    margin: 50px auto;
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  </style>
  