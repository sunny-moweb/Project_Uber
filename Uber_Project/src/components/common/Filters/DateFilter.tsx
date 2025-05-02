import { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

interface DateFilterProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const DateFilter = ({ selectedDate, onChange }: DateFilterProps) => {
  const datePickerRef = useRef<any>(null);

  return (
    <div className="relative">
      <FaCalendarAlt
        className="text-xl cursor-pointer text-gray-600"
        onClick={() => datePickerRef.current?.setFocus()}
      />
      <DatePicker
        ref={datePickerRef}
        selected={selectedDate}
        onChange={onChange}
        placeholderText="Select date"
        dateFormat="yyyy-MM-dd"
        maxDate={new Date()}
        popperPlacement="bottom-start"
        className="absolute w-0 h-0 opacity-0"
      />
    </div>
  );
};

export default DateFilter;
