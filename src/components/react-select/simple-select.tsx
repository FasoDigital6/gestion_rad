import { cn } from "@/lib/utils";
import { ChevronDown, XIcon } from "lucide-react";
import Select, {
  components,
  DropdownIndicatorProps,
  ClearIndicatorProps,
  MultiValueRemoveProps,
  MenuListProps,
} from "react-select";

// Type pour les options du select
export interface Option {
  label: string;
  value: string | number;
  [key: string]: unknown; // Pour des propriétés additionnelles
}

// Type pour le field (compatible avec react-hook-form Controller)
export interface SelectField {
  value: Option | Option[] | null | undefined;
  onChange: (value: Option | readonly Option[] | null) => void;
  onBlur: () => void;
}

// Props pour SimpleSelect
export interface SimpleSelectProps {
  field: SelectField;
  placeholder?: string;
  options: Option[];
  onChange?: (value: Option | readonly Option[] | null) => void;
  primaryColor?: string;
  [key: string]: unknown; // Pour les props supplémentaires passées à react-select
}

// Props pour SimpleSelectWithAddButton
export interface SimpleSelectWithAddButtonProps extends SimpleSelectProps {
  addButtonIcon?: React.ReactNode;
  addButtonLabel?: string;
  onAddButtonClick: () => void;
  components?: Record<string, unknown>;
}

const DropdownIndicator = (props: DropdownIndicatorProps<Option, boolean>) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="w-4 h-4 opacity-50" />
    </components.DropdownIndicator>
  );
};

const ClearIndicator = (props: ClearIndicatorProps<Option, boolean>) => {
  return (
    <components.ClearIndicator {...props}>
      <XIcon className="w-4 h-4 opacity-50" />
    </components.ClearIndicator>
  );
};

const MultiValueRemove = (props: MultiValueRemoveProps<Option>) => {
  return (
    <components.MultiValueRemove {...props}>
      <XIcon className="w-4 h-4 opacity-50" />
    </components.MultiValueRemove>
  );
};

const controlStyles = {
  base: "flex ring-offset-2 w-full  rounded-md border border-input bg-background px-2 py-2 text-sm   placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  focus: "",
  nonFocus: "",
};
const placeholderStyles = "";
const selectInputStyles = "";
const valueContainerStyles = "px-1  gap-1";
const singleValueStyles = " ml-1";
const multiValueStyles = "bg-muted rounded items-center p-0";
const multiValueLabelStyles = "px-0.5";
const multiValueRemoveStyles =
  "border border-border bg-background hover:bg-destructive/10 hover:text-destructive text-muted-foreground hover:border-destructive/50 rounded-md";
const indicatorsContainerStyles = "px-1 gap-2";
const clearIndicatorStyles =
  "text-muted-foreground px-1 rounded-md hover:bg-destructive/10 hover:text-destructive";
const indicatorSeparatorStyles = "bg-border";
const dropdownIndicatorStyles =
  "px-1 hover:bg-muted text-muted-foreground rounded-md hover:text-foreground";
const menuStyles =
  "p-1 text-sm mt-2 border scrollbar-hide shadow-md border-border bg-popover rounded-lg";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-muted-foreground text-sm";
const optionStyles = {
  base: "hover:cursor-pointer pl-8 py-2  rounded text-[10px]",
  focus: "bg-muted active:bg-muted",
  selected:
    "before:content-['✔'] before:ml-2 before:text-success text-muted-foreground",
};
const noOptionsMessageStyles =
  "text-muted-foreground p-2 bg-muted border border-dashed border-border rounded-lg";

