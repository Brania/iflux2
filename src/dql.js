//flow
import {QL, QueryLang} from './ql';
import {isArray, isStr, isQuery} from './util';

'use strict';

type Lang = Array<string|number|Array<string|number>|Function>;

/**
 * 动态的QueryLang
 */
export class DynamicQueryLang {
  _ctx: Object;
  _ql: Object;

  //init
  constructor(name: string, lang: Lang) {
    this._ctx = {};
    this._ql = QL(name, lang);
  }

  /**
   * 分析路径中的动态元素，然后根据上下文替换
   * @param ql
   */
  analyserLang(ql: Object) {
    //校验query的合法性
    if (!ql.isValidQuery()) {
      throw new Error(`DQL: syntax error`);
    }

    //获取语法结构
    let lang = ql.lang();
    for (let i = 0, len = lang.length - 1; i < len; i++) {
      //获取当前的路径
      let path = lang[i];
      if (isStr(path) && path[0] === '$') {
        //重新赋值
        lang[i] = this._ctx[path.substring(1)];
      } else if (isArray(path)) {
        for (let j = 0, len = path.length; j < len; j++) {
          let path = lang[i][j];
          if (isStr(path) && path[0] === '$') {
            //重新赋值
            lang[i][j] = this._ctx[path.substring(1)];
          }
        }
      } else if (path instanceof DynamicQueryLang) {
        //递归一次
        this.analyserLang(path._ql);
        lang[i] = path._ql;
      }
    }
  }

  /**
   * 返回可用的query lang
   */
  ql() {
    this.analyserLang(this._ql);
    return this._ql;
  }

  /**
   * 设置上下文
   * @param  {Object} ctx
   */
  context(ctx: Object) {
    this._ctx = ctx;
    return this;
  }
}

/**
 * 工厂函数
 * @param  {string name
 * @param  {Lang} lang
 */
export const DQL = (
  name: string,
  lang: Lang
) => new DynamicQueryLang(name, lang);
