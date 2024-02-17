/* eslint-disable default-case */
import { useBaseProps } from "rc-select";
import type { RefOptionListProps } from "rc-select/lib/OptionList";
import * as React from "react";
import RawOptionList from "./List";

const RefOptionList = React.forwardRef<RefOptionListProps>((props, ref) => {
  const baseProps = useBaseProps();

  // >>>>> Render
  return <RawOptionList {...props} {...baseProps} ref={ref} />;
});

RefOptionList.displayName = "RefOptionList"; // Add display name

export default RefOptionList;
