import classNames from "classnames";
import * as React from "react";
import type { DefaultOptionType, SingleValueType } from "../Cascader";
import CascaderContext from "../context";
import { SEARCH_MARK } from "../hooks/useSearchOptions";
import { isLeaf, toPathKey } from "../utils/commonUtil";
import Checkbox from "./Checkbox";
import { useLocalFilter } from "@/hooks/useLocalFilter";

export const FIX_LABEL = "__cascader_fix_label__";

export interface ColumnProps {
  prefixCls: string;
  multiple?: boolean;
  options: DefaultOptionType[];
  /** Current Column opened item key */
  activeValue?: React.Key;
  /** The value path before current column */
  prevValuePath: React.Key[];
  onToggleOpen: (open: boolean) => void;
  onSelect: (valuePath: SingleValueType, leaf: boolean) => void;
  onActive: (valuePath: SingleValueType) => void;
  checkedSet: Set<React.Key>;
  halfCheckedSet: Set<React.Key>;
  loadingKeys: React.Key[];
  isSelectable: (option: DefaultOptionType) => boolean;
  searchValue?: string;
  activeValueCells?: React.Key[];
  emptyList?: DefaultOptionType[];
  setActiveValueCells?: (activeValueCells: React.Key[]) => void;
}

export default function Column({
  prefixCls,
  multiple,
  options,
  activeValue,
  prevValuePath,
  onToggleOpen,
  onSelect,
  onActive,
  checkedSet,
  halfCheckedSet,
  loadingKeys,
  isSelectable,
  searchValue,
  activeValueCells,
  setActiveValueCells,
  emptyList,
}: ColumnProps) {
  const menuWithSearchCls = `${prefixCls}-menu-search`;
  const menuWithSearchInputCls = `${prefixCls}-menu-search-input`;
  const menuPrefixCls = `${prefixCls}-menu`;
  const menuItemPrefixCls = `${prefixCls}-menu-item`;

  const {
    searchString: localSearchValue,
    setSearchString: setLocalSearchValue,
    filteredOptions,
  } = useLocalFilter({
    options,
    emptyList,
    activeValueCells,
    activeValue,
    setActiveValueCells,
  });

  const {
    fieldNames,
    changeOnSelect,
    expandTrigger,
    expandIcon,
    loadingIcon,
    dropdownMenuColumnStyle,
    showLocalSearch,
  } = React.useContext(CascaderContext);

  const hoverOpen = expandTrigger === "hover";

  // ============================ Option ============================
  const optionInfoList = React.useMemo(
    () =>
      filteredOptions.map((option) => {
        const { disabled, disableCheckbox } = option;

        const searchOptions = option[SEARCH_MARK];
        const label = option[FIX_LABEL] ?? option[fieldNames.label];
        const value = option[fieldNames.value];
        const isGroupLabel = option.groupLabel;

        const isMergedLeaf = isLeaf(option, fieldNames);

        // Get real value of option. Search option is different way.
        const fullPath = searchOptions
          ? searchOptions.map((opt: any) => opt[fieldNames.value])
          : [...prevValuePath, value];
        const fullPathKey = toPathKey(fullPath);

        const isLoading = loadingKeys.includes(fullPathKey);

        // >>>>> checked
        const checked = checkedSet.has(fullPathKey);

        // >>>>> halfChecked
        const halfChecked = halfCheckedSet.has(fullPathKey);

        return {
          disabled,
          label,
          value,
          isLeaf: isMergedLeaf,
          isLoading,
          checked,
          halfChecked,
          option,
          disableCheckbox,
          fullPath,
          fullPathKey,
          isGroupLabel,
        };
      }),
    [
      filteredOptions,
      checkedSet,
      fieldNames,
      halfCheckedSet,
      loadingKeys,
      prevValuePath,
    ]
  );

  // ============================ Render ============================
  return (
    <div className={menuWithSearchCls}>
      {showLocalSearch && (
        <input
          className={menuWithSearchInputCls}
          value={localSearchValue}
          onChange={(e) => {
            setLocalSearchValue(e.target.value);
            e.stopPropagation();
          }}
        />
      )}
      <ul className={menuPrefixCls} role="menu">
        {optionInfoList.map(
          ({
            disabled,
            label,
            value,
            isLeaf: isMergedLeaf,
            isLoading,
            checked,
            halfChecked,
            option,
            fullPath,
            fullPathKey,
            disableCheckbox,
            isGroupLabel,
          }) => {
            // >>>>> Title
            let title: string;
            if (typeof option.title === "string") {
              title = option.title;
            } else if (typeof label === "string") {
              title = label;
            } else {
              title = "";
            }

            const clearLocalSearchInput = () => {
              if (showLocalSearch) {
                setLocalSearchValue("");
              }
            };

            // >>>>> Open
            const triggerOpenPath = () => {
              if (disabled || searchValue) {
                return;
              }
              const nextValueCells = [...fullPath];
              if (hoverOpen && isMergedLeaf) {
                nextValueCells.pop();
              }
              onActive(nextValueCells);
              clearLocalSearchInput();
            };

            // >>>>> Selection
            const triggerSelect = () => {
              if (isSelectable(option)) {
                onSelect(fullPath, isMergedLeaf);
              }
            };

            if (isGroupLabel) {
              return (
                <div
                  key={fullPathKey}
                  role="rowheader"
                  aria-disabled={disabled}
                >
                  {title}
                </div>
              );
            }

            // >>>>> Render
            return (
              <li
                key={fullPathKey}
                className={classNames(menuItemPrefixCls, {
                  [`${menuItemPrefixCls}-expand`]: !isMergedLeaf,
                  [`${menuItemPrefixCls}-active`]:
                    activeValue === value || activeValue === fullPathKey,
                  [`${menuItemPrefixCls}-disabled`]: disabled,
                  [`${menuItemPrefixCls}-loading`]: isLoading,
                })}
                style={dropdownMenuColumnStyle}
                role="menuitemcheckbox"
                title={title}
                aria-label={title}
                aria-checked={checked}
                data-path-key={fullPathKey}
                onClick={() => {
                  triggerOpenPath();
                  if (disableCheckbox) {
                    return;
                  }
                  if (!multiple || isMergedLeaf) {
                    triggerSelect();
                  }
                }}
                onDoubleClick={() => {
                  if (changeOnSelect) {
                    onToggleOpen(false);
                  }
                }}
                onMouseEnter={() => {
                  if (hoverOpen) {
                    triggerOpenPath();
                  }
                }}
                onMouseDown={(e) => {
                  // Prevent selector from blurring
                  e.preventDefault();
                }}
              >
                {multiple && (
                  <Checkbox
                    prefixCls={`${prefixCls}-checkbox`}
                    checked={checked}
                    halfChecked={halfChecked}
                    disabled={disabled || disableCheckbox}
                    disableCheckbox={!!disableCheckbox}
                    onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                      if (disableCheckbox) {
                        return;
                      }
                      e.stopPropagation();
                      triggerSelect();
                    }}
                  />
                )}
                <div className={`${menuItemPrefixCls}-content`}>{label}</div>
                {!isLoading && expandIcon && !isMergedLeaf && (
                  <div className={`${menuItemPrefixCls}-expand-icon`}>
                    {expandIcon}
                  </div>
                )}
                {isLoading && loadingIcon && (
                  <div className={`${menuItemPrefixCls}-loading-icon`}>
                    {loadingIcon}
                  </div>
                )}
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
}
