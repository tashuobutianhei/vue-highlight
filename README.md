# vue-highlight
基于vue的关键词高亮插件

### 实现
... 基于劫持vue.prototpye._render进行篡改每次编译、watcher后的vnode进行提前对vnode中的文本结点进行遍历，完成提前操作，而不是直接修改dom
... 遍历算法：基于字典树

### 可行性分析
... render并不会本身就进行遍历到文本结点，所以需要手动遍历，根据vue源码实现走进真正render生成vnode的为组件或者第一个不为组件的html模块，所以对每次render中的元素可以进行遍历并且不会重复遍历。
