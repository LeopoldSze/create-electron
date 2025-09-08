import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { ModelChat } from '@/model'
import { useMessageStore } from '@/renderer/stores/message.ts'

/**
 * 初始化模拟数据
 */
const prepareData = () => {
  const result = [];
  for (let i = 0; i < 10; i++) {
    const model = new ModelChat();
    model.fromName = "聊天对象" + i;
    model.sendTime = "昨天";
    model.lastMsg = "这是此会话的最后一条消息" + i;
    model.avatar = 'https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c';
    result.push(model);
  }
  return result;
};

export const useChatStore = defineStore('chat', () => {
  const data: Ref<ModelChat[]> = ref(prepareData())

  /**
   * 选择聊天
   * @param item
   */
  const selectChat = (item: ModelChat) => {
    if (item.isSelected) return
    data.value.forEach((v) => (v.isSelected = false))
    item.isSelected = true
    const messageStore = useMessageStore()
    messageStore.initData(item)
  }
  return { data, selectChat }
})
