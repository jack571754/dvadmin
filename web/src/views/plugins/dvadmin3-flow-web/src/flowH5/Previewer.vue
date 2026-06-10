<script lang="ts" >
import {defineComponent} from 'vue'
import render from './render/index.vue'
export default defineComponent({
  name: "Previewer",
  components:{
    render
  },
  props:{
    formItems:{
      type:Object,
      default:()=>{}
    },
    formRules:{
      type:Object,
      default:()=>{}
    }
  },
  setup(props, {emit}){
    const submitForm = (formValue:any)=>{
      emit('submitForm',formValue)
    }
    return {
      submitForm
    }
  }
})
</script>

<template>
 <div>
   <render :formItems="formItems" :formRules="formRules" @submit-form="submitForm"></render>
 </div>
</template>

<style scoped lang="scss">

</style>