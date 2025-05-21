import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DropdownPortal = ({ targetRef, children, className = "", style: customStyle = {}, onClose, position = "bottom" }) => {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight || 0;
      
      // Position dropdown based on specified position prop
      const positionStyles = position === "top" 
        ? {
            top: rect.top + window.scrollY - dropdownHeight,
            left: rect.left + window.scrollX,
          }
        : {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          };
      
      setStyle({
        position: "absolute",
        width: rect.width,
        zIndex: 9999,
        ...positionStyles,
        ...customStyle,
      });
    }
  };

  useEffect(() => {
    // Initial position update
    setTimeout(updatePosition, 0); // Use setTimeout to ensure dropdown is rendered first
    
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [targetRef?.current]);

  useEffect(() => {
    // Update position whenever content changes
    updatePosition();
  }, [children]);

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