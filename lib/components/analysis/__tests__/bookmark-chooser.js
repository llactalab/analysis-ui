import React from 'react'

import BookmarkChooser from '../bookmark-chooser'
import {mockWithProvider} from 'lib/utils/mock-data'

describe('Components > Analysis > Bookmark Chooser', function () {
  it('should render correctly', function () {
    const {wrapper} = mockWithProvider(<BookmarkChooser />)
    expect(wrapper).toMatchSnapshot()
    wrapper.unmount()
  })
})
