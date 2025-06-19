<template>
  <div id="pet-form">
    <h2>宠物病历信息注册系统</h2>
    <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <!-- 宠物基本信息 -->
      <el-divider>宠物信息</el-divider>
      <el-form-item label="宠物名称" prop="petName" label-for="petName">
        <el-input id="petName" v-model.trim="form.petName" placeholder="请输入宠物名称"></el-input>
      </el-form-item>
      <el-form-item label="宠物类型" prop="petType" label-for="petType">
        <el-select id="petType" v-model="form.petType" placeholder="请选择宠物类型">
          <el-option label="猫" value="猫"></el-option>
          <el-option label="狗" value="狗"></el-option>
          <el-option label="鸟" value="鸟"></el-option>
          <el-option label="仓鼠" value="仓鼠"></el-option>
          <el-option label="昆虫" value="昆虫"></el-option>
          <el-option label="兔子" value="兔子"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="宠物性别" prop="petSex" label-for="petSex">
        <el-radio-group id="petSex" v-model="form.petSex">
          <el-radio label="公"></el-radio>
          <el-radio label="母"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-divider>主人信息</el-divider>
      <el-form-item label="主人姓名" prop="ownerName" label-for="ownerName">
        <el-input id="ownerName" v-model.trim="form.ownerName" placeholder="请输入主人姓名"></el-input>
      </el-form-item>
      <el-form-item label="联系方式" prop="contact" label-for="contact">
        <el-input id="contact" v-model.trim="form.contact" placeholder="请输入联系方式"></el-input>
      </el-form-item>
      <el-form-item label="主人身份证" prop="idCard" label-for="idCard">
        <el-input id="idCard" v-model.trim="form.idCard" placeholder="请输入主人身份证号"></el-input>
      </el-form-item>

      <!-- 就诊信息 -->
      <el-divider>病历信息</el-divider>
      <el-form-item label="就诊日期" prop="visitDate" label-for="visitDate">
        <el-date-picker
          id="visitDate"
          v-model="form.visitDate"
          type="date"
          placeholder="请选择就诊日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="症状" prop="symptoms" label-for="symptoms">
        <el-input id="symptoms" type="textarea" v-model.trim="form.symptoms" placeholder="请输入症状描述"></el-input>
      </el-form-item>
      <el-form-item label="诊断结果" prop="diagnosis" label-for="diagnosis">
        <el-input id="diagnosis" type="textarea" v-model.trim="form.diagnosis" placeholder="请输入诊断结果"></el-input>
      </el-form-item>
      <el-form-item label="治疗方案" prop="treatment" label-for="treatment">
        <el-input id="treatment" type="textarea" v-model.trim="form.treatment" placeholder="请输入治疗方案"></el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
  
<script>
import { Message } from "element-ui";

export default {
  data() {
    return {
      form: {
        petName: "",
        petType: "",
        petSex: "",
        ownerName: "",
        contact: "",
        idCard: "",
        visitDate: "",
        symptoms: "",
        diagnosis: "",
        treatment: ""
      },
      rules: {
        petName: [{ required: true, message: "请输入宠物名称", trigger: "blur" }],
        petType: [{ required: true, message: "请选择宠物类型", trigger: "change" }],
        petSex: [{ required: true, message: "请选择宠物性别", trigger: "change" }],
        ownerName: [{ required: true, message: "请输入主人姓名", trigger: "blur" }],
        contact: [{ required: true, message: "请输入联系方式", trigger: "blur" }],
        idCard: [{ required: true, message: "请输入主人身份证号", trigger: "blur" }],
        visitDate: [{ required: true, message: "请选择就诊日期", trigger: "change" }],
        symptoms: [{ required: true, message: "请输入症状描述", trigger: "blur" }],
        diagnosis: [{ required: true, message: "请输入诊断结果", trigger: "blur" }],
        treatment: [{ required: true, message: "请输入治疗方案", trigger: "blur" }]
      }
    };
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$axios({
            method: "post",
            url: "/api/pet/add",
            data: this.form
          })
            .then(() => {
              Message.success("提交成功");
              this.onReset();
            })
            .catch((error) => {
              console.error("提交失败:", error);
              Message.error("提交失败，请检查输入信息");
            });
        } else {
          Message.warning("请填写完整信息");
        }
      });
    },
    onReset() {
      this.$refs.form.resetFields();
    }
  }
};
</script>
  
<style scoped>
#pet-form {
  width: 600px;
  margin: 50px auto;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
  