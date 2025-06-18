"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Power, Wallet, Ticket, ArrowLeft, Home, BookOpen, Trophy, ChevronLeft, ChevronRight, Volume2, VolumeX, User, Award, Star, Gem, Minus, Plus, Gift, Bell, Smartphone, Bike } from 'lucide-react';

// --- Constantes ---
const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];
const NUMBERS_PER_LETTER = 15;
const TOTAL_NUMBERS = 75;
const CARD_SIZE = 5;
const FREE_SPACE_INDEX = { row: 2, col: 2 };
const INITIAL_BALANCE = 500;
const DRAW_SPEED_MS = 2500;
const PRIZE_POOL_PERCENTAGE = 0.7;
const DAILY_REWARD_AMOUNT = 50;


useEffect(() => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes jump-in { 0% { transform: scale(0.5); opacity: 0; } 75% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
      .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
      .animate-fade-in-up { animation: fade-in-up 0.5s ease-in-out; }
      .animate-jump-in { animation: jump-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        opacity: 0;
        animation: confetti-fall 5s ease-in-out infinite;
      }
      @keyframes confetti-fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}, []);



const prizeTiers = {
    1: { name: "BINGO!", multiplier: 0.6 },
    2: { name: "Moldura", multiplier: 0.3 },
    3: { name: "L Pequeno", multiplier: 0.1 },
};

const bingoRooms = [
    { id: 1, type: 'cash', name: "Prêmio em Dinheiro", prizeText: "Até R$5.000!", cardPrice: 5, featured: true },
    { id: 2, type: 'item', name: "Sorteio do iPhone", prizeText: "Um iPhone 15 Pro", cardPrice: 10 },
    { id: 3, type: 'item', name: "Sorteio da Moto", prizeText: "Uma Moto 0km", cardPrice: 20, featured: true },
    { id: 4, type: 'cash', name: "Sorteio Relâmpago", prizeText: "Prêmio Rápido!", cardPrice: 2, featured: true }
];

// --- Funções Auxiliares e Hooks ---
const generateColumnNumbers = (colIndex) => {
    const start = colIndex * NUMBERS_PER_LETTER + 1;
    const range = Array.from({ length: NUMBERS_PER_LETTER }, (_, i) => start + i);
    const column = new Set();
    while (column.size < CARD_SIZE) {
        const randomIndex = Math.floor(Math.random() * range.length);
        column.add(range[randomIndex]);
        range.splice(randomIndex, 1);
    }
    return Array.from(column);
};

const generateBingoCard = () => {
    const card = Array(CARD_SIZE).fill(null).map(() => Array(CARD_SIZE).fill(null));
    for (let col = 0; col < CARD_SIZE; col++) {
        const columnNumbers = generateColumnNumbers(col);
        for (let row = 0; row < CARD_SIZE; row++) {
            card[row][col] = columnNumbers[row];
        }
    }
    card[FREE_SPACE_INDEX.row][FREE_SPACE_INDEX.col] = 'FREE';
    return card;
};

// Hook de Som
const useSounds = (isMuted) => {
    const audioContextRef = useRef(null);
    const playSound = (type) => {
        if (isMuted) return;
        if (typeof window === 'undefined') return;
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        switch (type) {
            case 'buy': oscillator.type = 'square'; oscillator.frequency.setValueAtTime(300, context.currentTime); gainNode.gain.setValueAtTime(0.1, context.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3); break;
            case 'mark': oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(440, context.currentTime); gainNode.gain.setValueAtTime(0.05, context.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2); break;
            case 'bingoCall': oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(523.25, context.currentTime); gainNode.gain.setValueAtTime(0.1, context.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5); break;
            case 'reward': oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(880, context.currentTime); gainNode.gain.setValueAtTime(0.1, context.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4); break;
            case 'win': [659.25, 783.99, 1046.50].forEach((freq, i) => { const osc = context.createOscillator(); const gn = context.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, context.currentTime + i * 0.15); gn.gain.setValueAtTime(0.1, context.currentTime + i * 0.15); gn.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + i * 0.15 + 0.2); osc.connect(gn); gn.connect(context.destination); osc.start(context.currentTime + i * 0.15); osc.stop(context.currentTime + i * 0.15 + 0.2); }); return;
        }
        oscillator.start();
        oscillator.stop(context.currentTime + 0.3);
    };
    return playSound;
};


