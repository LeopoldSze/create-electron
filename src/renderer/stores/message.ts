import { ModelChat, ModelMessage } from '@/model'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const data: Ref<ModelMessage[]> = ref([])
  const currentChat: Ref<ModelChat | null> = ref(null)
  const msg1 = `醉里挑灯看剑，梦回吹角连营。八百里分麾下灸，五十弦翻塞外声。沙场秋点兵。马作的卢飞快，弓如霹雳弦惊。了却君王天下事，嬴得生前身后名。可怜白发生`
  const msg2 = `怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。 三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切！ 靖康耻，犹未雪；臣子恨，何时灭?驾长车，踏破贺兰山缺！ 壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头，收拾旧山河，朝天阙！`

  const initData = (chat: ModelChat) => {
    currentChat.value = chat
    const result: ModelMessage[] = []
    for (let i = 0; i < 10; i++) {
      const model = new ModelMessage()
      model.createTime = Date.now()
      model.isInMsg = i % 2 === 0
      model.messageContent = model.isInMsg ? msg1 : msg2
      model.fromName = model.isInMsg ? chat.fromName : '我'
      model.avatar = chat.avatar
      model.chatId = chat.id
      result.push(model)
    }
    data.value = result
  }

  const sendMessage = (text: string) => {
    const content = text.trim()
    if (!content) return
    const chat = currentChat.value
    const model = new ModelMessage()
    model.createTime = Date.now()
    model.isInMsg = false
    model.messageContent = content
    model.fromName = '我'
    model.avatar = chat?.avatar ?? ''
    model.chatId = chat?.id ?? ''
    data.value = [...data.value, model]
  }

  return { data, currentChat, initData, sendMessage }
})
