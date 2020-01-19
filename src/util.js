export default {
    isTextVNode(vnode) {
      // 判断是否为文本结点
      return !vnode.children && !vnode.tag && vnode.text && !/^ +$/.test(vnode.text);
    },
  
    hasChildren(vnode) {
      return Array.isArray(vnode.children) && vnode.children.length > 0;
    },
  
    isVHTML(vnode) {
      return vnode.data && vnode.data.domProps && vnode.data.domProps.innerHTML;
    },
  };