// --- Componentes de UI ---
const Header = ({ view, onBack, cardCount }) => (
    <header className="flex justify-between items-center bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-white/10 sticky top-4 z-20">
        <div className="w-10">{view !== 'HOME' && <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors"><ArrowLeft size={20} /></button>}</div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Bingool</h1>
        <div className="flex items-center gap-4">
            <div className="text-right"><div className="flex items-center justify-end gap-1 text-slate-400 text-xs"><Ticket size={12}/></div><p className="font-bold text-slate-100 text-lg">{cardCount}</p></div>
        </div>
    </header>
);

const BottomNav = ({ activeView, onNavigate }) => {
    const navItems = [
        { view: 'HOME', label: 'Início', icon: Home },
        { view: 'BUY_CARDS', label: 'Cartelas', icon: Ticket },
        { view: 'WINNERS', label: 'Ganhadores', icon: Trophy },
        { view: 'RULES', label: 'Regras', icon: BookOpen },
        { view: 'PROFILE', label: 'Perfil', icon: User },
    ];
    return (
        <footer className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-lg border-t border-white/10 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
             <div className="flex justify-around items-start max-w-lg mx-auto py-2">
                {navItems.map(item => (
                    <button key={item.view} onClick={() => onNavigate(item.view)} className={`flex flex-col items-center gap-1 px-1 rounded-lg transition-colors w-16 ${activeView === item.view ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}>
                        <item.icon size={24} />
                        <span className="text-xs font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </footer>
    );
};

const BingoCard = ({ cardData, calledNumbers, markedNumbers, onMarkNumber, winnerInfo, isGameOver, prizePool, playerCards }) => {
    const isWinner = winnerInfo && winnerInfo.cardIndex !== null && playerCards[winnerInfo.cardIndex] === cardData;
    return (
        <div className={`bg-slate-800/60 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/10 transition-all duration-500 relative overflow-hidden shrink-0 w-full ${isWinner ? 'scale-105 border-2 border-amber-400 shadow-amber-500/30' : ''}`}>
            <div className="grid grid-cols-5 gap-2 text-center">{BINGO_LETTERS.map(letter => <div key={letter} className="text-xl font-bold text-amber-400">{letter}</div>)}</div>
            <div className="grid grid-cols-5 gap-1.5 mt-2">
                {cardData.flat().map((number, index) => {
                    const isCalled = calledNumbers.has(number);
                    const isMarked = markedNumbers.has(number);
                    const isFreeSpace = number === 'FREE';
                    let bgClass = 'bg-slate-700/50';
                    if (isFreeSpace || isMarked) bgClass = 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg';
                    else if (isCalled) bgClass = 'bg-indigo-500/70 animate-pulse';
                    return (<button key={index} onClick={() => onMarkNumber(number)} disabled={isGameOver || isFreeSpace} className={`aspect-square w-full flex items-center justify-center rounded-full font-bold text-lg transition-all duration-200 ${bgClass} text-white ${(isFreeSpace || isMarked) && 'scale-105'} ${isGameOver ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>{isFreeSpace ? '★' : number}</button>);
                })}
            </div>
            <div className="absolute bottom-1 right-2 bg-black/50 px-2 py-0.5 rounded-md text-xs text-center grid grid-cols-3 gap-x-2">
                <p><span className="text-amber-400 font-bold">1º</span> <span className="text-green-400">R${(prizePool * prizeTiers[1].multiplier).toFixed(0)}</span></p>
                <p><span className="text-slate-300 font-bold">2º</span> <span className="text-green-400">R${(prizePool * prizeTiers[2].multiplier).toFixed(0)}</span></p>
                <p><span className="text-slate-300 font-bold">3º</span> <span className="text-green-400">R${(prizePool * prizeTiers[3].multiplier).toFixed(0)}</span></p>
            </div>
        </div>
    );
};

const CardSlider = ({ children, onBingoCall }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalCards = React.Children.count(children);
    const goNext = () => setCurrentIndex(prev => (prev + 1) % totalCards);
    const goPrev = () => setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden">
                <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {React.Children.map(children, (child, index) => (
                        <div className="w-full shrink-0" key={index}>{child}</div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center gap-4">
                <button onClick={goPrev} disabled={totalCards <= 1} className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50"><ChevronLeft size={24} /></button>
                <button onClick={() => onBingoCall(currentIndex)} className="bg-gradient-to-r from-amber-500 to-yellow-600 font-bold py-3 px-10 text-xl rounded-lg hover:opacity-90 shadow-lg active:scale-95 animate-pulse">BINGO!</button>
                <button onClick={goNext} disabled={totalCards <= 1} className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50"><ChevronRight size={24} /></button>
            </div>
            <p className="text-center font-bold">Cartela {currentIndex + 1} de {totalCards}</p>
        </div>
    );
};

const CalledNumberDisplay = ({ number }) => {
    if (number === null) return <div className="flex items-center justify-center bg-black/20 h-48 rounded-2xl shadow-inner border border-white/10"><p className="text-slate-400">Aguardando sorteio...</p></div>;
    const letter = BINGO_LETTERS[Math.floor((number - 1) / NUMBERS_PER_LETTER)];
    return (<div className="flex flex-col items-center justify-center bg-black/20 h-48 rounded-2xl shadow-2xl border border-white/10"><div key={number} className="text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-300 animate-fade-in-up">{letter}<span className="text-slate-400">-</span>{number}</div></div>);
};

const CalledNumbersHistory = ({ calledNumbers }) => {
    const sortedNumbers = Array.from(calledNumbers).sort((a, b) => a - b);
    return (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-white/10">
            <h3 className="font-bold text-center text-white mb-2">Números Sorteados ({sortedNumbers.length})</h3>
            <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto">
                {sortedNumbers.map(n => (
                    <span key={n} className="bg-slate-700 text-sm w-8 h-8 flex items-center justify-center rounded-full font-semibold">{n}</span>
                ))}
            </div>
        </div>
    );
};

const Confetti = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
        {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: ['#fde047', '#f97316', '#a855f7', '#ec4899'][Math.floor(Math.random() * 4)]
            }}></div>
        ))}
    </div>
);

