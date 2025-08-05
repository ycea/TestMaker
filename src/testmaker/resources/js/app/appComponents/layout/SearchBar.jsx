import { useState } from "react";
const SearchBar = ({
    searchFunction,
    inputPlaceholder = "",
    buttonText = "",
}) => {
    const [searchData, setSearchData] = useState();

    return (
        <div className="d-flex m-1  justify-content-center w-100">
            <input
                className="form-control flex-grow-1"
                placeholder={inputPlaceholder}
                value={searchData}
                onChange={(e) => {
                    setSearchData(e.target.value);
                }}
            ></input>
            <button
                className="btn btn-secondary ms-1"
                onClick={(e) => {
                    e.preventDefault();
                    searchFunction();
                }}
            >
                {" "}
                {buttonText}
            </button>
        </div>
    );
};
export default SearchBar;
