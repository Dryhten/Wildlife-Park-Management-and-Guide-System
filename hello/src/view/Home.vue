<template>
  <div id="home">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="4">
            <p class="system-name">野生动物园后台管理系统</p>
          </el-col>
          <el-col :offset="12" :span="8" style="min-width: 150px">
            <el-dropdown style="float: right; margin: 20px 10px">
              <span class="el-dropdown-link" style="color: #fff; cursor: pointer">
                {{ user ? user.nickname : '未登录' }}
                &nbsp;&nbsp;<i class="fa fa-caret-down fa-1x"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="editPasswordDialog = true">修改密码</el-dropdown-item>
                <el-dropdown-item @click.native="logout()">退出系统</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-avatar shape="square" :src="avatar" style="margin: 10px; float: right"></el-avatar>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="210px">
          <el-menu router :default-active="activePath" class="el-menu-vertical-demo" :collapse="isCollapse">
            <!-- 系统管理员才能看到的菜单项 -->
            <el-menu-item v-if="isSystemAdmin" index="/home/administrator" @click="saveActiveNav('/home/administrator')">
              <i class="el-icon-s-custom"></i>
              <span slot="title">管理员账户管理</span>
            </el-menu-item>
            <el-menu-item index="/home/dashboard" @click="saveActiveNav('/home/dashboard')">
              <i class="el-icon-s-home"></i>
              <span slot="title">数据仪表盘</span>
            </el-menu-item>
            <el-menu-item index="/home/user" @click="saveActiveNav('/home/user')">
              <i class="el-icon-user"></i>
              <span slot="title">游客信息管理</span>
            </el-menu-item>
            <el-menu-item index="/home/userpreference" @click="saveActiveNav('/home/userpreference')">
              <i class="el-icon-s-marketing"></i>
              <span slot="title">游客偏好管理</span>
            </el-menu-item>
            <el-menu-item index="/home/animal" @click="saveActiveNav('/home/animal')">
              <i class="el-icon-s-platform"></i>
              <span slot="title">动物资料管理</span>
            </el-menu-item>
            <el-menu-item index="/home/park" @click="saveActiveNav('/home/animal')">
              <i class="el-icon-map-location"></i>
              <span slot="title">园区信息管理</span>
            </el-menu-item>
            <el-menu-item index="/home/parktraffic" @click="saveActiveNav('/home/animal')">
              <i class="el-icon-data-line"></i>
              <span slot="title">园区流量管理</span>
            </el-menu-item>
            <el-menu-item index="/home/safetyalert" @click="saveActiveNav('/home/safetyalert')">
              <i class="el-icon-warning"></i>
              <span slot="title">安全预警管理</span>
            </el-menu-item>
            <el-menu-item index="/home/performance" @click="saveActiveNav('/home/performance')">
              <i class="el-icon-video-camera"></i>
              <span slot="title">动物表演管理</span>
            </el-menu-item>
            <el-menu-item index="/home/performancebooking" @click="saveActiveNav('/home/performancebooking')">
              <i class="el-icon-date"></i>
              <span slot="title">动物表演预订管理</span>
            </el-menu-item>
            <el-menu-item index="/home/booking" @click="saveActiveNav('/home/booking')">
              <i class="el-icon-tickets"></i>
              <span slot="title">园区预订管理</span>
            </el-menu-item>
            <el-menu-item index="/home/feedback" @click="saveActiveNav('/home/feedback')">
              <i class="el-icon-chat-dot-round"></i>
              <span slot="title">用户反馈管理</span>
            </el-menu-item>
            <el-menu-item index="/home/orderlist" @click="saveActiveNav('/home/orderlist')">
              <i class="el-icon-s-order"></i>
              <span slot="title">订单管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <router-view></router-view>
          </el-main>
          <el-footer></el-footer>
        </el-container>
      </el-container>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="editPasswordDialog" width="30%">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordDialog = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Message } from "element-ui";

export default {
  name: 'Home',
  computed: {
    ...mapState(['user']),
    // 判断是否为系统管理员
    isSystemAdmin() {
      return this.user && this.user.role === '1';
    }
  },
  data() {
    return {
      activePath: '/home/user',
      isCollapse: false,
      avatar: require('@/assets/user.png'),
      editPasswordDialog: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    saveActiveNav(path) {
      this.activePath = path;
    },
    async logout() {
      try {
        // 清除本地存储的 token 和用户信息
        localStorage.removeItem('token');
        this.$store.dispatch('setUser', null);
        this.$router.push({ name: 'login' });
        Message.success("登出成功");
      } catch (error) {
        Message.error("登出失败");
        console.error('登出失败:', error);
      }
    },
    updatePassword() {
      if (!this.user) {
        Message.error("用户信息失效，请重新登录");
        return;
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        Message.error("新密码与确认密码不一致");
        return;
      }
      // 发送用户ID或用户名
      const userId = this.user.id; // 假设用户对象中包含id字段

      // 发送请求到后端更新密码
      this.$axios.post('/api/admin/update', {
        userId: userId,
        oldPassword: this.passwordForm.oldPassword,
        newPassword: this.passwordForm.newPassword
      })
      .then(response => {
        const data = response.data;
        if (data.status === 'success') {
          Message.success(data.message);
          this.editPasswordDialog = false;
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        } else {
          Message.error(data.message);
        }
      })
      .catch(error => {
        Message.error("密码修改失败");
        console.error('密码修改失败:', error);
      });
    }
  },
  created() {
    // 如果没有登录，跳转到登录页面
    if (!this.user) {
      this.$router.push({ name: 'login' });
    } else {
      // 设置 activePath 为当前路由路径
      this.activePath = this.$route.path;
    }
  },
  watch: {
    // 监听路由变化，更新 activePath
    $route(to) {
      this.activePath = to.path;
    }
  }
};
</script>

<style>
.home-container {
  position: absolute;
  height: 100%;
  top: 0px;
  left: 0px;
  width: 100%;
  background: #f2f3f5;
}

.el-header {
  background: #4772d6;
  padding: 0 10px;
  overflow: hidden;
}

.system-name {
  color: #fff;
  font-size: 18px;
}

.el-aside {
  background: white;
  width: auto !important;
  height: calc(100vh - 60px); /* 减去header的高度 */
  overflow: hidden;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: 100%;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.el-menu-vertical-demo::-webkit-scrollbar {
  width: 6px;
}

.el-menu-vertical-demo::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.el-menu-vertical-demo::-webkit-scrollbar-track {
  background: #f5f5f5;
}

/* 确保菜单项不会被截断 */
.el-menu-item {
  white-space: nowrap;
}
</style>