const WinnerModal = ({ onPlayAgain, winnerInfo, prizePool }) => {
    const prizeTierInfo = prizeTiers[winnerInfo.prizeTier];
    const prizeValue = prizePool * prizeTierInfo.multiplier;
    return(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/80 rounded-2xl p-8 text-center shadow-2xl shadow-amber-500/20 border border-amber-500/50 transform animate-jump-in relative">
                <Confetti />
                <h2 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{prizeTierInfo.name.toUpperCase()}!</h2>
                <p className="text-slate-200 text-xl mb-2">Parabéns, é o {winnerInfo.prizeTier}º lugar!</p>
                <p className="text-green-400 font-bold text-3xl mb-8">Ganhou R$ {prizeValue.toFixed(2)}</p>
                <button onClick={onPlayAgain} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 text-lg shadow-lg shadow-yellow-500/30 active:scale-95">Comprar Novas Cartelas</button>
            </div>
        </div>
    );
};

const MessageModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800/80 rounded-xl p-6 text-center shadow-lg border border-slate-700 transform animate-fade-in-up">
            <p className="text-white text-lg mb-6">{message}</p>
            <button onClick={onClose} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 active:scale-95">OK</button>
        </div>
    </div>
);

// --- Telas (Views) e Componentes de Página ---
const ProfileCard = ({ balance, onNavigate, dailyRewardClaimed }) => (
    <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <User size={24} className="text-white" />
            </div>
            <div>
                <p className="text-xl font-bold text-white">Jogador Anónimo</p>
                 <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Nível 5</span>
                    {!dailyRewardClaimed && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                 </div>
            </div>
        </div>
        <button onClick={() => onNavigate('PROFILE')} className="bg-slate-700/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">Ver Perfil</button>
    </div>
);

const RecentWinnersCard = ({ onNavigate }) => {
    const fakeWinners = [
        { name: "Jogador_123", prize: "R$ 500,00" },
        { name: "Sorte_Pura", prize: "R$ 1.200,00" },
    ];
    return (
        <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Últimos Ganhadores</h3>
                <button onClick={() => onNavigate('WINNERS')} className="text-sm text-amber-400 hover:underline">Ver Todos</button>
            </div>
            {fakeWinners.map((winner, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-amber-400" size={20} />
                        <span className="font-bold text-slate-200">{winner.name}</span>
                    </div>
                    <span className="font-semibold text-green-400">{winner.prize}</span>
                </div>
            ))}
        </div>
    );
};

const FeaturedRoomCard = ({ room, onNavigate }) => {
    return (
        <div onClick={() => onNavigate('BUY_CARDS')} className="cursor-pointer group relative rounded-lg overflow-hidden shadow-lg border border-white/10 h-48 flex flex-col justify-end transition-all duration-300 hover:scale-105 hover:shadow-amber-500/30">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            <div className="relative p-3 text-white z-10">
                <h3 className="font-bold truncate">{room.name}</h3>
                <p className="text-sm text-amber-400 truncate">{room.prizeText}</p>
            </div>
        </div>
    );
};

const HomePage = ({ onNavigate, balance, dailyRewardClaimed }) => (
    <div className="flex flex-col gap-6 animate-fade-in mt-4">
        <ProfileCard balance={balance} onNavigate={onNavigate} dailyRewardClaimed={dailyRewardClaimed} />
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Salas de Bingo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bingoRooms.filter(r => r.featured).slice(0, 2).map(room => (
                     <FeaturedRoomCard key={room.id} room={room} onNavigate={onNavigate} />
                ))}
            </div>
        </div>
        <button onClick={() => onNavigate('BUY_CARDS')} className="w-full bg-indigo-600/80 font-bold py-3 rounded-lg hover:bg-indigo-600 transition-colors">
            Ver Todas as Salas
        </button>
        <RecentWinnersCard onNavigate={onNavigate} />
    </div>
);

