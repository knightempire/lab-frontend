import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DropdownPortal = ({ targetRef, children, className = "", style: customStyle = {}, onClose }) => {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
        ...customStyle,
      });
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [targetRef?.current]);

  useEffect(() => {
    if (!onClose) return;
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        targetRef.current &&
        !targetRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, targetRef]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className={`bg-white border border-gray-300 rounded-md shadow-lg ${className}`}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;