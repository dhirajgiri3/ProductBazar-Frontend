"use client";

import React from "react";
import LoadingSpinner from "../common/LoadingSpinner";

// A backwards-compatibility wrapper so older code that imports
// `LoaderComponent` continues to work. It simply renders the new
// `LoadingSpinner` component, mapping the `message` prop (historically
// used in LoaderComponent) to the `text` prop expected by
// LoadingSpinner. All other props are forwarded unchanged.
const LoaderComponent = ({ message, text, size, ...rest }) => {
  let mappedSize = size;
  if (size === "small") mappedSize = "sm";
  if (size === "large") mappedSize = "lg";

  return <LoadingSpinner text={text ?? message} size={mappedSize} {...rest} />;
};

export default LoaderComponent; 