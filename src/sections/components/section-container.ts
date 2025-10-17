import hyper from "@macrostrat/hyper";
import { SectionPositionProvider } from "./link-overlay";
import styles from "./section-container.module.sass";

const h = hyper.styled(styles);

export function SectionContainer(props) {
  const { children, minHeight, className } = props;
  return h(SectionPositionProvider, [
    h(
      "div.section-page-inner",
      {
        style: { zoom: 1, minHeight },
        className,
      },
      children,
    ),
  ]);
}
