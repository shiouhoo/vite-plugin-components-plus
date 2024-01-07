## vite-plugin-components-plus

一个可以自动重命名index.vue的vite插件，自动给index.vue组件重命名为文件夹的名称，也可手动使用name属性来命名组件。

### 使用 

```bash
// use npm
npm i vite-plugin-components-plus -D
// use yarn
yarn add vite-plugin-components-plus -D
// use pnpm
pnpm i vite-plugin-components-plus -D
```
然后在vite.config.js中使用
```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { componentsRename } from 'vite-plugin-components-plus';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // 参数请看最后的说明
        componentsRename(),
        vue()
    ],
});

```
<blockquote style="color: red; background-color: #ffe6e6; padding: 10px; border-left: 5px solid red;">
  ⚠️ 注意：本插件的调用，一定要在vue插件之前
</blockquote>

### 用法

配置完成后，你的index.vue文件就会使用文件夹名来命名了，比如你的文件夹名为`test`，那么你的index.vue文件就会被重命名为`Test.vue`，在devtools开发者工具中，你的组件名也会变成`Test`，而不是`index`了。

#### 指定名称

在 vue 文件中，setup 中也可使用 name属性 来为组件命名。该用法的优先级会小于default导出对象中的name属性

```vue

<script lang="ts" setup name="MyComponent">
// 在测试时，setup的内容不能为空，否则vue不会解析setup
import { defineProps } from 'vue';
</script>

```

<blockquote style="padding: 10px; border-left: 5px solid #3eaf7c;">
  ℹ️ 如果你在默认导出对象中显示的指定了组件名称，那么插件将不会对组件名称进行重命名。
</blockquote>

### 原理

如果你没有script标签，那么插件将会创建一个script标签，并且将组件名称写入到script标签中，如果你已经有了script标签，那么插件将会在script标签中添加一个name属性，如果你已经有了name属性，那么插件将不会对组件名称进行重命名。

对于大部分组件来说，就是插入了一段如下的代码

```js
<script lang='${lang}'>
    export default { name : '${componentName}'}
</script>
```

### 参数

在使用插件时，你可以传入一个对象来配置插件的行为，对象的属性如下

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| include | string[] | ['index.vue','Index.vue'] | 需要重命名的文件 |
| prefix | string | '' | 重命名的文件是加上的前缀 |
| suffix | string | '' | 重命名的文件是加上的后缀 |
