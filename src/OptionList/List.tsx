/* eslint-disable default-case */
import classNames from "classnames";
import type { useBaseProps } from "rc-select";
import type { RefOptionListProps } from "rc-select/lib/OptionList";
import * as React from "react";
import type { DefaultOptionType, SingleValueType } from "../Cascader";
import CascaderContext from "../context";
import {
  getFullPathKeys,
  isLeaf,
  scrollIntoParentView,
  toPathKey,
  toPathKeys,
  toPathValueStr,
} from "../utils/commonUtil";
import { toPathOptions } from "../utils/treeUtil";
import CacheContent from "./CacheContent";
import Column, { FIX_LABEL } from "./Column";
import useActive from "./useActive";
import useKeyboard from "./useKeyboard";
import useDisplayValues from "@/hooks/useDisplayValues";

export type RawOptionListProps = Pick<
  ReturnType<typeof useBaseProps>,
  | "prefixCls"
  | "multiple"
  | "searchValue"
  | "toggleOpen"
  | "notFoundContent"
  | "direction"
  | "open"
>;

const RawOptionList = React.forwardRef<RefOptionListProps, RawOptionListProps>(
  (props, ref) => {
    const {
      prefixCls,
      multiple,
      searchValue,
      toggleOpen,
      notFoundContent,
      direction,
      open,
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const rtl = direction === "rtl";

    const {
      options,
      values,
      halfValues,
      fieldNames,
      changeOnSelect,
      onSelect,
      searchOptions,
      dropdownPrefixCls,
      loadData,
      expandTrigger,
      showLocalSearch,
    } = React.useContext(CascaderContext);

    const mergedPrefixCls = dropdownPrefixCls || prefixCls;

    // ========================= loadData =========================
    const [loadingKeys, setLoadingKeys] = React.useState<string[]>([]);

    const internalLoadData = (valueCells: React.Key[]) => {
      // Do not load when search
      if (!loadData || searchValue) {
        return;
      }

      const optionList = toPathOptions(
        valueCells as SingleValueType,
        options!,
        fieldNames
      );
      const rawOptions = optionList.map(({ option }) => option);
      const lastOption = rawOptions[rawOptions.length - 1];

      if (lastOption && !isLeaf(lastOption, fieldNames)) {
        const pathKey = toPathKey(valueCells as SingleValueType);

        setLoadingKeys((keys) => [...keys, pathKey]);

        loadData(rawOptions);
      }
    };

    // zombieJ: This is bad. We should make this same as `rc-tree` to use Promise instead.
    React.useEffect(() => {
      if (loadingKeys.length) {
        loadingKeys.forEach((loadingKey) => {
          const valueStrCells = toPathValueStr(loadingKey);
          const optionList = toPathOptions(
            valueStrCells,
            options!,
            fieldNames,
            true
          ).map(({ option }) => option);
          const lastOption = optionList[optionList.length - 1];

          if (
            !lastOption ||
            lastOption[fieldNames.children] ||
            isLeaf(lastOption, fieldNames)
          ) {
            setLoadingKeys((keys) => keys.filter((key) => key !== loadingKey));
          }
        });
      }
    }, [options, loadingKeys, fieldNames]);

    // ========================== Values ==========================
    const checkedSet = React.useMemo(
      () => new Set(toPathKeys(values)),
      [values]
    );
    const halfCheckedSet = React.useMemo(
      () => new Set(toPathKeys(halfValues)),
      [halfValues]
    );

    // ====================== Accessibility =======================
    const [activeValueCells, setActiveValueCells] = useActive(multiple, !!open);

    // =========================== Path ===========================
    const onPathOpen = (nextValueCells: React.Key[]) => {
      setActiveValueCells(nextValueCells);

      // Trigger loadData
      internalLoadData(nextValueCells);
    };

    const isSelectable = (option: DefaultOptionType) => {
      const { disabled } = option;

      const isMergedLeaf = isLeaf(option, fieldNames);
      return !disabled && (isMergedLeaf || changeOnSelect || multiple);
    };

    const onPathSelect = (
      valuePath: SingleValueType,
      leaf: boolean,
      fromKeyboard = false
    ) => {
      onSelect(valuePath);

      if (
        !multiple &&
        (leaf ||
          (changeOnSelect && (expandTrigger === "hover" || fromKeyboard)))
      ) {
        toggleOpen(false);
      }
    };

    // ========================== Option ==========================
    const mergedOptions = React.useMemo(() => {
      if (searchValue) {
        return searchOptions;
      }

      return options;
    }, [searchValue, searchOptions, options]);

    // ========================== Column ==========================
    const optionColumns = React.useMemo(() => {
      const optionList = [{ options: mergedOptions }];
      let currentList = mergedOptions;

      const fullPathKeys = getFullPathKeys(currentList!, fieldNames);

      for (let i = 0; i < activeValueCells.length; i += 1) {
        const activeValueCell = activeValueCells[i];
        const currentOption = currentList?.find(
          (option, index) =>
            (fullPathKeys[index]
              ? toPathKey(fullPathKeys[index])
              : option[fieldNames.value]) === activeValueCell
        );

        const subOptions = currentOption?.[fieldNames.children];
        if (!subOptions?.length) {
          break;
        }

        currentList = subOptions;
        optionList.push({ options: subOptions });
      }

      return optionList;
    }, [mergedOptions, activeValueCells, fieldNames]);

    // ========================= Keyboard =========================
    const onKeyboardSelect = (
      selectValueCells: SingleValueType,
      option: DefaultOptionType
    ) => {
      if (isSelectable(option)) {
        onPathSelect(selectValueCells, isLeaf(option, fieldNames), true);
      }
    };

    useKeyboard(
      ref,
      mergedOptions!,
      fieldNames,
      activeValueCells,
      onPathOpen,
      onKeyboardSelect,
      {
        direction: direction!,
        searchValue,
        toggleOpen,
        open: !!open,
        showLocalSearch: !!showLocalSearch,
      }
    );

    // >>>>> Active Scroll
    React.useEffect(() => {
      for (let i = 0; i < activeValueCells.length; i += 1) {
        const cellPath = activeValueCells.slice(0, i + 1);
        const cellKeyPath = toPathKey(cellPath as SingleValueType);
        const ele = containerRef.current?.querySelector<HTMLElement>(
          `li[data-path-key="${cellKeyPath.replace(/\\{0,2}"/g, '\\"')}"]` // matches unescaped double quotes
        );
        if (ele) {
          scrollIntoParentView(ele);
        }
      }
    }, [activeValueCells]);

    // ========================== Render ==========================
    // >>>>> Empty
    const isEmpty = !optionColumns[0]?.options?.length;

    const emptyList: DefaultOptionType[] = [
      {
        [fieldNames.value as "value"]: "__EMPTY__",
        [FIX_LABEL as "label"]: notFoundContent,
        disabled: true,
      },
    ];

    const columnProps = {
      ...props,
      multiple: !isEmpty && multiple,
      onSelect: onPathSelect,
      onActive: onPathOpen,
      onToggleOpen: toggleOpen,
      checkedSet,
      halfCheckedSet,
      loadingKeys,
      isSelectable,
    };

    // >>>>> Columns
    const mergedOptionColumns = isEmpty
      ? [{ options: emptyList }]
      : optionColumns;

    const displayValues = useDisplayValues(
      [activeValueCells as SingleValueType],
      mergedOptions!,
      fieldNames,
      multiple
    );

    const columnNodes: React.ReactElement[] = mergedOptionColumns.map(
      (col, index) => {
        const prevValuePath = activeValueCells.slice(0, index);
        const activeValue = activeValueCells[index];

        return (
          <div key={index}>
            <Column
              key={index}
              {...columnProps}
              activeValueCells={activeValueCells}
              setActiveValueCells={setActiveValueCells}
              emptyList={emptyList}
              searchValue={searchValue}
              prefixCls={mergedPrefixCls}
              options={col.options!}
              prevValuePath={prevValuePath}
              activeValue={activeValue}
            />
          </div>
        );
      }
    );

    const message = displayValues[0]?.label;

    // >>>>> Render
    return (
      <CacheContent open={open}>
        <div
          className={classNames(`${mergedPrefixCls}-menus`, {
            [`${mergedPrefixCls}-menu-empty`]: isEmpty,
            [`${mergedPrefixCls}-rtl`]: rtl,
          })}
          ref={containerRef}
        >
          {columnNodes}
        </div>
        <div
          className={`${mergedPrefixCls}-menu-current-item`}
          aria-live="polite"
        >
          {message}
        </div>
      </CacheContent>
    );
  }
);

if (process.env.NODE_ENV !== "production") {
  RawOptionList.displayName = "RawOptionList";
}

/**
 * 1. Basic casacder on sandbox
 * 2. Rc - cascader reference.
 * 3. Positioning - popper js
 * 4. Accessibility -> not able to hear the options
 */

export default RawOptionList;
