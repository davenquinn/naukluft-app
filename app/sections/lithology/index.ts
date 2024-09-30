import h from "@macrostrat/hyper";
import { useQuery } from "naukluft-data-backend";
import { LithologyProvider } from "@macrostrat/column-components";

function OurLithologyProvider(props) {
  const lithologies = useQuery("sections/lithology") ?? [];

  return h(LithologyProvider, { lithologies }, props.children);
}

export { OurLithologyProvider as LithologyProvider };
