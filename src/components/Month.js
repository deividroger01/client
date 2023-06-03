import React from "react";
import Day from "./Day";

export default function Month({ month }) {
  return (
    <div className={`flex-1 ${window.innerWidth < 768 ? "flex-wrap" : ""}`}>
      <div
        className={`grid ${
          window.innerWidth > 768
            ? "grid-cols-7 grid-rows-5"
            : "grid-cols-1 grid-rows-35"
        }`}
      >
        {month.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, idx) => (
              <Day day={day} key={idx} rowIdx={i} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