const SimpleSelect = ({
  field,
  placeholder,
  options,
  onChange,
  primaryColor = "hsl(var(--primary))",
  ...nextProps
}: SimpleSelectProps) => {
  return (
    <Select<Option, boolean>
      {...nextProps}
      isClearable
      defaultValue={field.value as Option | Option[] | undefined}
      unstyled
      placeholder={placeholder}
      onChange={(value) => {
        field.onChange(value);
        if (onChange) {
          onChange(value);
        }
      }}
      options={options}
      onBlur={field.onBlur}
      value={field.value as Option | Option[] | undefined}
      styles={{
        input: (base) => ({
          ...base,
          "input:focus": {
            boxShadow: "none",
          },
        }),

        multiValueLabel: (base) => ({
          ...base,
          whiteSpace: "normal",
          overflow: "visible",
        }),

        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? primaryColor : base.borderColor,
          borderWidth: state.isFocused ? "3px" : "1px",
          "&:hover": {
            borderColor: state.isFocused ? primaryColor : base.borderColor,
          },
        }),
      }}
      components={{
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
      }}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        multiValue: () => multiValueStyles,
        multiValueLabel: () => multiValueLabelStyles,
        multiValueRemove: () => multiValueRemoveStyles,
        indicatorsContainer: () => indicatorsContainerStyles,
        clearIndicator: () => clearIndicatorStyles,
        indicatorSeparator: () => indicatorSeparatorStyles,
        dropdownIndicator: () => dropdownIndicatorStyles,
        menu: () => menuStyles,
        groupHeading: () => groupHeadingStyles,
        option: ({ isFocused, isSelected }) =>
          cn(
            isFocused && optionStyles.focus,
            isSelected && optionStyles.selected,
            optionStyles.base
          ),
        noOptionsMessage: () => noOptionsMessageStyles,
      }}
    />
  );
};

export default SimpleSelect;

export const SimpleSelectWithAddButton = ({
  field,
  placeholder,
  options,
  onChange,
  primaryColor = "hsl(var(--primary))",
  addButtonIcon,
  addButtonLabel,
  onAddButtonClick,
  components: customComponents = {},
  ...nextProps
}: SimpleSelectWithAddButtonProps) => {
  const CustomMenuList = (props: MenuListProps<Option, boolean>) => (
    <div className="flex flex-col">
      <div className="flex-grow">{props.children}</div>
      <div
        className="px-3 py-2 text-sm text-brand cursor-pointer hover:bg-muted flex
          items-center border-t border-border"
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setTimeout(() => {
            onAddButtonClick();
          }, 100);
        }}
      >
        {addButtonIcon}
        {addButtonLabel}
      </div>
    </div>
  );

  const componentsToUse = { MenuList: CustomMenuList, ...customComponents };

  return (
    <Select<Option, boolean>
      {...nextProps}
      isClearable
      defaultValue={field.value as Option | Option[] | undefined}
      unstyled
      placeholder={placeholder}
      onChange={(value) => {
        field.onChange(value);
        if (onChange) {
          onChange(value);
        }
      }}
      options={options}
      onBlur={field.onBlur}
      value={field.value as Option | Option[] | undefined}
      styles={{
        input: (base) => ({
          ...base,
          "input:focus": {
            boxShadow: "none",
          },
        }),
        multiValueLabel: (base) => ({
          ...base,
          whiteSpace: "normal",
          overflow: "visible",
        }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? primaryColor : base.borderColor,
          borderWidth: state.isFocused ? "3px" : "1px",
          "&:hover": {
            borderColor: state.isFocused ? primaryColor : base.borderColor,
          },
        }),
      }}
      components={{
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
        ...componentsToUse,
      }}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        multiValue: () => multiValueStyles,
        multiValueLabel: () => multiValueLabelStyles,
        multiValueRemove: () => multiValueRemoveStyles,
        indicatorsContainer: () => indicatorsContainerStyles,
        clearIndicator: () => clearIndicatorStyles,
        indicatorSeparator: () => indicatorSeparatorStyles,
        dropdownIndicator: () => dropdownIndicatorStyles,
        menu: () => menuStyles,
        groupHeading: () => groupHeadingStyles,
        option: ({ isFocused, isSelected }) =>
          cn(
            isFocused && optionStyles.focus,
            isSelected && optionStyles.selected,
            optionStyles.base
          ),
        noOptionsMessage: () => noOptionsMessageStyles,
      }}
    />
  );
};
