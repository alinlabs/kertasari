import React, { useRef, useEffect } from "react";

export const AutoResizeTextarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [props.value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={`overflow-hidden resize-none ${props.className || ""}`}
      rows={props.rows || 1}
    />
  );
};
