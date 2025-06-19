<template>
  <div id="animal-management">
    <h2>动物资料管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      >
        <el-form-item label="动物名称:" prop="name">
          <el-input
            v-model.trim="searchForm.name"
            placeholder="请输入动物名称"
          />
        </el-form-item>
        <el-form-item label="栖息地:" prop="habitat">
          <el-input
            v-model.trim="searchForm.habitat"
            placeholder="请输入栖息地"
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
      <el-table-column prop="id" label="动物ID" width="80" fixed></el-table-column>
      <el-table-column label="动物名称" width="120">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.name"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="栖息地" width="120">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model="scope.row.habitat"
            size="mini"
          ></el-input>
          <span v-else>{{ scope.row.habitat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="动物拉丁学名" width="200">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-input v-model="scope.row.scientificName" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.scientificName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="习性" width="200">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-input v-model="scope.row.behavior" size="mini" type="textarea"></el-input>
          </span>
          <span v-else>{{ scope.row.behavior }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保护状态" width="200">
        <template slot-scope="scope">
          <span v-if="isshow[scope.$index]">
            <el-select v-model="scope.row.conservationStatus" size="mini">
              <el-option
                v-for="status in conservationStatusOptions"
                :key="status"
                :label="status"
                :value="status"
              ></el-option>
            </el-select>
          </span>
          <span v-else>{{ scope.row.conservationStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="动物介绍" width="200">
        <template slot-scope="scope">
          <el-input
            v-if="isshow[scope.$index]"
            v-model.lazy="scope.row.description"
            size="mini"
            type="textarea"
          ></el-input>
          <span v-else>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="创建时间" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt }}</span>
        </template>
      </el-table-column> -->
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
    <el-dialog title="新增动物" :visible.sync="addDialogVisible" width="50%">
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="动物名称" prop="name">
          <el-input
            v-model.trim="addForm.name"
            placeholder="请输入动物名称"
          />
        </el-form-item>
        <el-form-item label="栖息地" prop="habitat">
          <el-input
            v-model.trim="addForm.habitat"
            placeholder="请输入栖息地"
          />
        </el-form-item>
        <el-form-item label="动物拉丁学名" prop="scientificName">
          <el-input
            v-model.trim="addForm.scientificName"
            placeholder="请输入动物拉丁学名"
          />
        </el-form-item>
        <el-form-item label="习性" prop="behavior">
          <el-input
            v-model.trim="addForm.behavior"
            placeholder="请输入习性"
          />
        </el-form-item>
        <el-form-item label="保护状态" prop="conservationStatus">
          <el-select v-model="addForm.conservationStatus">
            <el-option
              v-for="status in conservationStatusOptions"
              :key="status"
              :label="status"
              :value="status"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="动物介绍" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            placeholder="请输入动物介绍"
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
import { mapState } from 'vuex';

export default {
  data() {
    return {
      searchForm: {
        current: 1,
        size: 10,
        name: "",
        habitat: "",
      },
      total: 0,
      tableData: [],
      isshow: [],
      originalRows: [], // 保存原始数据
      addDialogVisible: false, // 控制新增对话框的显示
      addForm: {
        name: "",
        habitat: "",
        scientificName: "",
        behavior: "",
        conservationStatus: "",
        description: "",
        createdAt: "",
      },
      addFormRules: {
        name: [{ required: true, message: "动物名称不能为空", trigger: "blur" }],
        habitat: [
          { required: true, message: "栖息地不能为空", trigger: "blur" },
        ],
        scientificName: [
          { required: true, message: "动物拉丁学名不能为空", trigger: "blur" },
        ],
        behavior: [
          { required: true, message: "习性不能为空", trigger: "blur" },
        ],
        conservationStatus: [
          { required: true, message: "保护状态不能为空", trigger: "blur" },
        ],
      },
      conservationStatusOptions: ['Extinct', 'Endangered', 'Vulnerable', 'Least Concern'] // 添加保护状态选项
    };
  },
  computed: {
    ...mapState('user', ['userInfo']),
    isSystemAdmin() {
      return this.userInfo && this.userInfo.role === '1';
    }
  },
  created() {
    this.handleSearch();
  },
  methods: {
    getPageList() {
      console.log('正在获取动物列表，参数：', this.searchForm);
      this.$axios
        .get("/api/admin/animal/list", { params: this.searchForm })
        .then((res) => {
          console.log('获取动物列表响应：', res);
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
          console.error("获取动物列表失败:", error);
          this.$message.error(`获取动物列表失败: ${error.message}`);
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
      window.open("/api/admin/animal/download");
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
        updatedRow.habitat === originalRow.habitat &&
        updatedRow.scientificName === originalRow.scientificName &&
        updatedRow.behavior === originalRow.behavior &&
        updatedRow.conservationStatus === originalRow.conservationStatus &&
        updatedRow.description === originalRow.description
      ) {
        Message.warning("内容未改变");
        this.$set(this.isshow, index, false);
        return;
      }

      this.$axios
        .post("/api/admin/animal/update", updatedRow)
        .then(() => {
          Message.success("更新成功");
          this.$set(this.isshow, index, false);
          this.handleSearch();
        })
        .catch((error) => {
          console.error("Error updating animal:", error);
        });
    },
    handleDelete(index, row) {
      MessageBox.confirm(
        '确定要删除该动物信息吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .post("/api/admin/animal/delete", row)
          .then(() => {
            Message.success("删除成功");
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error deleting animal:", error);
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
        name: "",
        habitat: "",
        scientificName: "",
        behavior: "",
        conservationStatus: "",
        description: "",
        createdAt: new Date().toISOString(),
      };
    },
    handleSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          const formData = { ...this.addForm };
          delete formData.createdAt;
          this.$axios
            .post("/api/admin/animal/add", formData)
            .then(() => {
              Message.success("新增成功");
              this.addDialogVisible = false;
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error adding animal:", error);
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