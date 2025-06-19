<template>
  <div id="order-list-management">
    <h2>订单管理</h2>

    <!-- 查询表单 -->
    <el-row type="flex" justify="space-between">
      <el-form
        ref="searchForm"
        :model="searchForm"
        size="small"
        class="demo-form-inline"
        inline
      > 
        <el-form-item label="订单编号:" prop="orderNumber">
          <el-input
            v-model.trim="searchForm.orderNumber"
            placeholder="请输入订单编号"
          />
        </el-form-item>
        <el-form-item label="联系电话:" prop="contactPhone">
          <el-input
            v-model.trim="searchForm.contactPhone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
        <el-form-item label="订单状态:" prop="status">
          <el-select v-model="searchForm.status" placeholder="选择订单状态" clearable>
            <el-option label="待支付" value="待支付"/>
            <el-option label="待出行" value="待出行"/>
            <el-option label="已完成" value="已完成"/>
            <el-option label="已失效" value="已失效"/>
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
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column prop="order_number" label="订单编号" width="180" />
      <el-table-column label="票种信息" width="280">
        <template #default="scope">
          <div v-for="(item, index) in scope.row.items" :key="index">
            {{ item.item_name }} x {{ item.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" label="总金额" width="120">
        <template #default="scope">
          ¥{{ scope.row.total_amount }}
        </template>
      </el-table-column>
      <el-table-column prop="contact_name" label="联系人" width="120" />
      <el-table-column prop="contact_phone" label="联系电话" width="150" />
      <el-table-column prop="visit_date" label="观园日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
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

    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="dialogVisible" title="编辑订单" width="30%">
      <el-form ref="editForm" :model="editForm" label-width="120px" :rules="rules">
        <el-form-item label="订单编号">
          <el-input v-model="editForm.orderNumber" disabled />
        </el-form-item>
        <el-form-item label="票种信息">
          <div v-for="(item, index) in editForm.items" :key="index">
            {{ item.item_name }} x {{ item.quantity }} (¥{{ item.total_amount }})
          </div>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="editForm.contactName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="editForm.contactPhone" />
        </el-form-item>
        <el-form-item label="观园日期" prop="visitDate">
          <el-date-picker
            v-model="editForm.visitDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option label="待支付" value="待支付" />
            <el-option label="待出行" value="待出行" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已失效" value="已失效" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Message, MessageBox } from "element-ui";
import store from "@/store";

export default {
  name: 'OrderList',
  data() {
    return {
      searchForm: {
        current: 1,
        size: 10,
        orderNumber: '',
        contactPhone: '',
        status: ''
      },
      loading: false,
      total: 0,
      tableData: [],
      dialogVisible: false,
      editForm: {
        id: '',
        orderNumber: '',
        items: [],
        contactName: '',
        contactPhone: '',
        visitDate: '',
        status: ''
      },
      rules: {
        contactName: [
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        visitDate: [
          { required: true, message: '请选择观园日期', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择订单状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isAdmin() {
      const user = store.state.user;
      return user && user.role === '1';
    }
  },
  created() {
    this.getPageList();
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case '待支付':
          return 'warning'
        case '待出行':
          return 'primary'
        case '已完成':
          return 'success'
        case '已失效':
          return 'info'
        default:
          return ''
      }
    },
    getPageList() {
      this.loading = true
      const params = {
        ...this.searchForm
      }
      this.$axios.get("/api/admin/orders/list", { params })
        .then(res => {
          if (res.data && res.data.success) {
            console.log('原始订单数据:', res.data.records);
            // 按订单编号分组并合并数据
            const groupedOrders = {};
            res.data.records.forEach(order => {
              if (!groupedOrders[order.orderNumber]) {
                groupedOrders[order.orderNumber] = {
                  ...order,
                  items: [{
                    item_name: order.itemName,
                    quantity: order.quantity,
                    total_amount: order.totalAmount
                  }],
                  total_amount: Number(order.totalAmount),
                  contact_name: order.contactName,
                  contact_phone: order.contactPhone,
                  visit_date: order.visitDate,
                  created_at: order.createdAt,
                  order_number: order.orderNumber
                };
              } else {
                groupedOrders[order.orderNumber].items.push({
                  item_name: order.itemName,
                  quantity: order.quantity,
                  total_amount: Number(order.totalAmount)
                });
                groupedOrders[order.orderNumber].total_amount += Number(order.totalAmount);
              }
            });
            
            this.tableData = Object.values(groupedOrders);
            console.log('合并后的订单数据:', this.tableData);
            this.total = res.data.total;
          } else {
            Message.error(res.data.message || '获取订单列表失败')
          }
          this.loading = false
        })
        .catch(error => {
          console.error("Error fetching orders:", error)
          Message.error('获取订单列表失败')
          this.loading = false
        })
    },
    handleSearch() {
      this.searchForm.current = 1
      this.getPageList()
    },
    handleClear() {
      this.searchForm = {
        current: 1,
        size: 10,
        orderNumber: '',
        contactPhone: '',
        status: ''
      }
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
    handleEdit(row) {
      console.log('编辑行数据:', row);
      this.editForm = {
        id: row.id,
        orderNumber: row.order_number,
        items: row.items || [],
        contactName: row.contact_name,
        contactPhone: row.contact_phone,
        visitDate: row.visit_date,
        status: row.status
      };
      this.dialogVisible = true;
    },
    handleDelete(row) {
      MessageBox.confirm(
        '确定要删除该订单记录吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$axios
          .post("/api/admin/orders/delete", { id: row.id })
          .then(res => {
            if (res.data && res.data.success) {
              Message.success(res.data.message || "删除成功");
              this.getPageList();
            } else {
              Message.error(res.data.message || "删除失败");
            }
          })
          .catch((error) => {
            console.error("Error deleting order:", error);
            Message.error("删除失败，请检查网络或联系管理员");
          });
      }).catch(() => {
        Message.info('已取消删除');
      });
    },
    handleDownload() {
      window.open("/api/admin/orders/download")
    },
    handleSave() {
      if (!this.$refs.editForm) {
        this.$message.error('表单引用不存在');
        return;
      }

      this.$refs.editForm.validate((valid) => {
        if (valid) {
          // 只更新允许的字段
          const updateData = {
            id: this.editForm.id,
            orderNumber: this.editForm.orderNumber,
            contactName: this.editForm.contactName,
            contactPhone: this.editForm.contactPhone,
            visitDate: this.editForm.visitDate,
            status: this.editForm.status
          };

          this.$axios.post("/api/admin/orders/update", updateData)
            .then(res => {
              if (res.data && res.data.success) {
                this.$message.success('更新成功');
                this.dialogVisible = false;
                this.getPageList();
              } else {
                this.$message.error(res.data.message || '更新失败');
              }
            })
            .catch(error => {
              console.error("Error updating order:", error);
              this.$message.error('更新失败，请检查网络或联系管理员');
            });
        }
      });
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
.item-edit {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style> 