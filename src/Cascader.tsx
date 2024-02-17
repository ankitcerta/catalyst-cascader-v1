import type {
  BaseSelectProps,
  BaseSelectPropsWithoutPrivate,
  BaseSelectRef,
} from "rc-select";
import { BaseSelect } from "rc-select";
import type { DisplayValueType, Placement } from "rc-select/lib/BaseSelect";
import useId from "rc-select/lib/hooks/useId";
import useEvent from "rc-util/lib/hooks/useEvent";
import useMergedState from "rc-util/lib/hooks/useMergedState";
import * as React from "react";
import CascaderContext from "./context";
import useDisplayValues from "./hooks/useDisplayValues";
import useMissingValues from "./hooks/useMissingValues";
import useOptions from "./hooks/useOptions";
import useSearchConfig from "./hooks/useSearchConfig";
import useSearchOptions from "./hooks/useSearchOptions";
import useSelect from "./hooks/useSelect";
import useValues from "./hooks/useValues";
import OptionList from "./OptionList";
import Panel from "./Panel";
import {
  fillFieldNames,
  SHOW_CHILD,
  SHOW_PARENT,
  toPathKeys,
  toRawValues,
} from "./utils/commonUtil";
import { formatStrategyValues, toPathOptions } from "./utils/treeUtil";
import warningProps, { warningNullOptions } from "./utils/warningPropsUtil";

export type AlignPointTopBottom = "t" | "b" | "c";
export type AlignPointLeftRight = "l" | "r" | "c";
/** Two char of 't' 'b' 'c' 'l' 'r'. Example: 'lt' */
export type AlignPoint = `${AlignPointTopBottom}${AlignPointLeftRight}`;
export type OffsetType = number | `${number}%`;

export interface AlignType {
  /**
   * move point of source node to align with point of target node.
   * Such as ['tr','cc'], align top right point of source node with center point of target node.
   * Point can be 't'(top), 'b'(bottom), 'c'(center), 'l'(left), 'r'(right) */
  points?: (string | AlignPoint)[];
  /**
   * @private Do not use in your production code
   */
  _experimental?: Record<string, any>;
  /**
   * offset source node by offset[0] in x and offset[1] in y.
   * If offset contains percentage string value, it is relative to sourceNode region.
   */
  offset?: OffsetType[];
  /**
   * offset target node by offset[0] in x and offset[1] in y.
   * If targetOffset contains percentage string value, it is relative to targetNode region.
   */
  targetOffset?: OffsetType[];
  /**
   * If adjustX field is true, will adjust source node in x direction if source node is invisible.
   * If adjustY field is true, will adjust source node in y direction if source node is invisible.
   */
  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
    shiftX?: boolean | number;
    shiftY?: boolean | number;
  };
  /** Auto adjust arrow position */
  autoArrow?: boolean;
  /**
   * Config visible region check of html node. Default `visible`:
   *  - `visible`:
   *    The visible region of user browser window.
   *    Use `clientHeight` for check.
   *    If `visible` region not satisfy, fallback to `scroll`.
   *  - `scroll`:
   *    The whole region of the html scroll area.
   *    Use `scrollHeight` for check.
   *  - `visibleFirst`:
   *    Similar to `visible`, but if `visible` region not satisfy, fallback to `scroll`.
   */
  htmlRegion?: "visible" | "scroll" | "visibleFirst";
  /**
   * Auto chose position with `top` or `bottom` by the align result
   */
  dynamicInset?: boolean;
  /**
   * Whether use css right instead of left to position
   */
  useCssRight?: boolean;
  /**
   * Whether use css bottom instead of top to position
   */
  useCssBottom?: boolean;
  /**
   * Whether use css transform instead of left/top/right/bottom to position if browser supports.
   * Defaults to false.
   */
  useCssTransform?: boolean;
  ignoreShake?: boolean;
}

export type BuildInPlacements = Record<string, AlignType>;

export interface ShowSearchType<
  OptionType extends BaseOptionType = DefaultOptionType
> {
  filter?: (
    inputValue: string,
    options: OptionType[],
    fieldNames: FieldNames
  ) => boolean;
  render?: (
    inputValue: string,
    path: OptionType[],
    prefixCls: string,
    fieldNames: FieldNames
  ) => React.ReactNode;
  sort?: (
    a: OptionType[],
    b: OptionType[],
    inputValue: string,
    fieldNames: FieldNames
  ) => number;
  matchInputWidth?: boolean;
  limit?: number | false;
}

export interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface InternalFieldNames extends Required<FieldNames> {
  key: string;
}

export type SingleValueType = (string | number)[];

export type ValueType = SingleValueType | SingleValueType[];
export type ShowCheckedStrategy = typeof SHOW_PARENT | typeof SHOW_CHILD;

export interface BaseOptionType {
  disabled?: boolean;
  [name: string]: any;
}
export interface DefaultOptionType extends BaseOptionType {
  label: React.ReactNode;
  value?: string | number | null;
  children?: DefaultOptionType[];
  disableCheckbox?: boolean;
  groupLabel?: React.ReactNode;
}

interface BaseCascaderProps<
  OptionType extends BaseOptionType = DefaultOptionType
> extends Omit<
    BaseSelectPropsWithoutPrivate,
    "tokenSeparators" | "labelInValue" | "mode" | "showSearch"
  > {
  // MISC
  id?: string;
  prefixCls?: string;
  fieldNames?: FieldNames;
  children?: React.ReactElement;
  grouping?: boolean;

  // Value
  value?: ValueType;
  defaultValue?: ValueType;
  changeOnSelect?: boolean;
  displayRender?: (
    label: string[],
    selectedOptions?: OptionType[]
  ) => React.ReactNode;
  checkable?: boolean | React.ReactNode;
  showCheckedStrategy?: ShowCheckedStrategy;

  // Search
  autoClearSearchValue?: boolean;
  showSearch?: boolean | ShowSearchType<OptionType>;
  searchValue?: string;
  onSearch?: (value: string) => void;

  // Trigger
  expandTrigger?: "hover" | "click";

  // Options
  options?: OptionType[];
  /** @private Internal usage. Do not use in your production. */
  dropdownPrefixCls?: string;
  loadData?: (selectOptions: OptionType[]) => void;

  // Open
  /** @deprecated Use `open` instead */
  popupVisible?: boolean;

  /** @deprecated Use `dropdownClassName` instead */
  popupClassName?: string;
  dropdownClassName?: string;
  dropdownMenuColumnStyle?: React.CSSProperties;

  /** @deprecated Use `placement` instead */
  popupPlacement?: Placement;
  placement?: Placement;
  builtinPlacements?: BuildInPlacements;

  /** @deprecated Use `onDropdownVisibleChange` instead */
  onPopupVisibleChange?: (open: boolean) => void;
  onDropdownVisibleChange?: (open: boolean) => void;

  // Icon
  expandIcon?: React.ReactNode;
  loadingIcon?: React.ReactNode;
}

type OnSingleChange<OptionType> = (
  value: SingleValueType,
  selectOptions: OptionType[]
) => void;
type OnMultipleChange<OptionType> = (
  value: SingleValueType[],
  selectOptions: OptionType[][]
) => void;

export interface SingleCascaderProps<
  OptionType extends BaseOptionType = DefaultOptionType
> extends BaseCascaderProps<OptionType> {
  checkable?: false;

  onChange?: OnSingleChange<OptionType>;
}

export interface MultipleCascaderProps<
  OptionType extends BaseOptionType = DefaultOptionType
> extends BaseCascaderProps<OptionType> {
  checkable: true | React.ReactNode;

  onChange?: OnMultipleChange<OptionType>;
}

export type CascaderProps<
  OptionType extends BaseOptionType = DefaultOptionType
> = SingleCascaderProps<OptionType> | MultipleCascaderProps<OptionType>;

interface CascaderComponent
  extends React.ForwardRefExoticComponent<
    CascaderProps & React.RefAttributes<HTMLElement>
  > {
  SHOW_PARENT: typeof SHOW_PARENT;
  SHOW_CHILD: typeof SHOW_CHILD;
  Panel: typeof Panel;
}

export type InternalCascaderProps<
  OptionType extends BaseOptionType = DefaultOptionType
> = Omit<
  SingleCascaderProps<OptionType> | MultipleCascaderProps<OptionType>,
  "onChange"
> & {
  onChange?: (
    value: SingleValueType | SingleValueType[],
    selectOptions: OptionType[] | OptionType[][]
  ) => void;
};

