//@flow

'use strict;'

import React, {Component} from 'react'
import {StoreProvider} from 'iflux2'
import AppStore from './store'
import BlogList from './component/blog-list'

// @StoreProvider向React组件提供数据源
@StoreProvider(AppStore, {debug: true})
export default class BlogListApp extends Component {
  componentDidMount() {
    this.props.store.init()
  }

  render() {
    return (
      <BlogList/>
    )
  }
}
