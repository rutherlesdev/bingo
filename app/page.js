import React, { useState, useEffect } from 'react';
import BingoCard from '../components/BingoCard';
import { io } from 'socket.io-client';

// Conectando ao servidor Socket.io
const socket = io('http://localhost:5000');

const Game = () => {
  const [numbers, setNumbers] = useState(Array(25).fill(null).map(() => Math.floor(Math.random() * 75) + 1));
  const [markedNumbers, setMarkedNumbers] = useState(Array(25).fill(false));
  const [currentNumber, setCurrentNumber] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on('newNumber', (number) => {
      setCurrentNumber(number);
    });

    socket.on('gameOver', (winnerData) => {
      setWinner(winnerData);
    });

    return () => {
      socket.off('newNumber');
      socket.off('gameOver');
    };
  }, []);

  const markNumber = (index) => {
    if (!markedNumbers[index]) {
      const newMarkedNumbers = [...markedNumbers];
      newMarkedNumbers[index] = true;
      setMarkedNumbers(newMarkedNumbers);
      socket.emit('markNumber', { index });
    }
  };

  const startGame = () => {
    socket.emit('startGame');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Bingo Game</h1>
      <BingoCard cardNumbers={numbers} markNumber={markNumber} />
      <div>
        <h2 className="text-lg">Número Sorteado: {currentNumber}</h2>
      </div>
      <button className="btn" onClick={startGame}>Iniciar Jogo</button>
      {winner && (
        <div>
          <h2 className="text-2xl text-green-500">{winner.name} é o vencedor!</h2>
        </div>
      )}
    </div>
  );
};

export default Game;
