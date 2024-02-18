import { useState, useMemo, useContext, useCallback } from "react";
import { FIX_LABEL } from "@/OptionList/Column";
import { DefaultOptionType } from "..";
import CascaderContext from "@/context";

type UseLocalFilterProps = {
  options: DefaultOptionType[];
  emptyList?: DefaultOptionType[];
  activeValueCells?: React.Key[];
  setActiveValueCells?: (activeValueCells: React.Key[]) => void;
  activeValue?: React.Key;
};

/**
 * This hook is used to filter a list of options based on a search string. It also manages a list of active values and provides a function to remove child active values.
 * @param param0
 * @returns
 */
export const useLocalFilter = <OptionType extends DefaultOptionType>({
  options,
  emptyList,
  activeValueCells,
  setActiveValueCells,
  activeValue,
}: UseLocalFilterProps) => {
  const [searchString, setSearchString] = useState("");
  const { fieldNames } = useContext(CascaderContext);

  const removeChildActiveValueCells = useCallback(() => {
    if (activeValueCells) {
      const activeValueCellsIndex = activeValueCells.findIndex(
        (value) => value === activeValue
      );

      if (activeValueCellsIndex !== -1) {
        const newActiveValueCells = activeValueCells.slice(
          0,
          activeValueCellsIndex
        );
        setActiveValueCells?.(newActiveValueCells);
      }
    }
  }, [activeValue, activeValueCells, setActiveValueCells]);

  const { filteredOptions } = useMemo(() => {
    if (!searchString) {
      return { filteredOptions: options };
    }

    const lowerSearchValue = searchString.toLowerCase();
    const filteredOptions = options.filter((option) => {
      const label = option[FIX_LABEL] ?? option.label;
      return (
        label.toLowerCase().includes(lowerSearchValue) && !option.groupLabel
      );
    });

    const filteredOptionsContainsActiveValue = filteredOptions.some(
      (option) => {
        return activeValueCells?.includes(option[fieldNames.value]);
      }
    );

    if (!filteredOptionsContainsActiveValue) {
      removeChildActiveValueCells();
    }

    if (filteredOptions.length === 0 && emptyList) {
      return {
        filteredOptions: emptyList as OptionType[],
      };
    }

    return { filteredOptions };
  }, [
    options,
    searchString,
    emptyList,
    activeValueCells,
    fieldNames.value,
    removeChildActiveValueCells,
  ]);

  return {
    searchString,
    setSearchString,
    filteredOptions,
  };
};
