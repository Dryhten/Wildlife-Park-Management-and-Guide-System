import Vue from 'vue';
import VueRouter from 'vue-router';
// import Form from '../view/Form';
// import Query from '../view/Query';
import Home from '../view/Home';
// import Date from '../view/Date';
import Login from '../components/Login'; // 确保路径正确
import User from '../view/UserManagement';
import Animal from '../view/AnimalManagement';
import Park from '../view/ParkManagement';
import SafetyAlert from '../view/SafetyAlertManagement';
import Performance from '../view/PerformanceManagement';
import PerformanceBooking from '../view/PerformanceBookingManagement';
import Booking from '../view/BookingManagement';
import Feedback from '../view/FeedbackManagement';
import ParkTraffic from '../view/ParkTrafficManagement';
import OrderList from '../view/OrderListManagement';
import UserPreference from '../view/UserPreferenceManagement';
import Administrator from '../view/AdministerManagement';
import Dashboard from '../view/Dashboard';

import 'element-ui/lib/theme-chalk/index.css';


Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/home',
      component: Home,
      meta: { requiresAuth: true }, // 设置需要权限验证
      children: [
        { path: '', redirect: '/home/dashboard' }, // 修改默认子路由为仪表盘
        // { path: 'query', component: Query, name: 'query', meta: { requiresAuth: true } },
        // { path: 'form', component: Form, name: 'form', meta: { requiresAuth: true } },
        // { path: 'date', component: Date, name: 'date', meta: { requiresAuth: true } },
        { path: 'dashboard', component: Dashboard, name: 'dashboard', meta: { requiresAuth: true } },
        { path: 'user', component: User, name: 'user', meta: { requiresAuth: true } },
        { path: 'animal', component: Animal, name: 'animal', meta: { requiresAuth: true }},
        { path: 'park', component: Park, name: 'park', meta: { requiresAuth: true } },
        { path: 'safetyalert', component: SafetyAlert, name: 'safetyalert', meta: { requiresAuth: true } },
        { path: 'performance', component: Performance, name: 'performance', meta: { requiresAuth: true }},
        { path: 'performancebooking', component: PerformanceBooking, name: 'performancebooking', meta: { requiresAuth: true }},
        { path: 'booking', component: Booking, name: 'booking', meta: { requiresAuth: true }},
        { path: 'feedback', component: Feedback, name: 'feedback', meta: { requiresAuth: true }},
        { path: 'parktraffic', component: ParkTraffic, name: 'parktraffic', meta: { requiresAuth: true }},
        { path: 'orderlist', component: OrderList, name: 'orderlist', meta: { requiresAuth: true }},
        { path: 'userpreference', component: UserPreference, name: 'userpreference', meta: { requiresAuth: true }},
        { path: 'administrator', component: Administrator, name: 'administrator', meta: { requiresAuth: true }},


        

      ]
    },
    {
      path: '/login',
      component: Login,
      name: 'login' // 设置路由名称
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('token'); // 假设使用 token 来判断是否登录

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;