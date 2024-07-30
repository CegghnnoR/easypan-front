<template>
  <div>
    <div class="top">
      <div class="top-op">
        <div class="btn">
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <el-button type="primary">
              <span class="iconfont icon-upload"></span>
              上传
            </el-button>
          </el-upload>
        </div>
        <el-button type="success" @click="newFolder">
          <span class="iconfont icon-folder-add"></span>
          新建文件夹
        </el-button>
        <el-button type="danger">
          <span class="iconfont icon-del"></span>
          批量删除
        </el-button>
        <el-button type="warning">
          <span class="iconfont icon-move"></span>
          批量移动
        </el-button>
        <div class="search-panel">
          <el-input
            clearable
            placeholder="请输入文件名搜索"
          >
            <template #suffix>
              <i class="iconfont icon-search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh"></div>
      </div>
      <!-- 导航 -->
      <div>全部文件</div>
    </div>
    <div class="file-list">
      <Table
        ref="dataTableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :initFetch="true"
        :options="tableOptions"
        @rowSelected="rowSelected"
      >
        <template #fileName="{ index, row }">
          <div class="file-item" 
            @mouseenter="showOp(row)"
            @mouseleave="cancelShowOp(row)"
          >
            <template 
              v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2"
            >
              <Icon :cover="row.fileCover" :width="32"></Icon>
            </template>
            <template v-else>
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>
            <span class="file-name" v-if="!row.showEdit" :title="row.fileName">
              <span>{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">转码中</span>
              <span v-if="row.status == 1" class="transfer-status transfer-fail">转码失败</span>
            </span>
            <div class="edit-panel" v-if="row.showEdit">
              <el-input
                v-model.trim="row.fileNameReal"
                ref="editNameRef"
                :maxLength="190"
                @keyup.enter="saveNameEdit(index)"
              >
                <template #suffix>{{ row.fileSuffix }}</template>
              </el-input>
              <span 
                :class="['iconfont icon-right1', row.fileNameReal ? '' : 'not-allow']"
                @click="saveNameEdit(index)"
              ></span>
              <span
                class="iconfont icon-error"
                @click="cancelNameEdit(index)"
              ></span>
            </div>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1">分享</span>
                <span class="iconfont icon-download"
                  v-if="row.folderType == 0"
                >下载</span>
                <span class="iconfont icon-del">删除</span>
                <span class="iconfont icon-edit"
                  @click="editFileName(index)"
                >重命名</span>
                <span class="iconfont icon-move">移动</span>
              </template>
            </span>
          </div>
        </template>
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">
            {{ proxy.Utils.size2Str(row.fileSize) }}
          </span>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup>
// import Table from '@/components/Table.vue';
// import { columns } from 'element-plus/es/components/table-v2/src/common';
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()

const emit = defineEmits(["addFile"])
const addFile = (fileData) => {
  emit("addFile", {file: fileData.file, filePid: currentFolder.value.fileId})
}

// 当前目录
const currentFolder = ref({fileId: 0})

const api = {
  loadDataList: '/file/loadDataList',
  rename: '/file/rename',
  newFolder: '/file/newFolder',
  getFolderInfo: '/file/getFolderInfo',
  delFile: '/file/delFile',
  changeFileFolder: '/file/changeFileFolder',
  createDownloadUrl: '/file/createDownloadUrl',
  download: '/api/file/download'
}

const columns = [
  {
    label: '文件名',
    prop: 'filename',
    scopedSlots: 'filename'
  },
  {
    label: '修改时间',
    prop: 'lastUpdateTime',
    width: 200
  },
  {
    label: '大小',
    prop: 'fileSize',
    scopedSlots: 'fileSize',
    width: 200
  }
]

const tableData = ref({})
const tableOptions = ref({
  extHeight: 50,
  selectType: 'checkbox'
})

const fileNameFuzzy = ref()
const category = ref()
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: 0
  }
  if (params.category != 'all') {
    delete params.filePid
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params
  })
  if (!result) {
    return
  }
  tableData.value = result.data
}

const rowSelected = () => {}

// 展示操作按钮
const showOp = (row) => {
  tableData.value.list.forEach(element => {
    element.showOp = false
  })
  row.showOp = true
}

const cancelShowOp = (row) => {
  row.showOp = false
}

// 编辑行
const editing = ref(false)
const editNameRef = ref()
// 新建文件夹
const newFolder = () => {
  if (editing.value) {
    return
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false
  })
  editing.value = true
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: '',
    filePid: 0
  })
  nextTick(() => {
    editNameRef.value.focus()
  })
}

const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index]
  if (fileData.fileId) {
    fileData.showEdit = false
  } else {
    tableData.value.list.splice(index, 1)
  }
  editing.value = false
}

const saveNameEdit = async (index) => {
  const {fileId, filePid, fileNameReal} = tableData.value.list[index]
  if (fileNameReal == '' || fileNameReal.indexOf('/') != -1) {
    proxy.Message.warning("文件名不能为空，且不能含有斜杠")
    return
  }
  let url = api.rename
  if (fileId == "") {
    url = api.newFolder
  }
  let result = await proxy.Request({
    url: url,
    params: {
      fileId: fileId,
      filePid: filePid,
      fileName: fileNameReal
    }
  })
  if (!result) {
    return
  }
  tableData.value.list[index] = result.data
  editing.value = false
}

const editFileName = (index) => {
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1)
    index = index - 1
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false
  })
  let currentData = tableData.value.list[index]
  currentData.showEdit = true
  // 编辑文件
  if (currentData.folderType == 0) {
    currentData.fileNameReal = currentData.fileName.substring(0, currentData.fileName.indexOf("."))
    currentData.fileSuffix = currentData.fileName.substring(currentData.fileName.indexOf("."))
  } else {
    currentData.fileNameReal = currentData.fileName
    currentData.fileSuffix = ""
  }
  editing.value = true
  nextTick(() => {
    editNameRef.value.focus()
  })

}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";

</style>