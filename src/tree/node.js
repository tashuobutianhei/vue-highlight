
export default class Node {
    // 节点值
    key;
    // 是否为单词最后节点，flag标志，一个高亮词结点
    word;
    // 父节点的引用
    parent;
    // 子节点的引用（goto表）
    children = {};
    // failure表，用于匹配失败后的跳转
    failure = undefined;
  
    constructor(key, parent = undefined, word = false) {
      this.key = key;
      this.parent = parent;
      this.word = word;
    }
  }