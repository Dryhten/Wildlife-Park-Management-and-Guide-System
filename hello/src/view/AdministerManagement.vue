<template>
  <div id="administer-management">
    <h2>管理员账户管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      >
        <el-form-item label="用户名:" prop="username">
          <el-input
            v-model.trim="searchForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="昵称:" prop="nickname">
          <el-input
            v-model.trim="searchForm.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleSearch()"
          >查询</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="handleClear()"
            >重置</el-button>
          <!-- 新增按钮 -->
          <el-button type="success" icon="el-icon-plus" size="small" @click="handleAdd()"
            >新增</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" fixed></el-table-column>
      <el-table-column label="用户名" width="150">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.username"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="150">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.nickname"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限" width="150">
        <template slot-scope="scope">
          <el-select v-if="isshow[scope.$index]" v-model="scope.row.role" size="mini">
            <el-option label="园区管理员" value="0"></el-option>
            <el-option label="系统管理员" value="1"></el-option>
          </el-select>
          <el-tag v-else :type="scope.row.role === '1' ? 'danger' : 'primary'">
            {{ scope.row.role === '1' ? '系统管理员' : '园区管理员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="250">
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
            type="warning"
            @click="handleResetPwd(scope.$index, scope.row)"
          >重置密码</el-button>
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

    <!-- 新增对话框 -->
    <el-dialog title="新增管理员" :visible.sync="addDialogVisible" width="50%">
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model.trim="addForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model.trim="addForm.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model.trim="addForm.password"
            placeholder="请输入密码"
            type="password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model.trim="addForm.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
          />
        </el-form-item>
        <el-form-item label="权限" prop="role">
          <el-select v-model="addForm.role" placeholder="请选择权限">
            <el-option label="园区管理员" value="0"></el-option>
            <el-option label="系统管理员" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit()">添 加</el-button>
      </span>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog title="重置密码" :visible.sync="resetPwdDialogVisible" width="40%">
      <el-form
        ref="resetPwdForm"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="120px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model.trim="resetPwdForm.newPassword"
            placeholder="请输入新密码"
            type="password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model.trim="resetPwdForm.confirmPassword"
            placeholder="请再次输入新密码"
            type="password"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitResetPwd()">确 定</el-button>
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
    // 验证两次密码是否一致
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.addForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
    const validateResetConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
    return {
      searchForm: {
        current: 1,
        size: 10,
        username: "",
        nickname: "",
      },
      total: 0,
      tableData: [],
      isshow: [],
      originalRows: [], // 保存原始数据
      addDialogVisible: false, // 控制新增对话框的显示
      addForm: {
        username: "",
        nickname: "",
        password: "",
        confirmPassword: "",
        role: "0", // 默认为园区管理员
      },
      addFormRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: "昵称不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" }
        ],
        role: [
          { required: true, message: "请选择权限", trigger: "change" }
        ]
      },
      resetPwdDialogVisible: false,
      resetPwdForm: {
        id: "",
        newPassword: "",
        confirmPassword: ""
      },
      resetPwdRules: {
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: validateResetConfirmPassword, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleSearch();
  },
  computed: {
    ...mapState(['user']),
    isSystemAdmin() {
      return this.user && this.user.role === '1';
    }
  },
  methods: {
    getPageList() {
      this.$axios
        .get("/api/admin/list", { params: this.searchForm })
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
    handleEdit(index, row) {
      // 检查当前用户是否是系统管理员
      if (!this.isSystemAdmin) {
        Message.warning("只有系统管理员才能编辑管理员信息");
        return;
      }
      this.$set(this.isshow, index, true);
    },
    handleCheck(index, row) {
      const updatedRow = { ...row };
      
      // 获取原始数据
      const originalRow = this.originalRows[index];
      
      // 比较更新前后的数据
      if (
        updatedRow.username === originalRow.username &&
        updatedRow.nickname === originalRow.nickname &&
        updatedRow.role === originalRow.role
      ) {
        Message.warning("内容未改变");
        this.$set(this.isshow, index, false);
        return;
      }
      
      this.$axios
        .post("/api/admin/administrator/update", updatedRow)
        .then(() => {
          Message.success("更新成功");
          this.$set(this.isshow, index, false);
          this.handleSearch();
        })
        .catch((error) => {
          console.error("Error updating administrator:", error);
        });
    },
    handleDelete(index, row) {
      MessageBox.confirm(
        '确定要删除该管理员吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .post("/api/admin/administrator/delete", { id: row.id })
          .then(() => {
            Message.success("删除成功");
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error deleting administrator:", error);
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
      // 检查当前用户是否是系统管理员
      if (!this.isSystemAdmin) {
        Message.warning("只有系统管理员才能添加管理员");
        return;
      }
      
      this.addDialogVisible = true;
      this.addForm = {
        username: "",
        nickname: "",
        password: "",
        confirmPassword: "",
        role: "0",
      };
    },
    handleSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          const formData = { 
            username: this.addForm.username,
            nickname: this.addForm.nickname,
            password: this.addForm.password,
            role: this.addForm.role
          };
          
          this.$axios
            .post("/api/admin/administrator/add", formData)
            .then(() => {
              Message.success("新增成功");
              this.addDialogVisible = false;
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error adding administrator:", error);
            });
        } else {
          Message.error("填写的表单信息有误，请检查");
          return false;
        }
      });
    },
    handleResetPwd(index, row) {
      // 检查row对象是否存在
      if (!row) {
        Message.error("无法获取管理员信息");
        return;
      }
      
      // 检查当前用户是否是系统管理员或当前登录用户
      if (!this.isSystemAdmin && this.user.id !== row.id) {
        Message.warning("只有系统管理员或本人才能重置密码");
        return;
      }
      
      this.resetPwdDialogVisible = true;
      this.resetPwdForm = {
        id: row.id,
        newPassword: "",
        confirmPassword: ""
      };
    },
    submitResetPwd() {
      this.$refs.resetPwdForm.validate((valid) => {
        if (valid) {
          this.$axios
            .post("/api/admin/administrator/resetPassword", {
              id: this.resetPwdForm.id,
              newPassword: this.resetPwdForm.newPassword
            })
            .then(() => {
              Message.success("密码重置成功");
              this.resetPwdDialogVisible = false;
            })
            .catch((error) => {
              console.error("Error resetting password:", error);
            });
        } else {
          return false;
        }
      });
    }
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