const RulesPage = () => (
    <div className="flex flex-col gap-4 text-slate-300 animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Regras e Prémios</h2>
        <div className="bg-slate-800/60 p-6 rounded-lg border border-white/10 space-y-6">
            <div><h3 className="text-xl font-bold text-amber-400">1º Lugar: BINGO!</h3><p>Complete uma linha, coluna ou diagonal inteira.</p></div>
            <div><h3 className="text-xl font-bold text-amber-400">2º Lugar: Moldura</h3><p>Complete a primeira e última linha, e a primeira e última coluna.</p></div>
            <div><h3 className="text-xl font-bold text-amber-400">3º Lugar: "L" Pequeno</h3><p>Complete a primeira linha e a primeira coluna.</p></div>
            <p className="text-sm text-slate-400 pt-4 border-t border-white/10">Quando achar que venceu, navegue até a cartela premiada e pressione o botão "BINGO!" para confirmar.</p>
        </div>
    </div>
);

const WinnersPage = () => {
    const fakeWinners = [
        { name: "Jogador_123", prize: "R$ 500,00" }, { name: "Sorte_Pura", prize: "R$ 1.200,00" },
        { name: "BingoMaster", prize: "R$ 850,00" }, { name: "LadyLuck", prize: "R$ 2.000,00" },
    ];
    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-white">Últimos Ganhadores</h2>
            <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10 space-y-3">
                {fakeWinners.map((winner, index) => (<div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md"><div className="flex items-center gap-3"><Trophy className="text-amber-400" size={20} /><span className="font-bold text-slate-200">{winner.name}</span></div><span className="font-semibold text-green-400">{winner.prize}</span></div>))}
            </div>
        </div>
    );
};

const ProfilePage = ({ balance, onNavigate, onClaimDailyReward, dailyRewardClaimed }) => {
    const stats = [
        { label: "Partidas Jogadas", value: 128 },
        { label: "Vitórias", value: 12 },
        { label: "Maior Prémio", value: "R$ 1.200,00" }
    ];

    const achievements = [
        { icon: Star, label: "Primeira Vitória" },
        { icon: Award, label: "10 Vitórias" },
        { icon: Gem, label: "Rei do Bingo" },
        { icon: Trophy, label: "Semana de Ouro" }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col items-center gap-4 bg-slate-800/60 p-6 rounded-lg border border-white/10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                    <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Jogador Anónimo</h2>
                <div className="bg-green-500/20 text-green-300 font-bold px-4 py-1 rounded-full">Saldo: R$ {balance.toFixed(2)}</div>
            </div>

             <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Recompensa Diária</h3>
                    <button onClick={onClaimDailyReward} disabled={dailyRewardClaimed} className="bg-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 text-sm">
                        {dailyRewardClaimed ? "Recebido" : "Receber"}
                    </button>
                </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">Estatísticas</h3>
                <div className="space-y-2">
                    {stats.map(stat => (
                        <div key={stat.label} className="flex justify-between text-slate-300">
                            <span>{stat.label}</span>
                            <span className="font-bold text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-lg border border-white/10">
                 <h3 className="text-lg font-bold text-white mb-3">Conquistas</h3>
                 <div className="grid grid-cols-4 gap-4 text-center">
                    {achievements.map(ach =>(
                        <div key={ach.label} className="flex flex-col items-center gap-1 text-amber-400 opacity-75">
                            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
                                <ach.icon size={24} />
                            </div>
                            <span className="text-xs text-slate-300">{ach.label}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const BuyRoomSelectorPage = ({ onBuy, balance }) => (
     <div className="flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-1 text-white">Salas de Bingo</h2>
            <p className="text-slate-400">Escolha um prémio e boa sorte! Saldo: <span className="font-bold text-green-400">R$ {balance.toFixed(2)}</span></p>
        </div>
        <div className="flex flex-col gap-4">
            {bingoRooms.map(room => (
                <BuyRoomCard key={room.id} room={room} onBuy={onBuy} />
            ))}
        </div>
    </div>
);

const BuyRoomCard = ({ room, onBuy }) => {
    const [quantity, setQuantity] = useState(1);
    const totalPrice = quantity * room.cardPrice;
    
    const getRoomIcon = (room) => {
        if (room.name.includes("iPhone")) return <Smartphone size={32} className="text-indigo-300" />;
        if (room.name.includes("Moto")) return <Bike size={32} className="text-red-400" />;
        return <Gem size={32} className="text-green-400" />;
    };

    return (
        <div className="bg-slate-800/60 rounded-lg border border-white/10 p-4 flex flex-col gap-4 transition-all duration-300 hover:border-indigo-500/50">
            <div className="flex items-center gap-4">
                <div className="bg-slate-700/50 p-3 rounded-lg">
                    {getRoomIcon(room)}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{room.name}</h3>
                    <p className="text-sm text-amber-400">{room.prizeText}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600"><Minus size={16}/></button>
                    <span className="text-xl font-bold w-10 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600"><Plus size={16}/></button>
                </div>
                <button onClick={() => onBuy(room, quantity)} className="bg-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 shadow-lg">
                    Comprar (R$ {totalPrice.toFixed(2)})
                </button>
            </div>
        </div>
    );
};

const GamePage = ({ gameState, currentNumber, calledNumbers, playerCards, markedNumbers, onMarkNumber, winnerInfo, prizePool, onBingoCall, isMuted, toggleMute, activeRoom }) => (
    <div className="flex flex-col gap-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-white">Jogando por: <span className="text-amber-400">{activeRoom.prizeText}</span></h2>
        <CalledNumberDisplay number={currentNumber} />
        <CalledNumbersHistory calledNumbers={calledNumbers} />
        <div className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl flex flex-col gap-4 border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                    <Power size={16} className="text-green-400 animate-pulse" />
                    <span>Sorteio Automático Ativo</span>
                </div>
                 <button onClick={toggleMute} className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        </div>
        <CardSlider onBingoCall={onBingoCall}>
            {playerCards.map((card, i) => <BingoCard key={i} cardData={card} calledNumbers={calledNumbers} markedNumbers={markedNumbers[i]} onMarkNumber={(number) => onMarkNumber(i, number)} winnerInfo={winnerInfo} isGameOver={gameState === 'GAME_OVER'} prizePool={prizePool} playerCards={playerCards} />)}
        </CardSlider>
    </div>
);

// --- Componente Principal ---
export default function App() {
    const [view, setView] = useState('HOME');
    const [gameState, setGameState] = useState('PRE_GAME');
    const [balance, setBalance] = useState(INITIAL_BALANCE);
    const [prizePool, setPrizePool] = useState(0);
    const [playerCards, setPlayerCards] = useState([]);
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [calledNumbers, setCalledNumbers] = useState(new Set());
    const [currentNumber, setCurrentNumber] = useState(null);
    const [winnerInfo, setWinnerInfo] = useState(null);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '' });
    const [isMuted, setIsMuted] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);
    const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
    const autoDrawIntervalRef = useRef(null);
    const ptBrVoice = useRef(null);
    const playSound = useSounds(isMuted);

    const showMessage = (message) => setModalInfo({ isOpen: true, message });
    
    useEffect(() => {
        const loadVoices = () => {
            if (typeof window === 'undefined' || !window.speechSynthesis) return;
            const voices = window.speechSynthesis.getVoices();
            ptBrVoice.current = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR') || voices.find(v => v.lang.startsWith('pt')) || null;
        };
        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text) => {
        if (isMuted || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.toString());
        if (ptBrVoice.current) { utterance.voice = ptBrVoice.current; }
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    useEffect(() => {
        if (gameState === 'IN_GAME' && currentNumber !== null) { speak(currentNumber); }
    }, [currentNumber, gameState, speak]);

    const checkWinConditions = useCallback((card, marks) => {
        marks.add('FREE');
        const size = CARD_SIZE, last = size - 1;
        let diag1Win = true, diag2Win = true;
        for(let i = 0; i < size; i++) {
            if (!marks.has(card[i][i])) diag1Win = false;
            if (!marks.has(card[i][last - i])) diag2Win = false;
            let rowWin = true, colWin = true;
            for(let j = 0; j < size; j++) { if (!marks.has(card[i][j])) rowWin = false; if (!marks.has(card[j][i])) colWin = false; }
            if(rowWin || colWin) return 1;
        }
        if(diag1Win || diag2Win) return 1;
        const row1 = card[0].every(n => marks.has(n)), row5 = card[last].every(n => marks.has(n)), col1 = card.every(row => marks.has(row[0])), col5 = card.every(row => marks.has(row[last]));
        if(row1 && row5 && col1 && col5) return 2;
        if(row1 && col1) return 3;
        return 0;
    }, []);

    const callNextNumber = useCallback(() => {
        if (calledNumbers.size >= TOTAL_NUMBERS) {
            setGameState('GAME_OVER');
            clearInterval(autoDrawIntervalRef.current);
            return;
        }
        const availableNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter(n => !calledNumbers.has(n));
        const nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        setCurrentNumber(nextNumber);
        setCalledNumbers(prev => new Set(prev).add(nextNumber));
    }, [calledNumbers]);

    useEffect(() => {
        if (gameState === 'IN_GAME') {
            autoDrawIntervalRef.current = setInterval(callNextNumber, DRAW_SPEED_MS);
        } else {
            clearInterval(autoDrawIntervalRef.current);
        }
        return () => clearInterval(autoDrawIntervalRef.current);
    }, [gameState, callNextNumber]);
    
    const resetGameData = () => {
        setPlayerCards([]); setMarkedNumbers([]); setCalledNumbers(new Set()); setCurrentNumber(null);
        setWinnerInfo(null); setGameState('PRE_GAME'); setPrizePool(0); setActiveRoom(null);
    };
    
    const handleBuyAndPlay = (room, quantity) => {
        const totalCost = room.cardPrice * quantity;
        if (balance >= totalCost) {
            playSound('buy');
            setBalance(prev => prev - totalCost);
            
            let currentPrizePool = 0;
            if(room.type === 'cash') {
                currentPrizePool = (prizePool + totalCost) * PRIZE_POOL_PERCENTAGE;
            } else {
                currentPrizePool = 1; 
            }
            setPrizePool(currentPrizePool);

            const newCards = Array.from({ length: quantity }, () => generateBingoCard());
            const newMarks = Array.from({ length: quantity }, () => new Set(['FREE']));
            setPlayerCards(newCards); 
            setMarkedNumbers(newMarks);
            setActiveRoom(room);
            
            setGameState('IN_GAME'); 
            setView('GAME'); 
            callNextNumber();

        } else { 
            showMessage("Saldo insuficiente!"); 
        }
    };
    
    const handleMarkNumber = (cardIndex, number) => {
        playSound('mark');
        const newMarkedNumbers = [...markedNumbers];
        const cardMarks = new Set(newMarkedNumbers[cardIndex]);
        if(cardMarks.has(number)) cardMarks.delete(number); else cardMarks.add(number);
        newMarkedNumbers[cardIndex] = cardMarks;
        setMarkedNumbers(newMarkedNumbers);
    };

    const handleBingoCall = (cardIndex) => {
        if (gameState !== 'IN_GAME') return;
        playSound('bingoCall');
        const prizeTier = checkWinConditions(playerCards[cardIndex], markedNumbers[cardIndex]);
        if (prizeTier > 0) {
            playSound('win');
            setWinnerInfo({ cardIndex, prizeTier });
            setGameState('GAME_OVER');
            if(activeRoom.type === 'cash'){
                setBalance(prev => prev + (prizePool * prizeTiers[prizeTier].multiplier));
            } else {
                 showMessage(`Parabéns! Você ganhou um ${activeRoom.name}!`);
            }
        } else {
            showMessage("Ainda não é bingo! Continue a marcar.");
        }
    };
    
    const handleClaimDailyReward = () => {
        if (!dailyRewardClaimed) {
            playSound('reward');
            setBalance(prev => prev + DAILY_REWARD_AMOUNT);
            setDailyRewardClaimed(true);
            showMessage(`Você recebeu R$ ${DAILY_REWARD_AMOUNT.toFixed(2)}!`);
        }
    };

    const handleNavigate = (targetView) => {
        if(view === 'GAME' || (view === 'BUY_CARDS' && playerCards.length > 0)) {
           if(targetView === 'HOME' || targetView === 'PROFILE' || targetView === 'WINNERS' || targetView === 'RULES') {
                resetGameData();
           }
        }
        if (targetView === 'BUY_CARDS' && gameState === 'PRE_GAME') {
            resetGameData();
        }
        setView(targetView);
    };

    const renderContent = () => {
        switch (view) {
            case 'GAME': return <GamePage {...{ gameState, currentNumber, calledNumbers, playerCards, markedNumbers, onMarkNumber: handleMarkNumber, winnerInfo, prizePool, onBingoCall: handleBingoCall, isMuted, toggleMute: () => setIsMuted(prev => !prev), activeRoom }} />;
            case 'BUY_CARDS': return <BuyRoomSelectorPage onBuy={handleBuyAndPlay} balance={balance} />;
            case 'RULES': return <RulesPage />;
            case 'WINNERS': return <WinnersPage />;
            case 'PROFILE': return <ProfilePage balance={balance} onNavigate={handleNavigate} onClaimDailyReward={handleClaimDailyReward} dailyRewardClaimed={dailyRewardClaimed} />;
            case 'HOME': default: return <HomePage onNavigate={handleNavigate} balance={balance} dailyRewardClaimed={dailyRewardClaimed} />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 text-white min-h-screen font-sans">
            {modalInfo.isOpen && <MessageModal message={modalInfo.message} onClose={() => setModalInfo({ isOpen: false, message: '' })} />}
            {gameState === 'GAME_OVER' && winnerInfo && <WinnerModal onPlayAgain={() => handleNavigate('BUY_CARDS')} winnerInfo={winnerInfo} prizePool={prizePool} />}
            
            <div className="w-full max-w-lg mx-auto flex flex-col gap-6 p-4 pb-36">
                <Header view={view} onBack={() => handleNavigate('HOME')} cardCount={playerCards.length} />
                <main className="flex flex-col gap-6">{renderContent()}</main>
            </div>
            <BottomNav activeView={view} onNavigate={handleNavigate} />
        </div>
    );
}

// Keyframes