export type CascaderRef = Omit<BaseSelectRef, "scrollTo">;

export const Cascader = React.forwardRef<CascaderRef, InternalCascaderProps>(
  (props, ref) => {
    const {
      // MISC
      id,
      prefixCls = "rc-cascader",
      fieldNames,
      grouping = false,

      // Value
      defaultValue,
      value,
      changeOnSelect,
      onChange,
      displayRender,
      checkable,

      // Search
      autoClearSearchValue = true,
      searchValue,
      onSearch,
      showSearch,

      // Trigger
      expandTrigger,

      // Options
      options,
      dropdownPrefixCls,
      loadData,

      // Open
      popupVisible,
      open,

      popupClassName,
      dropdownClassName,
      dropdownMenuColumnStyle,
      dropdownStyle: customDropdownStyle,

      popupPlacement,
      placement,

      onDropdownVisibleChange,
      onPopupVisibleChange,

      // Icon
      expandIcon = ">",
      loadingIcon,

      // Children
      children,
      dropdownMatchSelectWidth = false,
      showCheckedStrategy = SHOW_PARENT,
      ...restProps
    } = props;

    const mergedId = useId(id);
    const multiple = !!checkable;

    // =========================== Values ===========================
    const [rawValues, setRawValues] = useMergedState<
      ValueType,
      SingleValueType[]
    >(defaultValue!, {
      value,
      postState: toRawValues,
    });

    // ========================= FieldNames =========================
    const mergedFieldNames = React.useMemo(
      () => fillFieldNames(fieldNames),
      /* eslint-disable react-hooks/exhaustive-deps */
      [JSON.stringify(fieldNames)]
      /* eslint-enable react-hooks/exhaustive-deps */
    );

    // =========================== Option ===========================
    const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
      mergedFieldNames,
      options,
      grouping
    );

    // =========================== Search ===========================
    const [mergedSearchValue, setSearchValue] = useMergedState("", {
      value: searchValue,
      postState: (search) => search || "",
    });

    const onInternalSearch: BaseSelectProps["onSearch"] = (
      searchText,
      info
    ) => {
      setSearchValue(searchText);

      if (info.source !== "blur" && onSearch) {
        onSearch(searchText);
      }
    };

    const [mergedShowSearch, searchConfig] = useSearchConfig(showSearch);

    const searchOptions = useSearchOptions(
      mergedSearchValue,
      mergedOptions,
      mergedFieldNames,
      dropdownPrefixCls || prefixCls,
      searchConfig,
      changeOnSelect!
    );

    // =========================== Values ===========================
    const getMissingValues = useMissingValues(mergedOptions, mergedFieldNames);

    // Fill `rawValues` with checked conduction values
    const [checkedValues, halfCheckedValues, missingCheckedValues] = useValues(
      multiple,
      rawValues,
      getPathKeyEntities,
      getValueByKeyPath,
      getMissingValues
    );

    const deDuplicatedValues = React.useMemo(() => {
      const checkedKeys = toPathKeys(checkedValues);
      const deduplicateKeys = formatStrategyValues(
        checkedKeys,
        getPathKeyEntities,
        showCheckedStrategy
      );

      return [...missingCheckedValues, ...getValueByKeyPath(deduplicateKeys)];
    }, [
      checkedValues,
      getPathKeyEntities,
      getValueByKeyPath,
      missingCheckedValues,
      showCheckedStrategy,
    ]);

    const displayValues = useDisplayValues(
      deDuplicatedValues,
      mergedOptions,
      mergedFieldNames,
      multiple,
      displayRender
    );

    // =========================== Change ===========================
    const triggerChange = useEvent((nextValues: ValueType) => {
      setRawValues(nextValues);

      // Save perf if no need trigger event
      if (onChange) {
        const nextRawValues = toRawValues(nextValues);

        const valueOptions = nextRawValues.map((valueCells) =>
          toPathOptions(valueCells, mergedOptions, mergedFieldNames).map(
            (valueOpt) => valueOpt.option
          )
        );

        const triggerValues = multiple ? nextRawValues : nextRawValues[0];
        const triggerOptions = multiple ? valueOptions : valueOptions[0];

        onChange(triggerValues, triggerOptions);
      }
    });

    // =========================== Select ===========================
    const handleSelection = useSelect(
      multiple,
      triggerChange,
      checkedValues,
      halfCheckedValues,
      missingCheckedValues,
      getPathKeyEntities,
      getValueByKeyPath,
      showCheckedStrategy
    );

    const onInternalSelect = useEvent((valuePath: SingleValueType) => {
      if (!multiple || autoClearSearchValue) {
        setSearchValue("");
      }

      handleSelection(valuePath);
    });

    // Display Value change logic
    const onDisplayValuesChange: BaseSelectProps["onDisplayValuesChange"] = (
      _,
      info
    ) => {
      if (info.type === "clear") {
        triggerChange([]);
        return;
      }

      // Cascader do not support `add` type. Only support `remove`
      const { valueCells } = info.values[0] as DisplayValueType & {
        valueCells: SingleValueType;
      };
      onInternalSelect(valueCells);
    };

    // ============================ Open ============================
    const mergedOpen = open !== undefined ? open : popupVisible;

    const mergedDropdownClassName = dropdownClassName || popupClassName;

    const mergedPlacement = placement || popupPlacement;

    const onInternalDropdownVisibleChange = (nextVisible: boolean) => {
      onDropdownVisibleChange?.(nextVisible);
      onPopupVisibleChange?.(nextVisible);
    };

    // ========================== Warning ===========================
    if (process.env.NODE_ENV !== "production") {
      warningProps(props);
      warningNullOptions(mergedOptions, mergedFieldNames);
    }

    // ========================== Context ===========================
    const cascaderContext = React.useMemo(
      () => ({
        options: mergedOptions,
        fieldNames: mergedFieldNames,
        values: checkedValues,
        halfValues: halfCheckedValues,
        changeOnSelect,
        onSelect: onInternalSelect,
        checkable,
        searchOptions,
        dropdownPrefixCls,
        loadData,
        expandTrigger,
        expandIcon,
        loadingIcon,
        dropdownMenuColumnStyle,
        grouping,
      }),
      [
        mergedOptions,
        mergedFieldNames,
        checkedValues,
        halfCheckedValues,
        changeOnSelect,
        onInternalSelect,
        checkable,
        searchOptions,
        dropdownPrefixCls,
        loadData,
        expandTrigger,
        expandIcon,
        loadingIcon,
        dropdownMenuColumnStyle,
        grouping,
      ]
    );

    // ==============================================================
    // ==                          Render                          ==
    // ==============================================================
    const emptyOptions = !(mergedSearchValue ? searchOptions : mergedOptions)
      .length;

    const dropdownStyle: React.CSSProperties =
      // Search to match width
      (mergedSearchValue && searchConfig.matchInputWidth) ||
      // Empty keep the width
      emptyOptions
        ? {}
        : {
            minWidth: "auto",
          };

    console.log({
      dropdownStyle,
      customDropdownStyle,
    });
    return (
      <CascaderContext.Provider value={cascaderContext}>
        <BaseSelect
          {...restProps}
          // MISC
          ref={ref as any}
          id={mergedId}
          prefixCls={prefixCls}
          autoClearSearchValue={autoClearSearchValue}
          dropdownMatchSelectWidth={dropdownMatchSelectWidth}
          dropdownStyle={{
            ...dropdownStyle,
            ...customDropdownStyle,
          }}
          // Value
          displayValues={displayValues}
          aria-label={displayValues.join(" ")}
          onDisplayValuesChange={onDisplayValuesChange}
          mode={multiple ? "multiple" : undefined}
          // Search
          searchValue={mergedSearchValue}
          onSearch={onInternalSearch}
          showSearch={mergedShowSearch}
          // Options
          OptionList={OptionList}
          emptyOptions={emptyOptions}
          // Open
          open={mergedOpen}
          dropdownClassName={mergedDropdownClassName}
          placement={mergedPlacement}
          onDropdownVisibleChange={onInternalDropdownVisibleChange}
          // Children
          getRawInputElement={() => children as any}
        />
      </CascaderContext.Provider>
    );
  }
) as CascaderComponent;

if (process.env.NODE_ENV !== "production") {
  Cascader.displayName = "Cascader";
}

Cascader.SHOW_PARENT = SHOW_PARENT;
Cascader.SHOW_CHILD = SHOW_CHILD;
Cascader.Panel = Panel;