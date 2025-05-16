// DropdownPortal.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DropdownPortal = ({ targetRef, children }) => {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999
      });
    }
  }, [targetRef]);

  return createPortal(
    <div ref={dropdownRef} style={style} className="bg-white border border-gray-300 rounded-md shadow-lg">
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
