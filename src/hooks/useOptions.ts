import * as React from "react";
import type { DefaultOptionType } from "..";
import type { InternalFieldNames, SingleValueType } from "../Cascader";
import useEntities, { type GetEntities } from "./useEntities";
import { DataNode } from "rc-tree/lib/interface";

type IndexableNode = DataNode & {
  [key: string]: any;
};

export default function useOptions(
  mergedFieldNames: InternalFieldNames,
  options?: DefaultOptionType[],
  grouping?: boolean
): [
  mergedOptions: DefaultOptionType[],
  getPathKeyEntities: GetEntities,
  getValueByKeyPath: (pathKeys: React.Key[]) => SingleValueType[]
] {
  const mergedOptions = React.useMemo(() => {
    let finalOptions: DefaultOptionType[] = [];
    if (grouping) {
      const groupedOptions: DefaultOptionType[] = [];
      options?.forEach((option) => {
        const { children, ...optionWithoutChildren } = option;
        groupedOptions.push({
          ...optionWithoutChildren,
          groupLabel: option.label,
          disabled: true,
        });
        if (children) groupedOptions.push(...children);
      });
      finalOptions = groupedOptions;
    } else {
      finalOptions = options || [];
    }
    return finalOptions;
  }, [options, grouping]);

  // Only used in multiple mode, this fn will not call in single mode
  const getPathKeyEntities = useEntities(mergedOptions, mergedFieldNames);

  /** Convert path key back to value format */
  const getValueByKeyPath = React.useCallback(
    (pathKeys: React.Key[]): SingleValueType[] => {
      const keyPathEntities = getPathKeyEntities();

      return pathKeys.map((pathKey) => {
        const { nodes } = keyPathEntities[pathKey as number];

        return nodes.map((node: IndexableNode) => node[mergedFieldNames.value]);
      });
    },
    [getPathKeyEntities, mergedFieldNames]
  );

  return [mergedOptions, getPathKeyEntities, getValueByKeyPath];
}
