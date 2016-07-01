/**
 * Atom
 *
 * @flow
 */
import {fromJS} from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import {isArray, isStr, isFn} from './util';


/**
 * 原子不可变数据容器
 * @flow
 */
export default class Atom {
  _atom: Object;
  _callbacks: Array<Function>;


  /**
   * 初始化初始的数据结构
   */
  constructor(record: Object) {
    this._callbacks = [];
    this._atom = fromJS(record);
  }


  /**
   * 获取值
   * 1. 如果path为空,就返回所有的值
   * 2. 如果path为字符串或者数组就按照immutable的path返回数据
   * 3. 其他返回空值
   * @param path
   * @returns {*}
   */
  value(path: string|Array<String>) {
    let value = null;
    if(!path) {
      value = this._atom;
    } else if (isStr(path) || isArray(path)) {
      value = this._atom[isStr(path) ? 'get' : 'getIn'](path);
    }
    return value;
  }


  /**
   * 获取cursor
   */
  cursor() {
    return Cursor.from(this._atom, (newState, state, path) => {
      //校验数据是否过期
      if (state != this._atom) {
        console.log && console.log('attempted to alter expired data.');
      }

      //校验有没有数据的变化
      if (newState === state) {
        return;
      }

      this._atom = newState;
      this._callbacks.forEach(cb => cb(newState, path));
    });
  }


  /**
   * 订阅
   */
  subscribe(callback: Function) {
    if (!callback || !isFn(callback)) {
      return;
    }

    //防止重复添加
    for (let i = 0, len = this._callbacks.length; i < len; i++) {
      if (callback === this._callbacks[i]) {
        return;
      }
    }

    this._callbacks.push(callback);
  }


  /**
   * 取消订阅
   */
  unsubscribe(callback: Function) {
    if (!callback || !isFn(callback)) {
      return;
    }

    for (let i = 0, len = this._callbacks.length; i < len; i++) {
      if (callback === this._callbacks[i]) {
        this._callbacks.splice(i, 1);
        break;
      }
    }
  }


  /**
   * 打印出当前的内部数据状态
   */
  pprint() {
    console.log(JSON.stringify(this._atom.toJS(), null, 2));
  }
}
