<template>
    <div id="feedback-management">
      <h2>游客反馈管理</h2>
  
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
          <el-form-item label="联系方式:" prop="contact">
            <el-input
              v-model.trim="searchForm.contact"
              placeholder="请输入联系方式"
            />
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
              type="primary"
              icon="el-icon-download"
              size="small"
              @click="handledownload()"
            >下载</el-button>
            <el-button
              type="success"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd()"
            >新增</el-button>
          </el-form-item>
        </el-form>
      </el-row>
  
      <!-- 数据表格 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="反馈ID" width="80" fixed></el-table-column>
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
        <el-table-column label="用户名称" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系人" width="120">
          <template slot-scope="scope">
            <el-input
              v-if="isshow[scope.$index]"
              v-model="scope.row.name"
              size="mini"
            ></el-input>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="150">
          <template slot-scope="scope">
            <el-input
              v-if="isshow[scope.$index]"
              v-model="scope.row.contact"
              size="mini"
            ></el-input>
            <span v-else>{{ scope.row.contact }}</span>
          </template>
        </el-table-column>
        <el-table-column label="反馈内容" width="300">
          <template slot-scope="scope">
            <el-input
              v-if="isshow[scope.$index]"
              v-model="scope.row.content"
              size="mini"
              type="textarea"
            ></el-input>
            <span v-else>{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="170">
          <template slot-scope="scope">
            <span v-if="isshow[scope.$index]">
              <el-rate
                v-model="scope.row.rating"
                size="mini"
                :max="5"
                show-score
              ></el-rate>
            </span>
            <span v-else>{{ scope.row.rating }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.updatedAt }}</span>
          </template>
        </el-table-column>
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
  
      <!-- 新增对话框 -->
      <el-dialog title="新增游客反馈" :visible.sync="addDialogVisible" width="50%">
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
          <el-form-item label="联系人" prop="name">
            <el-input
              v-model.trim="addForm.name"
              placeholder="请输入联系人"
            />
          </el-form-item>
          <el-form-item label="联系方式" prop="contact">
            <el-input
              v-model.trim="addForm.contact"
              placeholder="请输入联系方式"
            />
          </el-form-item>
          <el-form-item label="反馈内容" prop="content">
            <el-input
              v-model.trim="addForm.content"
              type="textarea"
              placeholder="请输入反馈内容"
            />
          </el-form-item>
          <el-form-item label="评分" prop="rating">
            <el-rate
              v-model="addForm.rating"
              :max="5"
              show-score
            ></el-rate>
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
          userId: "",
          contact: "",
          content: ""
        },
        total: 0,
        tableData: [],
        isshow: [],
        originalRows: [], // 保存原始数据
        addDialogVisible: false, // 控制新增对话框的显示
        addForm: {
          userId: "",
          name: "",
          contact: "",
          content: "",
          rating: 3 // 默认评分
        },
        addFormRules: {
          userId: [{ required: true, message: "用户ID不能为空", trigger: "blur" }],
          name: [{ required: true, message: "联系人不能为空", trigger: "blur" }],
          contact: [{ required: true, message: "联系方式不能为空", trigger: "blur" }],
          content: [
            { required: true, message: "反馈内容不能为空", trigger: "blur" }
          ],
          rating: [
            { required: true, message: "评分不能为空", trigger: "blur" }
          ]
        }
      };
    },
    created() {
      this.handleSearch();
    },
    methods: {
      getPageList() {
        this.$axios
          .get("/api/admin/feedback/list", { params: this.searchForm })
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
        window.open("/api/admin/feedback/download");
      },
      handleEdit(index, row) {
        this.$set(this.isshow, index, true);
      },
      handleCheck(index, row) {
        const updatedRow = { ...row };
        delete updatedRow.createdAt; // 删除创建时间字段，避免更新时发送
        delete updatedRow.updatedAt; // 删除更新时间字段，避免更新时发送
        delete updatedRow.userName; // 删除用户名称字段，避免更新时发送
        delete updatedRow.showName; // 删除表演名称字段，避免更新时发送
  
        // 获取原始数据
        const originalRow = this.originalRows[index];
  
        // 比较更新前后的数据
        if (
          updatedRow.userId === originalRow.userId &&
          updatedRow.name === originalRow.name &&
          updatedRow.contact === originalRow.contact &&
          updatedRow.content === originalRow.content &&
          updatedRow.rating === originalRow.rating
        ) {
          Message.warning("内容未改变");
          this.$set(this.isshow, index, false);
          return;
        }
  
        this.$axios
          .post("/api/admin/feedback/update", updatedRow)
          .then(() => {
            Message.success("更新成功");
            this.$set(this.isshow, index, false);
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error updating feedback:", error);
          });
      },
      handleDelete(index, row) {
        MessageBox.confirm(
          '确定要删除该反馈信息吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.$axios
            .post("/api/admin/feedback/delete", row)
            .then(() => {
              Message.success("删除成功");
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error deleting feedback:", error);
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
          name: "",
          contact: "",
          content: "",
          rating: 3
        };
      },
      handleSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            const formData = { ...this.addForm };
  
            this.$axios
              .post("/api/admin/feedback/add", formData)
              .then(() => {
                Message.success("新增成功");
                this.addDialogVisible = false;
                this.handleSearch();
              })
              .catch((error) => {
                console.error("Error adding feedback:", error);
              });
          } else {
            Message.error("填写的表单信息有误，请检查");
            return false;
          }
        });
      }
    }
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