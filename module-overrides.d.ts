//import type { HyperStyled } from "@macrostrat/hyper";

interface HyperStyled {
  [key: string]: string;
  (...args: any[]): any;
}

declare module "*.module.scss" {
  //type HyperStyled = import("@macrostrat/hyper").Hyper;
  const classes: HyperStyled;
  export default classes;
}
declare module "*.module.sass" {
  //type HyperStyled = import("@macrostrat/hyper").Hyper;
  const classes: HyperStyled;
  export default classes;
}

declare module "*.module.styl" {
  //type HyperStyled = import("@macrostrat/hyper").Hyper;
  const classes: HyperStyled;
  export default classes;
}
