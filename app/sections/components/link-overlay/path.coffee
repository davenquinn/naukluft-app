import h from '@macrostrat/hyper'
import T from 'prop-types'

SectionLinkPath = (props)->
  {onClick, certainty, style, rest...} = props

  certainty ?= 10
  # dash array for certainty
  strokeDasharray = null
  if certainty < 8
    strokeDasharray = "6 2"
  else if certainty < 5
    strokeDasharray = "6 6"

  h 'path', {
    onClick
    fill: 'none'
    style: {
      cursor: if onClick then 'pointer' else null,
      strokeDasharray
      style...
    }
    rest...
  }

SectionLinkPath.propTypes = {
  certainty: T.number
  onClick: T.func
  stroke: T.string
  strokeWidth: T.number
}

export {SectionLinkPath}
