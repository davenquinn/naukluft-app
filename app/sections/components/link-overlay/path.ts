/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import h from '@macrostrat/hyper';
import T from 'prop-types';

const SectionLinkPath = function(props){
  let {onClick, certainty, style, ...rest} = props;

  if (certainty == null) { certainty = 10; }
  // dash array for certainty
  let strokeDasharray = null;
  if (certainty < 10) {
    strokeDasharray = `${certainty} ${10-certainty}`
  }

  return h('path', {
    onClick,
    fill: 'none',
    style: {
      cursor: onClick ? 'pointer' : null,
      strokeDasharray,
      ...style
    },
    ...rest
  });
};

SectionLinkPath.propTypes = {
  certainty: T.number,
  onClick: T.func,
  stroke: T.string,
  strokeWidth: T.number
};

export {SectionLinkPath};
