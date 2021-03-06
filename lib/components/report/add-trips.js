import sum from 'lodash/sum'
import React, {Component} from 'react'
import turfLength from '@turf/length'

import message from 'lib/message'
import L from 'lib/leaflet'

import tryCatchRender from '../try-catch-render'
import AddTripPatternLayer from '../modifications-map/add-trip-pattern-layer'
import {secondsToHhMmString} from '../../utils/time'

import DaysOfService from './days-of-service'
import Distance from './distance'
import MiniMap from './mini-map'
import Phase from './phase'
import Speed from './speed'

/**
 * The summary/report view of an add trip pattern modification
 */
class AddTrips extends Component {
  render() {
    const {modification} = this.props
    const segments = modification.segments || []
    const segmentDistances = segments.map((seg) => turfLength(seg.geometry))

    const km = segmentDistances.reduce((a, b) => a + b, 0)
    const bounds = L.latLngBounds(
      [].concat(
        ...segments.map((seg) =>
          seg.geometry.coordinates.map(([lon, lat]) => [lat, lon])
        )
      )
    )

    return (
      <div>
        <MiniMap bounds={bounds}>
          <AddTripPatternLayer bidirectional segments={segments} />
        </MiniMap>

        <i>
          <Distance km={km} />,{' '}
          {modification.bidirectional
            ? message('report.addTrips.bidirectional')
            : message('report.addTrips.unidirectional')}
        </i>

        <table className='table table-striped'>
          <thead>
            <tr>
              <th>{message('report.frequency.name')}</th>
              <th>{message('report.frequency.startTime')}</th>
              <th>{message('report.frequency.endTime')}</th>
              <th>{message('report.frequency.frequency')}</th>
              <th>{message('report.frequency.speed')}</th>
              <th>{message('report.frequency.daysOfService')}</th>
              <th>{message('report.frequency.nTrips')}</th>
            </tr>
          </thead>
          <tbody>
            {(modification.timetables || []).map((tt) =>
              this.renderTimetable({
                bidirectional: !!modification.bidirectional,
                segmentDistances,
                timetable: tt
              })
            )}
          </tbody>
        </table>
      </div>
    )
  }

  // TODO duplicate code from adjust-frequency
  // ...rest will include days of service
  renderTimetable({bidirectional, segmentDistances, timetable}) {
    const {feedScopedStops, projectTimetables} = this.props
    const {
      endTime,
      headwaySecs,
      _id,
      name,
      segmentSpeeds,
      startTime
    } = timetable
    // TODO may be off by one, for instance ten-minute service for an hour will usually be 5 trips not 6
    const nTrips = Math.floor((endTime - startTime) / headwaySecs)

    const totalDistance = sum(segmentDistances)
    const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
    const speed =
      weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance

    const out = [
      <tr key={`${_id}-summary`}>
        <td>{name}</td>
        <td>{secondsToHhMmString(startTime)}</td>
        <td>{secondsToHhMmString(endTime)}</td>
        <td>{Math.round(headwaySecs / 60)}</td>
        <td>
          <Speed kmh={speed} />
        </td>
        <td>
          <DaysOfService {...timetable} />
        </td>
        <td>{bidirectional ? nTrips * 2 : nTrips}</td>
      </tr>
    ]

    // if phasing existed and then is cleared, only the phaseAtStop is cleared so that it can be
    // re-enabled easily.
    if (timetable.phaseAtStop) {
      // hidden, empty row so that striping order is preserved
      // alternate rows are shaded, and we want the phasing row to be shaded the same as the row
      // above it.
      out.push(
        <tr aria-hidden style={{height: 0, border: 0}} key={`${_id}-empty`} />
      )

      // TODO how to indicate to screen readers that this is associated with the row above?
      out.push(
        <tr key={`${_id}-phase`} style={{borderTop: 0}}>
          <td />
          <td colSpan={6}>
            <div>
              <Phase
                projectTimetables={projectTimetables}
                timetable={timetable}
                feedScopedStops={feedScopedStops}
              />
            </div>
          </td>
        </tr>
      )
    }

    return out
  }
}

export default tryCatchRender(AddTrips)
