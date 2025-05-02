import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from "react-select";

interface SearchBoxProps {
  label: string;
  onSelect: (place: { name: string; lat: string; lon: string }) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ label, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  useEffect(() => {
    if (query.length < 3) return;

    const timeoutId = setTimeout(() => {
      axios
        .get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            format: "json",
            q: query,
          },
        })
        .then((response) => {
          setResults(response.data);
        })
        .catch((error) => {
          console.error("There was an error with the API request:", error);
        });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const options = results.map((place) => ({
    value: place.lat + "," + place.lon,
    label: place.display_name,
    lat: place.lat,
    lon: place.lon,
  }));

  const handleChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
    if (selectedOption) {
      onSelect({
        name: selectedOption.label,
        lat: selectedOption.lat,
        lon: selectedOption.lon,
      });
    }
  };


  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <Select
        isClearable
        value={selectedOption}
        onChange={handleChange}
        onInputChange={(inputValue) => setQuery(inputValue)}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={`Search ${label}`}
      />
    </div>
  );
};

export default SearchBox;
