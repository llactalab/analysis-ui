/** the layer for an add trip pattern modification, pass in an already-constructed leaflet-transit-editor instance */

import { MapControl } from 'react-leaflet'
import { PropTypes } from 'react'
import { updateTimes } from '../timetable'

export default class AddTripPatternControl extends MapControl {
  static propTypes = {
    leafletTransitEditor: PropTypes.object.isRequired,
    setMapState: PropTypes.func.isRequired,
    replaceModification: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.close = this.close.bind(this)
    this.saveEdits = this.saveEdits.bind(this)
  }

  componentWillMount () {
    this.leafletElement = this.props.leafletTransitEditor.getControl({ save: this.saveEdits, close: this.close })
  }

  saveEdits (atp) {
    let modification = Object.assign({}, this.props.modification, this.props.leafletTransitEditor.getModification())
    modification.timetables = modification.timetables.map((t) => Object.assign({}, t))
    modification.timetables.forEach((tt) => updateTimes(tt, modification))
    this.props.replaceModification(modification)
  }

  close () {
    this.props.setMapState({})
  }
}