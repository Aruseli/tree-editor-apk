// src/composables/useTreeStorage.js

import { ref, watch } from 'vue'

export default function useTreeStorage() {
  const STORAGE_KEY = 'tree-editor-data'

  const treeData = ref([])

  const loadTree = () => {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (storedData) {
      try {
        treeData.value = JSON.parse(storedData)
      } catch (e) {
        console.error('Error parsing stored tree data:', e)
        treeData.value = []
      }
    }
    return treeData.value
  }

  const saveTree = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Error saving tree data:', e)
    }
  }

  // Автоматическое сохранение при изменении данных
  watch(treeData, (newValue) => {
    saveTree(newValue)
  }, { deep: true })

  return {
    treeData,
    loadTree,
    saveTree
  }
}
