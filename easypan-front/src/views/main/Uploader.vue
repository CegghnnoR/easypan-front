<template>
  <div class="uploader-panel">
    <div class="uploader-title">
      <span>上传任务</span>
      <span class="tips">(仅展示本次上传任务)</span>
    </div>
    <div class="file-list">
      <div v-for="(item, index) in fileList" class="file-item">
        <div class="upload-panel">
          <div class="file-name">
            {{ item.fileName }}
          </div>
          <div class="progress">
            <el-progress
              :percentage="item.uploadProgress"
              v-if="item.status == STATUS.uploading.value ||
                item.status == STATUS.upload_seconds.value ||
                item.status == STATUS.upload_finish.value"
            >
            </el-progress>
          </div>
          <div class="upload-status">
            <!-- 图标 -->
            <span
              :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
              :style="{ color: STATUS[item.status].color }"
            ></span>
            <!-- 状态描述 -->
            <span 
              class="status"
              :style="{ color: STATUS[item.status].color }"
            >
              {{ item.status == "fail" ? item.errorMsg : STATUS[item.status].desc }}
            </span>
            <!-- 上传中 -->
            <span
              class="upload-info"
              v-if="item.status == STATUS.uploading.value"
            >
              {{ proxy.Utils.size2Str(item.uploadSize) }} /
              {{ proxy.Utils.size2Str(item.totalSize) }}
            </span>
          </div>
        </div>
        <div class="op">
          <!-- MD5 -->
          <el-progress
            type="circle"
            :width="50"
            :percentage="item.uploadProgress"
            v-if="item.status == STATUS.init.value"
          ></el-progress>
          <div class="op-btn">
            <span v-if="item.status == STATUS.uploading.value">
              <Icon
                v-if="item.pause"
                :width="28"
                class="btn-item"
                iconName="upload"
                title="上传"
                @click="startUpload(item.uid)"
              ></Icon>
              <Icon
                v-else
                :width="28"
                class="btn-item"
                iconName="pause"
                title="暂停"
                @click="pauseUpload(item.uid)"
              ></Icon>
            </span>
            <Icon
              v-if="
                item.status != STATUS.init.value &&
                item.status != STATUS.upload_finish.value &&
                item.status != STATUS.upload_seconds.value"
              :width="28"
              class="del btn-item"
              iconName="del"
              title="删除"
              @click="delUpload(item.uid, index)"
            ></Icon>
            <Icon
              v-if="
                item.status == STATUS.upload_finish.value ||
                item.status == STATUS.upload_seconds.value"
              :width="28"
              class="clean btn-item"
              iconName="clean"
              title="清除"
              @click="delUpload(item.uid, index)"
            ></Icon>
          </div>
        </div>
      </div>
      <div v-if="fileList.length == 0">
        <NoData msg="暂无上传任务"></NoData>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance()
import SparkMD5 from "spark-md5"

const STATUS = {
  emptyfile: {
    value: "emptyfile",
    desc: "文件为空",
    color: "#F75000",
    icon: "close"
  },
  fail: {
    value: "fail",
    desc: "上传失败",
    color: "#F75000",
    icon: "close"
  },
  init: {
    value: "init",
    desc: "解析中",
    color: "#e6a23c",
    icon: "clock"
  },
  uploading: {
    value: "uploading",
    desc: "上传中",
    color: "#409eff",
    icon: "upload"
  },
  upload_finish: {
    value: "upload_finish",
    desc: "上传完成",
    color: "#67c23a",
    icon: "ok"
  },
  upload_seconds: {
    value: "upload_seconds",
    desc: "秒传",
    color: "#67c23a",
    icon: "ok"
  }
}
const chunkSize = 1024 * 1024 * 5
const fileList = ref([])
const addFile = async (file, filePid) => {
  const fileItem = {
    // 文件，文件大小，文件流，文件名...
    file: file,
    // 文件UID
    uid: file.uid,
    // md5进度
    md5Progress: 0,
    //md5值
    md5: null,
    // 文件名
    fileName: file.name,
    // 上传状态
    status: STATUS.uploading.value,
    // 已上传大小
    uploadSize: 0,
    // 文件总大小
    totalSize: file.size,
    // 上传进度
    uploadProgress: 0,
    // 暂停
    pause: false,
    // 当前分片
    chunkIndex: 0,
    // 文件父级ID
    filePid: filePid,
    // 错误信息
    errorMsg: null
  }
  fileList.value.unshift(fileItem)
  if (fileItem.totalSize == 0) {
    fileItem.status = STATUS.emptyfile.value
    return
  }
  let md5FileUid = await computeMd5(fileItem)
  if (md5FileUid == null) {
    return
  }
  uploadFile(md5FileUid)
}
defineExpose({ addFile })

// 计算MD5
const computeMd5 = (fileItem) => {
  let file = fileItem.file
  let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  let chunks = Math.ceil(file.size / chunkSize)
  let currentChunk = 0
  let spark = new SparkMD5.ArrayBuffer()
  let fileReader = new FileReader()

  let loadNext = () => {
    let start = currentChunk * chunkSize
    let end = Math.min(start + chunkSize, file.size)
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  loadNext()
  
  return new Promise((resolve, reject) => {
    let resultFile = getFileByUid(file.uid)
    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++
      if (currentChunk < chunks) {
        
      }
    }
  })
}

// 获取文件
const getFileByUid = (uid) => {
  return fileList.value.find(item => item.file.uid === uid)
}

const uploadFile = (md5FileUid) => {

}
</script>

<style lang="scss" scoped>
.uploader-panel {
  .uploader-title {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;
    .tips {
      font-size: 13px;
      color: rgb(169, 169, 169);
    }
  }
  .file-list {
    overflow: auto;
    padding: 10px 0px;
    min-height: calc(100vh / 2);
    max-height: calc(100vh - 120px);
    .file-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 10px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
    }
    .file-item:nth-child(even) {
      background-color: #fcf8f4;
    }
    .upload-panel {
      flex: 1;
      .file-name {
        color: rgb(64, 62, 62);
      }
      .upload-status {
        display: flex;
        align-items: center;
        margin-top: 5px;
        .iconfont {
          margin-right: 3px;
        }
        .status {
          color: red;
          font-size: 13px;
        }
        .upload-info {
          margin-left: 5px;
          font-size: 12px;
          color: rgb(112, 111, 111);
        }
      }
      .progress {
        height: 10px;
      }
    }
    .op {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .op-btn {
        .btn-item {
          cursor: pointer;
        }
        .del, .clean {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>