import {hyperStyled} from "@macrostrat/hyper"
import styles from "../main.styl"

const h = hyperStyled(styles)

function LayoutGroup(props){

  const {width, children, className} = props;

  const name = props.name ?? props.location;
  const id = props.id ?? props.location;
  let style = props.style ?? {};
  if (style.width == null) {
    style.width = width;
  }

  return h('div.location-group', {id, style, className}, [
    h('h1', null, name),
    h('div.location-group-body', null, children)
  ])
}

export {LayoutGroup}
