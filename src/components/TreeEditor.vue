<script setup>
import { ref, onMounted } from 'vue'
import useTreeStorage from '../composables/useTreeStorage'

const { treeData, loadTree, saveTree } = useTreeStorage()
const editDialog = ref(false)
const deleteDialog = ref(false)
const editingNode = ref({})
const nodeToDelete = ref(null)

onMounted(() => {
  loadTree()
})

const addRootNode = () => {
  const newNode = {
    id: Date.now(),
    name: 'New Node',
    children: []
  }
  treeData.value.push(newNode)
  saveTree(treeData.value)
}

const addChild = (node) => {
  const newNode = {
    id: Date.now(),
    name: 'New Child Node',
    children: []
  }
  if (!node.children) {
    node.children = []
  }
  node.children.push(newNode)
  saveTree(treeData.value)
}

const editNode = (node) => {
  editingNode.value = { ...node }
  editDialog.value = true
}

const saveEdit = () => {
  const updateNodeRecursively = (nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === editingNode.value.id) {
        nodes[i].name = editingNode.value.name
        return true
      }
      if (nodes[i].children && updateNodeRecursively(nodes[i].children)) {
        return true
      }
    }
    return false
  }

  updateNodeRecursively(treeData.value)
  saveTree(treeData.value)
  editDialog.value = false
}

const confirmDelete = (node) => {
  nodeToDelete.value = node
  deleteDialog.value = true
}

const deleteNode = () => {
  const removeNodeRecursively = (nodes) => {
    return nodes.filter(n => {
      if (n.id === nodeToDelete.value.id) return false
      if (n.children) {
        n.children = removeNodeRecursively(n.children)
      }
      return true
    })
  }

  treeData.value = removeNodeRecursively(treeData.value)
  saveTree(treeData.value)
  deleteDialog.value = false
}
</script>
<template>
  <div class="tree-editor">
    <q-btn icon="eva-plus-outline" round color="primary" class="q-mb-lg" @click="addRootNode" />

    <q-tree
      :nodes="treeData"
      node-key="id"
      label-key="name"
      icon="eva-arrow-right"
    >
      <template v-slot:default-header="prop">
        <q-card class="row items-center q-pa-sm">
          <q-card-section>
            <div class="text-weight-bold">{{ prop.node.name }}</div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat icon="eva-edit-outline" color="green" @click.stop="editNode(prop.node)" />
            <q-btn flat icon="eva-trash-2-outline" color="red" @click.stop="confirmDelete(prop.node)" />
            <q-btn flat icon="eva-plus-outline" color="blue" @click.stop="addChild(prop.node)" />
          </q-card-actions>
        </q-card>
      </template>
    </q-tree>

    <!-- Edit Node Dialog -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-input v-model="editingNode.name" label="Node name" autofocus @keyup.enter="saveEdit" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Delete Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to delete this node?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteNode" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>




<!-- <script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import useTreeStorage from '../composables/useTreeStorage'

const $q = useQuasar()
const { loadTree, saveTree } = useTreeStorage()

const treeData = ref([])
const editDialog = ref(false)
const editingNode = ref({})

onMounted(() => {
  treeData.value = loadTree()
})

watch(treeData, (newValue) => {
  saveTree(newValue)
}, { deep: true })

const addRootNode = () => {
  const newNode = {
    id: Date.now(),
    label: 'New Node',
    children: []
  }
  treeData.value.push(newNode)
  saveTree(treeData.value)
}
const addChild = (node) => {
  const newNode = {
    id: Date.now(),
    label: 'New Child Node',
    children: []
  }
  if (!node.children) {
    node.children = []
  }
  node.children.push(newNode)
  saveTree(treeData.value)
}

const editNode = (node) => {
  editingNode.value = { ...node }
  editDialog.value = true
}

const saveEdit = () => {
  const node = treeData.value.find(n => n.id === editingNode.value.id)
  if (node) {
    Object.assign(node, editingNode.value)
  }
  editDialog.value = false
}

const removeNode = (node) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this node?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    const removeNodeRecursively = (nodes, idToRemove) => {
      return nodes.filter(n => {
        if (n.id === idToRemove) return false
        if (n.children) {
          n.children = removeNodeRecursively(n.children, idToRemove)
        }
        return true
      })
    }
    treeData.value = removeNodeRecursively(treeData.value, node.id)
  })
}

const onExpanded = (expanded) => {
  // Handle expanded nodes if needed
}
</script>
<template>
  <div class="tree-editor">
    <q-btn v-if="!treeData.length" label="Add Root Node" color="primary" @click="addRootNode" />
    <q-tree
      :nodes="treeData"
      node-key="label"
      v-model:selected="expanded"

    >
      <template #default-header="{node}">
        <q-card>
          <q-card-section>
            <span>{{ node.label }}</span>
            <q-space />
            <q-btn flat round dense icon="edit" @click.stop="editNode(node)" />
            <q-btn flat round dense icon="add" @click.stop="addChild(node)" />
            <q-btn flat round dense icon="delete" @click.stop="removeNode(node)" />
          </q-card-section>
        </q-card>
      </template>
    </q-tree>

    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-input v-model="editingNode.name" label="Node name" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template> -->
