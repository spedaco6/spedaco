import React from "react";
import "./Input.css";
import { UseInputReturn } from "@/hooks/useInput";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  title?: string,
  type?: string,
  options?: string[],
  disabled?: boolean,
  hideErrors?: boolean,
  hideLabel?: boolean,
  errors?: string[],
  hook?: UseInputReturn,
}

export default function Input({ 
  className="",
  title="", 
  type, 
  options = [],
  disabled = false, 
  hideErrors = false,
  hideLabel = false,
  required,
  errors = [],
  name,
  id,
  value,
  onChange,
  onBlur,
  hook,
  ...props 
}: React.PropsWithChildren<InputProps>): React.ReactElement {;
  // Define input hook props
  const updatedErrors = [...errors];
  if (hook) hook.errors?.forEach(e => updatedErrors.push(e));

  const confirmedProps = {
    name: name ?? hook?.name,
    id: id ?? hook?.name,
    type: type ?? "text",
    value: value ?? ( hook ? String(hook?.value) : undefined),
    required: required ?? ( hook ? hook?.isRequired : false),
    errors: updatedErrors,
    onChange: onChange ?? hook?.onChange,
    onBlur: onBlur ?? hook?.onBlur,
  }

  const isError: boolean = hideErrors ? false : confirmedProps.errors.length > 0;
  const isSelect: boolean = options.length > 0;
  const isCheckbox: boolean = type === "checkbox" && !isSelect;
  const isTextArea: boolean = type === "textarea" && !isSelect;

  let input = <input 
    name={confirmedProps.name} 
    id={confirmedProps.id} 
    value={confirmedProps.value} 
    onChange={confirmedProps.onChange} 
    onBlur={confirmedProps.onBlur} 
    type={confirmedProps.type} 
    required={confirmedProps.required}
    disabled={disabled} 
    { ...props } 
    />;

    if (isCheckbox) input = <input 
    name={confirmedProps.name} 
    id={confirmedProps.id} 
    onChange={confirmedProps.onChange} 
    onBlur={confirmedProps.onBlur} 
    type={confirmedProps.type} 
    required={confirmedProps.required}
    value={confirmedProps.value}
    checked={confirmedProps.value === "true"}
    disabled={disabled} 
    { ...props } 
    />;
    
    if (isTextArea) input = <textarea 
    name={confirmedProps.name} 
    id={confirmedProps.id} 
    value={confirmedProps.value} 
    onChange={confirmedProps.onChange}
    onBlur={confirmedProps.onBlur} 
    required={confirmedProps.required}
    disabled={disabled} 
    { ...props }
    ></textarea>;
    
    
    if (isSelect) input = <select 
    name={confirmedProps.name} 
    id={confirmedProps.id} 
    value={confirmedProps.value} 
    onChange={confirmedProps.onChange}
    onBlur={confirmedProps.onBlur} 
    required={confirmedProps.required}
    disabled={disabled}
    { ...props }
  >
    { options.map(opt => <option key={ opt }>{ opt }</option>) }
  </select>
  
  return <div className={`${disabled ? "disabled " : ""}input-container${isError ? " error" : ""} ${className}`}>
    { !isCheckbox && title && !hideLabel && <label htmlFor={confirmedProps.id}>{`${title}${confirmedProps.required ? "*" : ""}`}</label> }
    { !isCheckbox && input }

    { isCheckbox && <div className="input-checkbox">
      { input }
      { !hideLabel && <label htmlFor={confirmedProps.id ?? ""}>{ title }</label> }
    </div> }
    
    { isError && <div className="input-errors">
      { confirmedProps.errors.map(e => <p className="error" key={e}>{ e }</p>) }
    </div> }
  </div>
}