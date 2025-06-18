import React from 'react';

const BingoCard = ({ cardNumbers, markNumber }) => {
  return (
    <div className="grid grid-cols-5 gap-2 p-4 border border-gray-300">
      {cardNumbers.map((number, index) => (
        <div
          key={index}
          className={`flex justify-center items-center w-16 h-16 border-2 ${
            number.marked ? 'bg-green-500' : 'bg-white'
          }`}
          onClick={() => markNumber(index)}
        >
          <span>{number.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BingoCard;
