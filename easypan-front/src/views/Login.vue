<template>
  <div class="login-body">
    <div class="bg"></div>
    <div class="login-panel">
      <el-form
        class="login-register"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
        <div class="login-title">Easy云盘</div>
        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input
            size="large"
            clearable
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            maxLength="150"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 登录密码 -->
        <el-form-item prop="password" v-if="opType == 1">
          <el-input
            type="password"
            size="large"
            placeholder="请输入密码"
            v-model.trim="formData.password"
            show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 注册 -->
        <div v-if="opType == 0 || opType == 2">
          <el-form-item prop="emailCode">
            <div class="send-email-panel">
              <el-input
                size="large"
                placeholder="请输入邮箱验证码"
                v-model.trim="formData.emailCode"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button
                class="send-email-btn"
                type="primary"
                size="large"
                @click="getEmailCode"
              >
                获取验证码
              </el-button>
            </div>
            <el-popover placement="left" :width="500" trigger="click">
              <div>
                <p>1、在垃圾箱中查找邮箱验证码</p>
                <p>2、在邮箱中头像->设置->反垃圾->白名单->设置邮件地址白名单</p>
                <p>3、将邮箱添加到白名单不知道怎么设置？</p>
              </div>
              <template #reference>
                <span class="a-link" :style="{ 'font-size': '14px' }">
                  未收到邮箱验证码？
                </span>
              </template>
            </el-popover>
          </el-form-item>
          <!-- 昵称 -->
          <el-form-item prop="nickName" v-if="opType == 0">
            <el-input
              size="large"
              placeholder="请输入昵称"
              v-model.trim="formData.nickName"
              maxlength="20"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="registerPassword">
            <el-input
              type="password"
              size="large"
              placeholder="请输入密码"
              v-model.trim="formData.registerPassword"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input
              type="password"
              size="large"
              placeholder="请重复密码"
              v-model.trim="formData.reRegisterPassword"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <!-- 验证码 -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode(0)"
            />
          </div>
        </el-form-item>
        <!-- 记住我 忘记密码 没有账号 -->
        <el-form-item v-if="opType == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)"
              >忘记密码？</a
            >
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)"
              >没有账号？</a
            >
          </div>
        </el-form-item>
        <el-form-item v-if="opType == 2">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">
            去登录？
          </a>
        </el-form-item>
        <el-form-item v-if="opType == 0">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">
            已有账号？
          </a>
        </el-form-item>
        <el-form-item>
          <el-button
            class="op-btn"
            type="primary"
            size="large"
            @click="doSubmit"
          >
            <span v-if="opType == 0">注册</span>
            <span v-if="opType == 1">登录</span>
            <span v-if="opType == 2">重置密码</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <Dialog
      :show="dialogConfig4SendMailCode.show"
      :title="dialogConfig4SendMailCode.title"
      :buttons="dialogConfig4SendMailCode.buttons"
      width="500px"
      :showCancel="false"
      @close="dialogConfig4SendMailCode.show = false"
    >
      <el-form
        :model="formData4SendMailCode"
        :rules="rules"
        ref="formData4SendMailCodeRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>
        <el-form-item label="验证码" prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              placeholder="请输入验证码"
              v-model.trim="formData4SendMailCode.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl4SendMailCode"
              class="check-code"
              @click="changeCheckCode(1)"
            />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  checkCode: "/api/checkCode",
};

// 操作类型 0：注册 1：登录 2：重置密码
const opType = ref(1);
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

const formData = ref({});
const formDataRef = ref();

// 校验规则
const checkRePassword = (rule, value, callback) => {
  if (formData.value.registerPassword !== value) {
    callback(new Error(rule.message));
  } else callback();
};
const rules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  emailCode: [{ required: true, message: "请输入邮箱验证码", trigger: "blur" }],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  registerPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      validator: proxy.Verify.password,
      message: "密码长度8-18位，至少包含1个数字和1个字母",
      trigger: "blur",
    },
  ],
  reRegisterPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: checkRePassword,
      message: "再次输入的密码不一致",
      trigger: "blur",
    },
  ],
  checkCode: [{ required: true, message: "请输入图片验证码", trigger: "blur" }],
};

const checkCodeUrl = ref(api.checkCode);
const checkCodeUrl4SendMailCode = ref(api.checkCode);
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value = `${
      api.checkCode
    }?type=${type}&time=${new Date().getTime()}`;
  } else if (type == 1) {
    checkCodeUrl4SendMailCode.value = `${
      api.checkCode
    }?type=${type}&time=${new Date().getTime()}`;
  }
};

// 发送邮箱验证码
const formData4SendMailCode = ref({});
const formData4SendMailCodeRef = ref();

const dialogConfig4SendMailCode = reactive({
  show: false,
  title: "发送邮箱验证码",
  buttons: [
    {
      type: "primary",
      text: "发送验证码",
      click: (e) => {
        sendEmailCode();
      },
    },
  ],
});

// 获取验证码的弹窗
const getEmailCode = () => {
  formDataRef.value.validateField("email", (valid) => {
    if (!valid) return;
    dialogConfig4SendMailCode.show = true;
    nextTick(() => {
      changeCheckCode(1);
      formData4SendMailCodeRef.value.resetFields();
      formData4SendMailCode.value = {
        email: formData.value.email,
      };
    });
  });
};

// 发送邮箱验证码
const sendEmailCode = () => {
  formData4SendMailCodeRef.value.validate((valid) => {
    if (!valid) return

  })
}

// 重置表单
const resetForm = () => {
  changeCheckCode(0);
  formDataRef.value.resetFields();
  formData.value = {};
  // 登录
  if (opType.value == 1) {

  }
}

const doSubmit = () => {
  formDataRef.value.validate((valid) => {
    if (!valid) return
  })
}
</script>

<style lang="scss" scoped>
.login-body {
  height: calc(100vh);
  background-size: cover;
  background: url("../assets/login_bg.jpg");
  display: flex;
  .bg {
    flex: 1;
    background-size: cover;
    background-position: center;
    background-size: 800px;
    background-repeat: no-repeat;
    background-image: url("../assets/login_img.png");
  }
  .login-panel {
    width: 430px;
    margin-right: 15%;
    margin-top: calc((100vh - 500px) / 2);
    .login-register {
      padding: 25px;
      background: #fff;
      border-radius: 5px;
      .login-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .send-email-panel {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .send-email-btn {
          margin-left: 5px;
        }
      }
      .rememberme-panel {
        width: 100%;
      }
      .no-account {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      .op-btn {
        width: 100%;
      }
    }
  }
  .check-code-panel {
    width: 100%;
    display: flex;
    .check-code {
      margin-left: 5px;
      cursor: pointer;
    }
  }
  .login-btn-qq {
    margin-top: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      cursor: pointer;
      margin-left: 10px;
      width: 20px;
    }
  }
}
</style>