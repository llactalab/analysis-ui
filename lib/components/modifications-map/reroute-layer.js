import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import get from 'lodash/get'
import React from 'react'

import colors from 'lib/constants/colors'
import {getPatternsForModification} from 'lib/utils/patterns'

import DirectionalMarkers from '../directional-markers'
import GeoJSON from '../map/geojson'
import PatternGeometry from '../map/geojson-patterns'

const LINE_WEIGHT = 3

/**
 * A layer showing a reroute modification
 */
export default React.memo(function RerouteLayer(p) {
  // dim, feed, modification
  const patterns = getPatternsForModification(p)
  if (!patterns || !p.feed) return null
  return (
    <>
      <PatternGeometry
        color={colors.NEUTRAL_LIGHT}
        dim={p.dim}
        patterns={patterns}
      />
      <DirectionalMarkers
        color={colors.NEUTRAL_LIGHT}
        dim={p.dim}
        patterns={patterns}
      />
      {get(p.modification, 'segments[0].geometry.type') === 'LineString' && (
        <>
          <GeoJSON
            data={getRemovedSegments(p.feed, p.modification, patterns)}
            color={colors.REMOVED}
            opacity={p.dim ? 0.5 : 1}
            weight={LINE_WEIGHT}
          />
          <GeoJSON
            data={getAddedSegments(p.modification)}
            color={colors.ADDED}
            opacity={p.dim ? 0.5 : 1}
            weight={LINE_WEIGHT}
          />
        </>
      )}
    </>
  )
})

// Convert added segments into GeoJSON
function getAddedSegments(modification) {
  return {
    type: 'FeatureCollection',
    features: modification.segments.map((segment) => {
      return {
        type: 'Feature',
        geometry: segment.geometry,
        properties: {}
      }
    })
  }
}

function getRemovedSegments(feed, modification, patterns) {
  const removedSegments = (patterns || [])
    .map((pattern) => {
      // make sure the modification applies to this pattern. If the modification
      // doesn't have a start or end stop, just use the first/last stop as this is
      // just for display and we can't highlight past the stops anyhow
      const fromStopIndex =
        modification.fromStop != null
          ? pattern.stops.findIndex((s) => s.stop_id === modification.fromStop)
          : 0
      // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
      const toStopIndex =
        modification.toStop != null
          ? pattern.stops.findIndex(
              (s, i) => i > fromStopIndex && s.stop_id === modification.toStop
            )
          : pattern.stops.length - 1

      const modificationAppliesToThisPattern =
        fromStopIndex !== -1 && toStopIndex !== -1
      if (modificationAppliesToThisPattern) {
        // NB using indices here so we get an object even if fromStop or toStop
        // is null stops in pattern are in fact objects but they only have stop ID.
        const fromStop = feed.stopsById[pattern.stops[fromStopIndex].stop_id]
        const toStop = feed.stopsById[pattern.stops[toStopIndex].stop_id]

        return lineSlice(
          point([fromStop.stop_lon, fromStop.stop_lat]),
          point([toStop.stop_lon, toStop.stop_lat]),
          {
            type: 'Feature',
            geometry: pattern.geometry,
            properties: {}
          }
        )
      }
    })
    .filter((segment) => !!segment)

  return {
    type: 'FeatureCollection',
    features: removedSegments
  }
}
