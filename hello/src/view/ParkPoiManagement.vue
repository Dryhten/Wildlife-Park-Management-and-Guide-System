<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>园区POI管理</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleAdd">添加POI</el-button>
      </div>
      
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="180"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="category" label="类别"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="latitude" label="纬度"></el-table-column>
        <el-table-column prop="longitude" label="经度"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-input v-model="form.category"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model.number="form.latitude" type="number"></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model.number="form.longitude" type="number"></el-input>
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
import axios from 'axios'
import { Message, MessageBox } from "element-ui";

export default {
  name: 'ParkPoiManagement',
  data() {
    return {
      tableData: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: '',
        name: '',
        category: '',
        address: '',
        latitude: '',
        longitude: ''
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        category: [{ required: true, message: '请输入类别', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
        longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      axios.get('http://localhost:8080/api/park-poi/list').then(response => {
        this.tableData = response.data
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleAdd() {
      this.dialogTitle = '添加POI'
      this.form = {
        id: '',
        name: '',
        category: '',
        address: '',
        latitude: '',
        longitude: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑POI'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      MessageBox.confirm(
        '确定要删除该POI信息吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .delete(`/api/park-poi/${row.id}`)
          .then(() => {
            Message.success("删除成功");
            this.fetchData()
          })
          .catch((error) => {
            console.error("Error deleting POI:", error);
          });
      }).catch(() => {
        Message.info('已取消删除');
      });
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const method = this.form.id ? 'put' : 'post'
          const url = this.form.id 
            ? `http://localhost:8080/api/park-poi/${this.form.id}`
            : 'http://localhost:8080/api/park-poi'
          
          axios[method](url, this.form).then(() => {
            this.$message.success(this.form.id ? '更新成功' : '添加成功')
            this.dialogVisible = false
            this.fetchData()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.box-card {
  margin: 20px;
}
</style> 