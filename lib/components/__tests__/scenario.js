/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import Scenario from '../scenario'

describe('Component > Scenario', () => {
  it('renders correctly', () => {
    const addComponentToMapFn = jest.fn()
    const loadFn = jest.fn()
    const tree = renderer.create(
      <Scenario
        addComponentToMap={addComponentToMapFn}
        id='1234'
        isLoaded={false}
        load={loadFn}
        name='Test'
        projectId='Test1234'
        >
        Scenario content
      </Scenario>
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(addComponentToMapFn).not.toBeCalled()
    expect(loadFn).toBeCalled()
  })
})