import React from 'react';
import { useStateContext } from '../context/StateContext';

const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange }) => {
  const { theme } = useStateContext();
  
  return (
    <label className="flex-1 w-full flex flex-col">
      {labelName && (
        <span className={`font-epilogue font-semibold text-[14px] leading-[22px] mb-[10px] ${
          theme === 'light' ? 'text-[#000000]' : 'text-white'
        }`}>
          {labelName}
        </span>
      )}
      {isTextArea ? (
        <textarea 
          required
          value={value}
          onChange={handleChange}
          rows={10}
          placeholder={placeholder}
          className={`py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] rounded-[10px] font-epilogue text-[14px] ${
            theme === 'light'
              ? 'bg-[#F5EDED] text-[#000000] border-[#787A91] placeholder:text-[#787A91]'
              : 'bg-transparent text-white border-[#3a3a43] placeholder:text-[#4b5264]'
          } sm:min-w-[300px]`}
        />
      ) : (
        <input 
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="0.1"
          placeholder={placeholder}
          className={`py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] rounded-[10px] font-epilogue text-[14px] ${
            theme === 'light'
              ? 'bg-[#F5EDED] text-[#000000] border-[#787A91] placeholder:text-[#787A91]'
              : 'bg-transparent text-white border-[#3a3a43] placeholder:text-[#4b5264]'
          } sm:min-w-[300px]`}
        />
      )}
    </label>
  )
}

export default FormField