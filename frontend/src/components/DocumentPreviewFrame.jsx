import React, { useEffect, useRef, useState } from "react";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const DocumentPreviewFrame = ({ html, title = "Document preview" }) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = wrapperRef.current?.clientWidth || A4_WIDTH;
      setScale(Math.min(1, Math.max(0.1, (width - 16) / A4_WIDTH)));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden">
      <div className="flex w-full justify-center" style={{ height: `${A4_HEIGHT * scale}px` }}>
        <iframe
          className="h-[1123px] w-[794px] max-w-none shrink-0 border-0 bg-white shadow-sm"
          title={title}
          srcDoc={html}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        />
      </div>
    </div>
  );
};

export default DocumentPreviewFrame;
