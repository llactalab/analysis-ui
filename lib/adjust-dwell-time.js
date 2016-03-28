/** Change dwell times */

import React, { Component, PropTypes } from 'react'
import uuid from 'uuid'

import SelectRouteAndPatterns from './select-route-and-patterns'
import SelectStops from './select-stops'

export default class AdjustDwellTime extends Component {
  static propTypes = {
    modification: PropTypes.object.isRequired,
    replaceModification: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props)

    this.onNameChange = this.onNameChange.bind(this)
    this.onPatternSelectorChange = this.onPatternSelectorChange.bind(this)
    this.onStopSelectorChange = this.onStopSelectorChange.bind(this)
    this.setScale = this.setScale.bind(this)
    this.setSpeed = this.setSpeed.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  onNameChange (e) {
    this.props.replaceModification(Object.assign({}, this.props.modification, { name: e.target.value }))
  }

  onPatternSelectorChange (value) {
    let { feed, routes, trips } = value
    let modification = Object.assign({}, this.props.modification, { feed, routes, trips, stops: null })
    this.props.replaceModification(modification)
  }

  onStopSelectorChange (stops) {
    this.props.replaceModification(Object.assign({}, this.props.modification, { stops }))
  }

  /** we are setting a scale for existing speeds, not an actual speed */
  setScale (e) {
    if (e.target.checked) this.props.replaceModification(Object.assign({}, this.props.modification, { scale: true }))
  }

  /** we are setting a brand-new speed, throwing out any existing variation in speed */
  setSpeed (e) {
    if (e.target.checked) this.props.replaceModification(Object.assign({}, this.props.modification, { scale: false }))
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  setValue (e) {
    this.props.replaceModification(Object.assign({}, this.props.modification, { value: e.target.value }))
  }

  render () {
    return <div>
      <input type='text' placeholder='name' value={this.props.modification.name} onChange={this.onNameChange} />

      <SelectRouteAndPatterns routes={this.props.modification.routes} feed={this.props.modification.feed} trips={this.props.modification.trips} onChange={this.onPatternSelectorChange}
        addLayer={this.props.addLayer} removeLayer={this.props.removeLayer} addControl={this.props.addControl} removeControl={this.props.removeControl} data={this.props.data} />

      {(() => {
        if (this.props.modification.routes != null) {
          return <SelectStops modification={this.props.modification} nullIsWildcard onChange={this.onStopSelectorChange} data={this.props.data} setMapState={this.props.setMapState} />
        } else return <span/>
      })()}

      <label><input type='radio' value='scale' checked={this.props.modification.scale} onChange={this.setScale} />Scale existing dwell times by</label>
      <label><input type='radio' value='speed' checked={!this.props.modification.scale} onChange={this.setSpeed} />Set new dwell time to</label>

      <label><input type='number' step='any' value={this.props.modification.value} onChange={this.setValue} />{ this.props.modification.scale ? 'x' : 'seconds' }</label>
    </div>
  }
}

export function create () {
  return {
    id: uuid.v4(),
    type: 'adjust-dwell-time',
    feed: null,
    routes: null,
    trips: null,
    stops: null,
    value: 30,
    scale: false,
    name: '',
    expanded: true,
    showOnMap: true
  }
}