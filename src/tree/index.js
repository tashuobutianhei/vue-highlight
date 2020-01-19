import Tree from './tree';

class HighLight extends Tree {
  // 是否替换原文本敏感词
  constructor(keywords) {
    super();
    if (!(keywords instanceof Array)) {
      throw Error('HighLight：高亮词表keywords应该是一个数组！');
    }
    // 创建Trie树
    for (let item of keywords) {
      if (!item) {
        continue;
      }
      item = item.toString();
      if (/[a-z]/i.test(item)) {
        // 有字母
        this.insert(item.toLocaleUpperCase());
      } else {
        this.insert(item);
      }
    }

    this.createFailureTable();
  }

  // 匹配规则遵循最长和交叉两个规则
  // 最长规则: 若一个关键词包含另一个关键词，则最长的关键词高亮
  // 交叉规则：如一个关键词和另一个关键词重叠，则取前者
  filterFunc(word, replace = true, hashNum) {
    const wordLen = word.length;
    let startIndex = 0;
    let endIndex = startIndex;
    let originalWord = word; // 副本
    let filterKeywords = []; // 记录找的的关键词
    let filterTextArr = []; // 保存过滤文本
    let isPass = true; // 是否通过，是否有高亮词
    let searchNode = this.root; // 下一个Node与当前Node
    let isStart = false; // 是否开始匹配
    let filterMaxKeywords = []; // 用于暂存最长词

    word = word.toLocaleUpperCase();

    while (endIndex < wordLen) {
      let key = word[endIndex];
      let nextNode = this.search(key, searchNode.children);
      filterTextArr[endIndex] = key;
      // 判断是否找到
      if (nextNode) {
        // 开始匹配
        if (!isStart) {
          isStart = true;
          startIndex = endIndex;
          filterMaxKeywords = [];
        }

        // 结束标示，为了最大词就要跑完整棵树
        if (nextNode.word) {
          // 先记录这个词
          filterMaxKeywords.push({
            text: filterTextArr.slice(startIndex, endIndex + 1).join(''),
            startIndex,
            endIndex
          });

          // 直到无法匹配为止
          if (endIndex + 1 <= wordLen && !this.search(word[endIndex + 1], nextNode.children)) {
            isPass = false;
            isStart = isPass;


            let maxlenItem = filterMaxKeywords.length > 0 ? filterMaxKeywords[0] : {
              startIndex,
              endIndex
            };

            filterMaxKeywords.forEach((item, index) => {
              if (item.text.length > maxlenItem.text.length) {
                maxlenItem = item;
              }
            });

            filterKeywords.push(filterTextArr.slice(maxlenItem.startIndex, maxlenItem.endIndex + 1).join(''));

            filterTextArr[maxlenItem.startIndex] = hashNum + filterTextArr[maxlenItem.startIndex];
            filterTextArr[maxlenItem.endIndex] = filterTextArr[maxlenItem.endIndex] + hashNum;

            nextNode = false;
          } else {

          }
        }
      } else if (isStart) {
        isStart = false;
        // 在失配路线上找到子元素
        searchNode = searchNode.failure;
        nextNode = this.search(key, searchNode.children);
        if (nextNode && searchNode.key !== 'root') {
          startIndex = endIndex - 1;
          isPass = true;
          isStart = isPass;
          nextNode = searchNode;
        } else {
          nextNode = false;
        }
        endIndex--;
      } else {
        isStart = false;
      }

      searchNode = nextNode || searchNode.failure || this.root;
      endIndex++;
    }

    return {
      text: replace ? filterTextArr.join('') : originalWord,
      filter: [...new Set(filterKeywords)],
      pass: isPass
    };
  }
}

export default HighLight;
