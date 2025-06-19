<template>
    <div id="safety-alert-management">
      <h2>安全预警管理</h2>
  
      <!-- 查询表单 -->
      <el-row type="flex" justify="space-between">
        <el-form
          ref="searchForm"
          :model="searchForm"
          size="small"
          class="demo-form-inline"
          inline
        >
          <el-form-item label="用户名称:" prop="userName">
            <el-input
              v-model.trim="searchForm.userName"
              placeholder="请输入用户名称"
            />
          </el-form-item>
          <el-form-item label="危险区域名称:" prop="dangerZoneName">
            <el-input
              v-model.trim="searchForm.dangerZoneName"
              placeholder="请输入危险区域名称"
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
        <el-table-column prop="id" label="预警ID" width="80" fixed></el-table-column>
        <!-- <el-table-column label="用户ID" width="120">
          <template slot-scope="scope">
            <el-input
              v-if="isshow[scope.$index]"
              v-model="scope.row.userId"
              size="mini"
            ></el-input>
            <span v-else>{{ scope.row.userId }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="用户名称" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="危险区域名称" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.dangerZoneName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险级别" width="100">
          <template slot-scope="scope">
            <el-tag :type="getRiskLevelType(scope.row.riskLevel)">
              {{ getRiskLevelText(scope.row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警时间" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.alertTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="200">
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
      <el-dialog title="新增安全预警" :visible.sync="addDialogVisible" width="50%">
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
          <el-form-item label="危险区域ID" prop="zoneId">
            <el-input
              v-model.trim="addForm.zoneId"
              placeholder="请输入危险区域ID"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="addForm.status">
              <el-option
                v-for="status in statusOptions"
                :key="status"
                :label="status"
                :value="status"
              ></el-option>
            </el-select>
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
  import { mapState } from 'vuex';
  
  export default {
    data() {
      return {
        searchForm: {
          current: 1,
          size: 10,
          userName: "",
          dangerZoneName: "",
        },
        total: 0,
        tableData: [],
        isshow: [],
        originalRows: [], // 保存原始数据
        addDialogVisible: false, // 控制新增对话框的显示
        addForm: {
          userId: "",
          zoneId: "",
          status: "",
          alertTime: new Date().toISOString(), // 使用 alertTime 替换 createdAt
        },
        addFormRules: {
          userId: [{ required: true, message: "用户ID不能为空", trigger: "blur" }],
          zoneId: [
            { required: true, message: "危险区域ID不能为空", trigger: "blur" },
          ],
          status: [
            { required: true, message: "状态不能为空", trigger: "blur" },
          ],
        },
        statusOptions: ['Active', 'Resolved'] // 根据后端状态选项进行调整
      };
    },
    created() {
      this.handleSearch();
    },
    computed: {
      ...mapState('user', ['userInfo']),
      isSystemAdmin() {
        return this.userInfo && this.userInfo.role === '1';
      }
    },
    methods: {
      // 获取风险级别的文本描述
      getRiskLevelText(riskLevel) {
        switch(riskLevel) {
          case 1: return '低风险';
          case 2: return '中风险';
          case 3: return '高风险';
          default: return '未知';
        }
      },
      // 获取风险级别的标签类型
      getRiskLevelType(riskLevel) {
        switch(riskLevel) {
          case 1: return 'info';
          case 2: return 'warning';
          case 3: return 'danger';
          default: return '';
        }
      },
      getPageList() {
        this.$axios
          .get("/api/admin/safety_alert/list", { params: this.searchForm })
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
        window.open("/api/admin/safety_alert/download");
      },
      handleEdit(index, row) {
        this.$set(this.isshow, index, true);
        
        // 如果不是系统管理员，对字段编辑进行限制
        if (!this.isSystemAdmin) {
          // 记住原始值，确保非系统管理员不能修改关键字段
          const originalUserId = this.tableData[index].userId;
          const originalZoneId = this.tableData[index].zoneId;
          
          // 监听userId变化
          this.$watch(`tableData.${index}.userId`, (newVal) => {
            if (newVal !== originalUserId) {
              this.$set(this.tableData[index], 'userId', originalUserId);
              Message.warning('只有系统管理员才能修改用户ID');
            }
          });
          
          // 监听zoneId变化
          this.$watch(`tableData.${index}.zoneId`, (newVal) => {
            if (newVal !== originalZoneId) {
              this.$set(this.tableData[index], 'zoneId', originalZoneId);
              Message.warning('只有系统管理员才能修改危险区域ID');
            }
          });
        }
        // 系统管理员不受任何限制，可以编辑所有字段
      },
      handleCheck(index, row) {
        const updatedRow = { ...row };
        delete updatedRow.alertTime; // 删除 alertTime 字段，避免更新时发送
  
        // 获取原始数据
        const originalRow = this.originalRows[index];
  
        // 比较更新前后的数据
        if (
          updatedRow.userId === originalRow.userId &&
          updatedRow.zoneId === originalRow.zoneId &&
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
          .post("/api/admin/safety_alert/update", updatedRow)
          .then(() => {
            Message.success("更新成功");
            this.$set(this.isshow, index, false);
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error updating safety alert:", error);
          });
      },
      handleDelete(index, row) {
        MessageBox.confirm(
          '确定要删除该安全预警记录吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.$axios
            .post("/api/admin/safety_alert/delete", row)
            .then(() => {
              Message.success("删除成功");
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error deleting safety alert:", error);
              Message.error("删除失败：" + (error.response?.data?.message || "未知错误"));
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
          zoneId: "",
          status: "",
          alertTime: new Date().toISOString(),
        };
      },
      handleSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            const formData = { ...this.addForm };
            delete formData.alertTime; // 删除 alertTime 字段，避免发送
  
            // 获取当前登录管理员的昵称
            const currentUser = store.state.user;
            const updatedBy = currentUser ? currentUser.nickname : "Unknown";
  
            // 设置更新时间和更新者
            formData.updatedAt = new Date().toISOString();
            formData.updatedBy = updatedBy;
  
            this.$axios
              .post("/api/admin/safety_alert/add", formData)
              .then(() => {
                Message.success("新增成功");
                this.addDialogVisible = false;
                this.handleSearch();
              })
              .catch((error) => {
                console.error("Error adding safety alert:", error);
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