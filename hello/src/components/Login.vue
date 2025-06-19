<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Message } from "element-ui";

export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      try {
        const response = await axios.post('/api/admin/login/', { username: this.username, password: this.password });
        if (response.data.status === 'success') {
          // 存储 token 到 localStorage
          localStorage.setItem('token', response.data.token);

          // 存储用户信息到 Vuex 和 localStorage
          const user = response.data.user;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.$store.dispatch('setUser', user);
          } else {
            console.error('User data is missing from the response');
          }

          // 清除错误信息
          this.error = '';

          // 跳转到首页
          this.$router.push('/home');
          Message.success("登录成功");
        } else {
          this.error = response.data.message || '登录失败，请检查用户名和密码';
          Message.error(this.error);
        }
      } catch (err) {
        this.error = err.response?.data?.message || '登录失败，请检查网络连接';
        Message.error(this.error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color, #f2f3f5);
}

.login-card {
  background-color: var(--card-background-color, #ffffff);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

.login-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--title-color, #333333);
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--label-color, #666666);
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--input-border-color, #cccccc);
  border-radius: 4px;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: var(--primary-color, #007bff);
  color: var(--button-text-color, #ffffff);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: var(--primary-hover-color, #0056b3);
}

.login-button:disabled {
  background-color: var(--disabled-color, #cccccc);
  cursor: not-allowed;
}

.error {
  color: var(--error-color, #ff0000);
  margin-top: 15px;
  font-size: 14px;
}
</style>