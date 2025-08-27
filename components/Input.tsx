import React from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string,
  type?: string,
  options?: string[],
  disabled?: boolean,
  hideErrors?: boolean,
  errors?: string[],
}

export default function Input({ 
  className="",
  title="", 
  type="text", 
  options = [],
  disabled = false, 
  hideErrors = false,
  errors = [],
  ...props 
}: React.PropsWithChildren<InputProps>): React.ReactElement {;
  const isError: boolean = hideErrors ? false : errors.length > 0;

  const isSelect: boolean = options.length > 0;
  const isCheckbox: boolean = type === "checkbox" && !isSelect;
  const isTextArea: boolean = type === "textarea" && !isSelect;

  let input = <input type={type} disabled={disabled} { ...props } />;
  if (isTextArea) input = <textarea disabled={disabled}></textarea>;
  if (isSelect) input = <select disabled={disabled}>
    { options.map(opt => <option key={ opt }>{ opt }</option>) }
  </select>
  
  return <div className={`${disabled ? "disabled " : ""}input-container ${isError && "error"} ${className}`}>
    { !isCheckbox && title && <label>{ title }</label> }
    { !isCheckbox && input }

    { isCheckbox && <div className="input-checkbox">
      { input }
      <label>{ title }</label>
    </div> }
    
    { isError && <div>
      { errors.map(e => <p className="error" key={e}>{ e }</p>) }
    </div> }
  </div>
}