import util from './util';
import Tree from './Tree/index';

class HightLight {

  keyWordsMap = []; // 高亮词表数组
  highlightKeyMap = []; // 高亮词表配置内容
  keyTree = {}; // 构建字典树
  hashNum = ''; // 生成hashNum
  patternText = ''; // 正则

  constructor(highlightKeyMap) {
    if (!Array.isArray(highlightKeyMap)) {
      throw ('高亮词表应该是一个数组');
    }
    this.init(highlightKeyMap);
  }

  init(highlightKeyMap) {
    this.highlightKeyMap = highlightKeyMap;
    this.keyWordsMap = this.createWordsMap();
    this.hashNum = (new Date().getTime()).toString(32);
    this.keyTree = new Tree(this.keyWordsMap);
    this.patternText = this.createReg();

    console.log(this.keyTree);
  }

  createWordsMap() {
    return this.highlightKeyMap.map(item => item.key);
  }

  // 创建正则
  createReg() {
    let middleArray = [];
    this.highlightKeyMap.forEach(mapItem => {
      middleArray.push(mapItem.key.replace(/[.[*?+^$|()/]|\]|\\/g, '\\$&'));
    });
    return this.highlightKeyMap.length ? new RegExp(`(${middleArray.join('|')})`, 'g') : /''/; // 生成正则表达式
  }

  choseColor(key) {
    // 颜色配置，todo
    let thKey = this.highlightKeyMap.find(item => item.key === key);
    return thKey ? thKey.color : '1';
  }

  // 修改高亮词表
  updateKeyWordsMap(highlightKeyMap) {
    this.init(highlightKeyMap);
  }

  // 渲染逻辑

  // 使用tree进行创建vnode
  keyMapHandle(result, vue) {
    // 处理关键词，结成新结点
    let { text } = result;
    let textArray = text.split(this.hashNum).filter(item => item);

    return vue.$createElement('span', { attrs: {
      highLightScanning: true
    } }, textArray.map(item => (result.filter.indexOf(item) > -1 ? vue.$createElement('span', {
      class: `my-highlight-${this.choseColor(item)}`
    }, item) : vue._v(item))));
  }

  // 使用tree匹配
  useTree(vnode, vue) {
    let { text } = vnode;
    let result = this.keyTree.filterFunc(text, true, this.hashNum);

    if (!result.pass) {
      vnode = { ...vnode, ...this.keyMapHandle(result, vue) };
    }
    return vnode;
  }

  // 切割文本
  splitText(text) {
    // 切割文本
    return text.replace(this.patternText, match => `${this.hashNum}${match}${this.hashNum}`).split(this.hashNum).filter(item => item);
  }

  // 使用正则方式创建vnode
  keyMapHandleReg(textArray, vue) {
    // 处理关键词，结成新结点
    return vue.$createElement('span', {}, textArray.map(item => (this.patternText.test(item) ? vue.$createElement('span', {
      class: `my-highlight-${this.choseColor(item)}`
    }, item) : vue._v(item))));
  }

  // 使用正则匹配方式
  useReg(vnode, vue) {
    let { text } = vnode;
    let result = this.splitText(text);

    if (result.length > 1) {
      vnode = { ...vnode, ...this.keyMapHandleReg(result, vue) };
    }
    return vnode;
  }

  // 文本结点处理
  TextVnodeHandle(vnode, vue) {
    // 0为正则，1为AC
    let useMath = 1;
    return useMath ? this.useTree(vnode, vue) : this.useReg(vnode, vue);
  }

  // 处理V-html
  VhtmlVnodeHandle(vnode, vue) {
    let { innerHTML } = vnode.data.domProps;
    let tag = vnode.tag || 'span';
    let res = vue.compile(`<${tag}>${innerHTML}</${tag}>`);
    vue.$options.staticRenderFns = res.staticRenderFns;

    return res.render.call(vue);
  }

  // 拦截vnode 进行包装
  wrapperVnode(vnode, vue) {

    // 组件不操作
    if (/vue-component/.test(vnode.tag)) {
      return vnode;
    }

    // v-html
    if (util.isVHTML(vnode)) {
      let vnodeData = vnode.data;
      vnode = { ...vnode, ...this.VhtmlVnodeHandle(vnode, vue) };
      delete vnodeData.domProps;
      vnode.data = vnodeData;
    }

    if ((vnode.data && vnode.data.highLightScanning) || /my-highlight/.test(vnode.data ? vnode.data.class : '')) {
      return vnode;
    }

    // vnode
    if (util.isTextVNode(vnode)) {
      return this.TextVnodeHandle(vnode, vue);
    } else {
      if (util.hasChildren(vnode) && !/my-highlight/.test(vnode.data ? vnode.data.class : '')) {

        vnode.children.forEach((itemVnode, index, array) => {
          array[index] = this.wrapperVnode(itemVnode, vue);
        });

      }
    }
    return vnode;
  }
}



const HightLightModoule = {
  install(Vue, options) {

    let isInstall = false;
    const MidRender = Vue.prototype._render;
    const hightLight = new HightLight(options.keyMap);

    Vue.prototype._render = function () {
      let vnode = MidRender.apply(this);
      // ???就好了，，，
      hightLight.wrapperVnode(vnode, this);
      return hightLight.wrapperVnode(vnode, this);
    };

    isInstall = true;

    Vue.prototype.$HighLight = {
      UnInstall(callback) {
        if (!isInstall) {
          return;
        }
        hightLight.init([]);
        Vue.prototype._render = MidRender;
        // 卸载后执行操作，比如存储是否装载信息，后端存储是否应该安装
        callback && callback();
        isInstall = false;
      },
      Update() {
        hightLight.updateKeyWordsMap([]);
      }
    };
  }
};



export default HightLightModoule;
