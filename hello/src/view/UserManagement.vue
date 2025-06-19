<template>
  <div id="user-management">
    <h2>游客信息管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      >
        <el-form-item label="用户名称:" prop="name">
          <el-input
            v-model.trim="searchForm.name"
            placeholder="请输入用户名称"
          />
        </el-form-item>
        <el-form-item label="手机号:" prop="phone">
          <el-input
            v-model.trim="searchForm.phone"
            placeholder="请输入手机号"
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
      <el-table-column prop="id" label="用户ID" width="80" fixed></el-table-column>
      <el-table-column label="用户名" width="100">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.name"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" width="100">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.realName"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.phone"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身份证号" width="150">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.idNumber"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.idNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="微信openid" width="150">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-input v-model="scope.row.openid" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.openid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="session_key" width="150">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-input v-model="scope.row.sessionKey" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.sessionKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.gender"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.gender }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户偏好" width="200">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model.lazy="scope.row.preference"
            size="mini"
            type="textarea"
          ></el-input>
          <span v-else>{{ scope.row.preference }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt }}</span>
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
    <el-dialog title="新增用户" :visible.sync="addDialogVisible" width="50%">
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input
            v-model.trim="addForm.name"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model.trim="addForm.realName"
            placeholder="请输入真实姓名"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model.trim="addForm.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input
            v-model.trim="addForm.idNumber"
            placeholder="请输入身份证号"
          />
        </el-form-item>
        <el-form-item label="微信openid" prop="openid">
          <el-input
            v-model.trim="addForm.openid"
            placeholder="请输入微信openid"
          />
        </el-form-item>
        <el-form-item label="session_key" prop="sessionKey">
          <el-input
            v-model.trim="addForm.sessionKey"
            placeholder="请输入session_key"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="addForm.gender" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户偏好" prop="preference">
          <el-input
            v-model="addForm.preference"
            type="textarea"
            placeholder="请输入用户偏好"
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

export default {
  data() {
    return {
      searchForm: {
        current: 1,
        size: 10,
        name: "",
        phone: "",
      },
      total: 0,
      tableData: [],
      isshow: [],
      originalRows: [], // 保存原始数据
      addDialogVisible: false, // 控制新增对话框的显示
      addForm: {
        name: "",
        realName: "",
        phone: "",
        idNumber: "",
        openid: "",
        sessionKey: "",
        gender: "男",
        preference: '{"interests": ["狮子"]}',
        createdAt: "",
      },
      addFormRules: {
        name: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
        phone: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "手机号格式不正确",
            trigger: "blur",
          },
        ],
        openid: [
          { required: true, message: "微信 openid 不能为空", trigger: "blur" },
        ],
        sessionKey: [
          { required: true, message: "session_key 不能为空", trigger: "blur" },
        ],
        idNumber: [
          { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: "身份证号格式不正确", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.handleSearch();
  },
  methods: {
    getPageList() {
      console.log('正在获取用户列表，参数：', this.searchForm);
      this.$axios
        .get("/api/admin/user/list", { params: this.searchForm })
        .then((res) => {
          console.log('获取用户列表响应：', res);
          if (res.data && res.data.data) {
            this.tableData = res.data.data || [];
            this.total = res.data.total || 0;
            this.searchForm.current = res.data.current || 1;
            this.isshow = new Array(this.tableData.length).fill(false);
            this.originalRows = JSON.parse(JSON.stringify(this.tableData));
          } else {
            this.$message.error('获取数据失败：响应数据格式错误');
          }
        })
        .catch((error) => {
          console.error("获取用户列表失败:", error);
          this.$message.error(`获取用户列表失败: ${error.message}`);
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
      window.open("/api/admin/user/download");
    },
    handleEdit(index, row) {
      this.$set(this.isshow, index, true);
    },
    handleCheck(index, row) {
      const updatedRow = { ...row };
      delete updatedRow.createdAt;

      // 获取原始数据
      const originalRow = this.originalRows[index];

      // 比较更新前后的数据
      if (
        updatedRow.name === originalRow.name &&
        updatedRow.realName === originalRow.realName &&
        updatedRow.phone === originalRow.phone &&
        updatedRow.idNumber === originalRow.idNumber &&
        updatedRow.openid === originalRow.openid &&
        updatedRow.sessionKey === originalRow.sessionKey &&
        updatedRow.gender === originalRow.gender &&
        updatedRow.preference === originalRow.preference
      ) {
        Message.warning("内容未改变");
        this.$set(this.isshow, index, false);
        return;
      }

      this.$axios
        .post("/api/admin/user/update", updatedRow)
        .then(() => {
          Message.success("更新成功");
          this.$set(this.isshow, index, false);
          this.handleSearch();
        })
        .catch((error) => {
          console.error("Error updating user:", error);
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
        name: "",
        realName: "",
        phone: "",
        idNumber: "",
        openid: "",
        sessionKey: "",
        gender: "男",
        preference: '{"interests": ["狮子"]}',
        createdAt: new Date().toISOString(),
      };
    },
    handleSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          // 创建一个新的对象，确保 preference 是字符串
          const formData = { ...this.addForm };

          this.$axios
            .post("/api/admin/user/add", formData)
            .then(() => {
              Message.success("新增成功");
              this.addDialogVisible = false;
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error adding user:", error);
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