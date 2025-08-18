import React from 'react';
import { useStateContext } from '../context/StateContext';

const CustomButton = ({ btnType, title, handleClick, styles }) => {
  const { theme } = useStateContext();
  
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] min-h-[52px] px-4 rounded-[10px] transition-all duration-200 ${
        theme === 'light'
          ? 'text-[#F5EDED] hover:opacity-90'
          : 'text-white hover:opacity-90'
      } ${styles}`}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton
