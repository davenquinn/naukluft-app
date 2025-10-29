import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Button } from "@blueprintjs/core";
import hyper from "@macrostrat/hyper";
import styles from "./print-area.module.sass";

const h = hyper.styled(styles);

export function PrintButton({
  elementRef,
  disabled,
  filename,
}: {
  elementRef: React.RefObject<HTMLElement>;
  filename?: string;
  disabled?: boolean;
}) {
  const handlePrint = () => {
    const el = elementRef.current;
    if (el == null) return;

    console.log("Printing element:", el);

    const size = el.getBoundingClientRect();
    const orientation = size.width > size.height ? "landscape" : "portrait";

    const ppi = 300;

    const width = size.width / 96; // Convert from px to in (assuming 96 ppi for screen)
    const height = size.height / 96;

    html2pdf(el, {
      filename,
      html2canvas: {
        scale: ppi / 96,
      },
      jsPDF: {
        orientation,
        unit: "in",
        format: [width, height],
      },
      margin: 0,
    });
  };
  return h(Button, { icon: "print", disabled: disabled, onClick: handlePrint });
}

export function PrintArea({
  children,
  filename,
}: {
  children: React.ReactNode;
  filename?: string;
}) {
  const ref = useRef(null);

  return h("div.print-area-container", [
    h("div.controls", [h(PrintButton, { elementRef: ref, filename })]),
    h("div.print-area", { ref }, children),
  ]);
}
