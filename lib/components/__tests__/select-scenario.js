/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import SelectScenario from '../select-scenario'

describe('Component > SelectScenario', () => {
  it('renders correctly', () => {
    const mockScenarios = [{ id: 1, name: 'S1' }, { id: 2, name: 'S2' }]
    const pushFn = jest.fn()
    const tree = renderer.create(
      <SelectScenario
        projectId='P1'
        push={pushFn}
        scenarios={mockScenarios}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(pushFn).not.toBeCalled()
  })
})