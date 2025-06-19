<template>
    <div id="park-management">
      <h2>园区信息管理</h2>
  
      <!-- 查询表单 -->
      <el-row type="flex" justify="space-between">
        <el-form
          ref="searchForm"
          :model="searchForm"
          size="small"
          class="demo-form-inline"
          inline
        >
          <el-form-item label="园区名称:" prop="name">
            <el-input
              v-model.trim="searchForm.name"
              placeholder="请输入园区名称"
            />
          </el-form-item>
          <el-form-item label="所属动物园:" prop="zooId">
            <el-select v-model="searchForm.zooId" placeholder="请选择动物园" clearable>
              <el-option
                v-for="zoo in zooList"
                :key="zoo.id"
                :label="zoo.name"
                :value="zoo.id"
              ></el-option>
            </el-select>
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
      <el-table 
        :data="tableData" 
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="园区名称" width="120">
          <template slot-scope="scope">
            <span v-if="!isshow[scope.$index]">{{ scope.row.name || '暂无数据' }}</span>
            <el-input
              v-else
              v-model="scope.row.name"
              size="mini"
              placeholder="请输入园区名称"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="background" label="园区背景" min-width="150">
          <template slot-scope="scope">
            <span v-if="!isshow[scope.$index]">{{ scope.row.background || '暂无数据' }}</span>
            <el-input
              v-else
              type="textarea"
              v-model="scope.row.background"
              size="mini"
              placeholder="请输入园区背景"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="features" label="园区特色" min-width="150">
          <template slot-scope="scope">
            <span v-if="!isshow[scope.$index]">{{ scope.row.features || '暂无数据' }}</span>
            <el-input
              v-else
              type="textarea"
              v-model="scope.row.features"
              size="mini"
              placeholder="请输入园区特色"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="animalDistribution" label="动物分布" min-width="150">
          <template slot-scope="scope">
            <span v-if="!isshow[scope.$index]">{{ scope.row.animalDistribution || '暂无数据' }}</span>
            <el-input
              v-else
              type="textarea"
              v-model="scope.row.animalDistribution"
              size="mini"
              placeholder="请输入动物分布"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="audioGuide" label="语音导览" min-width="150">
          <template slot-scope="scope">
            <span v-if="!isshow[scope.$index]">{{ scope.row.audioGuide || '暂无数据' }}</span>
            <el-input
              v-else
              type="textarea"
              v-model="scope.row.audioGuide"
              size="mini"
              placeholder="请输入语音导览"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
              v-if="!isshow[scope.$index]"
            >编辑</el-button>
            <el-button
              size="mini"
              type="success"
              @click="handleSave(scope.$index, scope.row)"
              v-else
            >保存</el-button>
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
      <el-dialog title="新增园区" :visible.sync="addDialogVisible" width="50%">
        <el-form
          ref="addForm"
          :model="addForm"
          :rules="addFormRules"
          label-width="120px"
        >
          <el-form-item label="所属动物园" prop="zooId">
            <el-select v-model="addForm.zooId" placeholder="请选择动物园">
              <el-option
                v-for="zoo in zooList"
                :key="zoo.id"
                :label="zoo.name"
                :value="zoo.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="园区名称" prop="name">
            <el-input
              v-model.trim="addForm.name"
              placeholder="请输入园区名称"
            />
          </el-form-item>
          <el-form-item label="背景信息" prop="background">
            <el-input
              v-model.trim="addForm.background"
              placeholder="请输入背景信息"
            />
          </el-form-item>
          <el-form-item label="特色景点" prop="features">
            <el-input
              v-model.trim="addForm.features"
              placeholder="请输入特色景点"
            />
          </el-form-item>
          <el-form-item label="动物分布" prop="animalDistribution">
            <el-input
              v-model.trim="addForm.animalDistribution"
              placeholder="请输入动物分布"
            />
          </el-form-item>
          <el-form-item label="语音播报介绍" prop="audioGuide">
            <el-input
              v-model="addForm.audioGuide"
              type="textarea"
              placeholder="请输入语音播报介绍"
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
        loading: false,
        searchForm: {
          current: 1,
          size: 10,
          name: "",
          zooId: null
        },
        total: 0,
        tableData: [],
        isshow: [],
        originalRows: [], // 保存原始数据
        addDialogVisible: false, // 控制新增对话框的显示
        addForm: {
          zooId: null,
          name: "",
          background: "",
          features: "",
          animalDistribution: "",
          audioGuide: "",
          createdAt: "",
        },
        addFormRules: {
          zooId: [{ required: true, message: "请选择所属动物园", trigger: "change" }],
          name: [{ required: true, message: "园区名称不能为空", trigger: "blur" }],
          background: [
            { required: true, message: "背景信息不能为空", trigger: "blur" },
          ],
          features: [
            { required: true, message: "特色景点不能为空", trigger: "blur" },
          ],
          animalDistribution: [
            { required: true, message: "动物分布不能为空", trigger: "blur" },
          ],
          audioGuide: [
            { required: true, message: "语音播报介绍不能为空", trigger: "blur" },
          ],
        },
        zooList: [], // 动物园列表
      };
    },
    created() {
      this.getZooList();
      this.handleSearch();
    },
    methods: {
      // 获取动物园列表
      getZooList() {
        this.$axios
          .get("/api/admin/zoo/list")
          .then((res) => {
            if (res.data && res.data.success) {
              this.zooList = res.data.data || [];
            } else {
              this.$message.error('获取动物园列表失败：' + (res.data.message || '未知错误'));
            }
          })
          .catch((error) => {
            console.error("获取动物园列表失败:", error);
            this.$message.error(`获取动物园列表失败: ${error.message}`);
          });
      },
      getPageList() {
        console.log('正在获取园区列表，参数：', this.searchForm);
        this.loading = true;
        this.$axios
          .get("/api/admin/park/list", { params: this.searchForm })
          .then((res) => {
            console.log('获取园区列表响应：', res);
            if (res.data && res.data.success) {
              this.tableData = res.data.data.records || [];
              this.total = res.data.data.total || 0;
              this.searchForm.current = res.data.data.current || 1;
              this.searchForm.size = res.data.data.size || 10;
              this.isshow = new Array(this.tableData.length).fill(false);
              this.originalRows = JSON.parse(JSON.stringify(this.tableData));
              console.log('处理后的表格数据：', this.tableData);
            } else {
              this.$message.error('获取数据失败：' + (res.data.message || '响应数据格式错误'));
            }
          })
          .catch((error) => {
            console.error("获取园区列表失败:", error);
            this.$message.error(`获取园区列表失败: ${error.message}`);
          })
          .finally(() => {
            this.loading = false;
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
        window.open("/api/admin/park/download");
      },
      handleEdit(index, row) {
        this.$set(this.isshow, index, true);
      },
      handleSave(index, row) {
        const updatedRow = { ...row };
        delete updatedRow.createdAt;
  
        // 获取原始数据
        const originalRow = this.originalRows[index];
  
        // 比较更新前后的数据
        if (
          updatedRow.name === originalRow.name &&
          updatedRow.background === originalRow.background &&
          updatedRow.features === originalRow.features &&
          updatedRow.animalDistribution === originalRow.animalDistribution &&
          updatedRow.audioGuide === originalRow.audioGuide
        ) {
          Message.warning("内容未改变");
          this.$set(this.isshow, index, false);
          return;
        }
  
        this.$axios
          .post("/api/admin/park/update", updatedRow)
          .then(() => {
            Message.success("更新成功");
            this.$set(this.isshow, index, false);
            this.handleSearch();
          })
          .catch((error) => {
            console.error("Error updating park:", error);
          });
      },
      handleDelete(index, row) {
        MessageBox.confirm(
          '确定要删除该园区信息吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.$axios
            .post("/api/admin/park/delete", row)
            .then(() => {
              Message.success("删除成功");
              this.handleSearch();
            })
            .catch((error) => {
              console.error("Error deleting park:", error);
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
          zooId: null,
          name: "",
          background: "",
          features: "",
          animalDistribution: "",
          audioGuide: "",
          createdAt: new Date().toISOString(),
        };
      },
      handleSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            const formData = { ...this.addForm };
            delete formData.createdAt;
            this.$axios
              .post("/api/admin/park/add", formData)
              .then((res) => {
                if (res.data && res.data.success) {
                  Message.success("新增成功");
                  this.addDialogVisible = false;
                  this.handleSearch();
                } else {
                  Message.error(res.data.message || "新增失败");
                }
              })
              .catch((error) => {
                console.error("Error adding park:", error);
                Message.error(`新增失败: ${error.message}`);
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