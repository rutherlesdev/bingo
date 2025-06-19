import React, { useState, useEffect, useCallback } from 'react';

// --- Ícones ---
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserAvatarIcon = ({ onClick }) => <button aria-label="Ver Perfil" onClick={onClick} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></button>;
const Spinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PowerIcon = () => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StarIcon = () => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;

// --- Lógica do Jogo de Bingo ---
const generateBingoCard = () => {
    const card = { B: [], I: [], N: [], G: [], O: [] };
    const ranges = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };
    for (const col in ranges) { const numbers = new Set(); while (numbers.size < 5) { if (col === 'N' && numbers.size === 2) { numbers.add('FREE'); } else { numbers.add(Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0]); } } card[col] = Array.from(numbers); }
    return card;
};

// --- Componentes ---
const AppContainer = ({ children }) => <div className="w-screen h-screen bg-gray-50 flex flex-col">{children}</div>;
const PageContent = ({ children }) => <div className="p-4 flex-grow flex flex-col">{children}</div>;
const Header = ({ title, onBack, rightContent }) => (
    <header className="flex-shrink-0 bg-white shadow-md z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4 h-16">
            <div className="w-1/4">
                {onBack && <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2"><BackIcon /></button>}
            </div>
            <div className="w-1/2 text-center">
                <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
            </div>
            <div className="w-1/4 flex justify-end">
                {rightContent}
            </div>
        </div>
    </header>
);

const Modal = ({ title, children, onClose }) => ( <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title"> <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative text-center"> <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">{title}</h2> {children} <button onClick={onClose} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg">Fechar</button> </div> </div> );

const LobbyScreen = ({ onNavigate, setPlayerState }) => {
    const [showDailyReward, setShowDailyReward] = useState(false);
    useEffect(() => { const lastVisit = localStorage.getItem('lastBingoolVisit'); const today = new Date().toDateString(); if (lastVisit !== today) { setShowDailyReward(true); localStorage.setItem('lastBingoolVisit', today); } }, []);
    const claimReward = () => { setPlayerState(prev => ({ ...prev, coins: prev.coins + 100 })); setShowDailyReward(false); };
    const games = [ { id: 1, prize: 'Prémio de R$ 300,00', price: 2.00 }, { id: 2, prize: 'Prémio: iPhone 16 Pro', price: 5.00 }, { id: 3, prize: 'Prémio: Moto 0KM', price: 10.00 }, ];
    return (
        <AppContainer>
            {showDailyReward && ( <Modal title="🎁 Recompensa Diária! 🎁" onClose={claimReward}> <p className="text-gray-600 mb-4">Bem-vindo de volta! Aqui está o seu bónus por jogar hoje.</p> <p className="text-3xl font-bold text-yellow-500">100 Moedas</p> </Modal> )}
            <Header title="Bingool" rightContent={<UserAvatarIcon onClick={() => onNavigate('profile')} />} />
            <PageContent>
                <div className="bg-blue-100 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-gray-700 text-xl mb-3">Jogos Disponíveis</h3>
                    <div className="space-y-3"> {games.map(game => ( <button key={game.id} onClick={() => onNavigate('purchase', { game })} className="w-full flex items-center bg-white p-3 rounded-lg shadow hover:bg-gray-50 transition"> <span className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">{game.id}</span> <span className="font-semibold text-gray-800">Bingo - {game.prize}</span> </button> ))} </div>
                </div>
                <div className="flex-grow flex flex-col">
                    <h3 className="font-bold text-gray-700 text-xl mb-3 text-center">Minhas Cartelas</h3>
                    <div className="flex justify-around items-center mb-6"> <button onClick={() => onNavigate('purchase', { game: games[0] })} className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-100 transition"><CardIcon /><span className="mt-2 font-semibold text-gray-700">Jogar Agora</span></button> <button onClick={() => onNavigate('purchase', { game: games[0] })} className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-100 transition"><CartIcon /><span className="mt-2 font-semibold text-gray-700">Comprar Cartelas</span></button> </div>
                    <button onClick={() => onNavigate('history')} className="w-full mt-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg text-lg transition-colors">Histórico</button>
                </div>
            </PageContent>
        </AppContainer>
    );
};


const ProfileScreen = ({ onNavigate, playerState, setPlayerState }) => {
    const achievements = [ { id: 1, text: 'Ganhe 10 jogos', unlocked: playerState.wins >= 10 }, { id: 2, text: 'Faça um bingo rápido (30 bolas)', unlocked: false }, { id: 3, text: 'Jogue 7 dias seguidos', unlocked: true }, { id: 4, text: 'Compre 50 cartelas', unlocked: playerState.cardsBought >= 50 }, ];
    const themes = [ { id: 'default', name: 'Padrão', bg: 'bg-white', text: 'text-blue-600' }, { id: 'carnaval', name: 'Carnaval', bg: 'bg-yellow-200', text: 'text-purple-700' }, { id: 'espaco', name: 'Espaço', bg: 'bg-gray-800', text: 'text-cyan-300' }, ];
    return (
        <AppContainer>
            <Header title="Meu Perfil" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="flex flex-col items-center mb-6"> <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> </div> <h2 className="text-2xl font-bold text-gray-700">Utilizador Exemplo</h2> <div className="mt-2 text-lg font-semibold text-yellow-500 flex items-center"> <StarIcon /> Nível {playerState.level} </div> </div>
                <div className="mb-6"> <h3 className="font-bold text-gray-700 text-lg mb-2">Tema da Cartela</h3> <div className="flex justify-around bg-gray-100 p-2 rounded-lg"> {themes.map(theme => <button key={theme.id} onClick={() => setPlayerState(p => ({ ...p, theme: theme.id }))} className={`px-4 py-2 rounded-lg font-semibold transition-all ${playerState.theme === theme.id ? `${theme.bg} ${theme.text} ring-2 ring-blue-500` : 'bg-white'}`}>{theme.name}</button>)} </div> </div>
                <div className="mb-6"> <h3 className="font-bold text-gray-700 text-lg mb-2">Conquistas</h3> <div className="space-y-2"> {achievements.map(ach => ( <div key={ach.id} className={`flex items-center p-3 rounded-lg ${ach.unlocked ? 'bg-lime-100 text-lime-800' : 'bg-gray-100 text-gray-500'}`}> <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${ach.unlocked ? 'bg-lime-500' : 'bg-gray-300'}`}>{ach.unlocked && '✔'}</div> {ach.text} </div> ))} </div> </div>
            </PageContent>
        </AppContainer>
    );
};

const BingoCard = ({ cardData, theme, calledNumbers, onMarkNumber, daub, isPowerMode, isAlmost }) => {
    if (!cardData) return <div className="p-2 rounded-lg shadow-md bg-gray-200 animate-pulse"></div>;
    const themes = { default: 'bg-white', carnaval: 'bg-yellow-200', espaco: 'bg-gray-800' };
    const textColors = { default: 'text-blue-600', carnaval: 'text-purple-700', espaco: 'text-cyan-300' };
    const markedBg = { default: 'bg-yellow-400', carnaval: 'bg-pink-500', espaco: 'bg-indigo-500' };
    return (
        <div className={`relative grid grid-cols-5 gap-2 p-3 rounded-lg shadow-lg ${themes[theme]} ${isAlmost ? 'animate-pulse-bright ring-4 ring-yellow-400' : ''}`}>
            {['B', 'I', 'N', 'G', 'O'].map(letter => <div key={letter} className={`text-center font-bold text-2xl ${textColors[theme]}`}>{letter}</div>)}
            {Object.values(cardData.data).flat().map((number, index) => {
                const isCenter = number === 'FREE';
                const isMarked = cardData.marked.includes(number) || isCenter;
                const isCalled = calledNumbers.includes(number);
                return (
                    <button
                        key={index}
                        onClick={() => !isCenter && onMarkNumber(number)}
                        disabled={isCenter || (!isPowerMode && !isCalled)}
                        className={`relative aspect-square w-full flex items-center justify-center rounded-full text-lg font-bold transition-all duration-300 active:transform active:scale-90 
                            ${isMarked ? `text-white ${markedBg[theme]}` : isCalled ? 'bg-lime-300' : themes[theme] === 'bg-white' ? 'bg-gray-200' : 'bg-white/20' } 
                            ${isCenter ? 'bg-blue-500 text-white text-sm' : ''} 
                            ${isPowerMode && !isMarked ? 'cursor-pointer hover:bg-purple-300' : ''}`}
                    >
                        {number}
                        {daub === number && <div className={`absolute inset-0 rounded-full ${markedBg[theme]} opacity-70 animate-daub`}></div>}
                    </button>
                );
            })}
        </div>
    );
};

// --- Tela de Jogo Refatorada ---
const GameScreen = ({ onNavigate, playerState, setPlayerState, params }) => {
    const { cards, game } = params;
    const [allNumbers] = useState(Array.from({ length: 75 }, (_, i) => i + 1));
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [lastCalled, setLastCalled] = useState(null);
    const [isGameRunning, setIsGameRunning] = useState(true);
    const [showBingo, setShowBingo] = useState(false);
    const [isAutoMark, setIsAutoMark] = useState(false);
    const [soundFX, setSoundFX] = useState({});
    const [daub, setDaub] = useState(null);
    const [isPowerMode, setIsPowerMode] = useState(false);
    
    const calculateNumbersToWin = useCallback((cardData, markedNumbers) => { const lines = []; const columns = Object.values(cardData); for(let i = 0; i < 5; i++) lines.push(columns.map(col => col[i])); for(let col of columns) lines.push(col); lines.push([cardData.B[0], cardData.I[1], cardData.N[2], cardData.G[3], cardData.O[4]]); lines.push([cardData.B[4], cardData.I[3], cardData.N[2], cardData.G[1], cardData.O[0]]); let minMissing = 5; for (const line of lines) { const missingInLine = line.filter(num => num !== 'FREE' && !markedNumbers.includes(num)).length; if (missingInLine < minMissing) minMissing = missingInLine; } return minMissing; }, []);
    useEffect(() => { if (isAutoMark && lastCalled) { cards.forEach((card, index) => { if (Object.values(card.data).flat().includes(lastCalled)) { handleMarkNumber(lastCalled, index, true); } }); } }, [lastCalled, isAutoMark, cards]);
    useEffect(() => { if (window.Tone) { setSoundFX({ call: new window.Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination(), mark: new window.Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.5 } }).toDestination(), win: new window.Tone.PolySynth(window.Tone.Synth, { oscillator: { type: "fatsawtooth" }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 } }).toDestination(), almost: new window.Tone.MembraneSynth().toDestination() }); } }, []);
    useEffect(() => { if (lastCalled && soundFX.call) { soundFX.call.triggerAttackRelease("C4", "8n"); } }, [lastCalled, soundFX.call]);
    useEffect(() => { if (!isGameRunning) return; const interval = setInterval(() => { setCalledNumbers(prev => { if (prev.length >= 75) { clearInterval(interval); setIsGameRunning(false); return prev; } const remaining = allNumbers.filter(n => !prev.includes(n)); const newNumber = remaining[Math.floor(Math.random() * remaining.length)]; setLastCalled(newNumber); return [...prev, newNumber]; }); }, 2000); return () => clearInterval(interval); }, [allNumbers, isGameRunning]);

    const handleMarkNumber = useCallback((number, cardIndex, isAuto = false) => {
        const currentCard = playerState.cards[cardIndex];
        if (currentCard.marked.includes(number)) return;
        if (isPowerMode) { setPlayerState(p => { const updatedCards = [...p.cards]; updatedCards[cardIndex].marked = [...currentCard.marked, number]; return {...p, cards: updatedCards, coins: p.coins - 50}; }); setIsPowerMode(false); return; }
        if (soundFX.mark && !isAuto) { const missing = calculateNumbersToWin(currentCard.data, currentCard.marked); if (missing === 2) { soundFX.almost.triggerAttackRelease("C2", "8n"); } else { soundFX.mark.triggerAttackRelease("E5", "16n"); } }
        setDaub(number);
        setTimeout(() => setDaub(null), 400);
        setPlayerState(p => { const updatedCards = [...p.cards]; updatedCards[cardIndex].marked = [...currentCard.marked, number]; return {...p, cards: updatedCards}; });
    }, [isPowerMode, playerState.cards, soundFX, setPlayerState, calculateNumbersToWin]);
    
    const handleBingoClick = () => {
        const cardData = cards[0].data; const marked = cards[0].marked; const checkLine = (line) => line.every(num => num === 'FREE' || marked.includes(num)); let isBingo = false; const columns = Object.values(cardData); for (let col of columns) if(checkLine(col)) isBingo = true; for (let i = 0; i < 5; i++) { const row = [cardData.B[i], cardData.I[i], cardData.N[i], cardData.G[i], cardData.O[i]]; if(checkLine(row)) isBingo = true; } const diag1 = [cardData.B[0], cardData.I[1], cardData.N[2], cardData.G[3], cardData.O[4]]; const diag2 = [cardData.B[4], cardData.I[3], cardData.N[2], cardData.G[1], cardData.O[0]]; if(checkLine(diag1) || checkLine(diag2)) isBingo = true;
        if (isBingo) { if(soundFX.win) soundFX.win.triggerAttackRelease(["C4", "E4", "G4"], "4n"); if (window.confetti) window.confetti({ particleCount: 250, spread: 100, origin: { y: 0.6 } }); setShowBingo(true); setIsGameRunning(false); setPlayerState(p => ({...p, wins: p.wins + 1, level: Math.floor((p.wins + 1) / 5) + 1 })); } 
        else { alert('Ainda não é bingo!'); }
    };
    
    const activatePower = () => { if(playerState.coins >= 50) { setIsPowerMode(true); alert('Carimbo Grátis Ativado! Clique em qualquer número por marcar na sua cartela.'); } else { alert('Moedas insuficientes! (Custo: 50 moedas)'); } };
    const getBingoLetter = (number) => { if (number <= 15) return 'B'; if (number <= 30) return 'I'; if (number <= 45) return 'N'; if (number <= 60) return 'G'; if (number <= 75) return 'O'; return ''; };

    return (
        <AppContainer bgClass="bg-gray-100">
            {showBingo && <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20"> <h1 className="text-7xl font-bold text-yellow-400 animate-bounce">BINGOOL!</h1> <p className="text-white text-2xl mt-4">Você venceu!</p> <button onClick={() => onNavigate('lobby')} className="mt-8 bg-lime-500 text-white font-bold py-3 px-8 rounded-lg text-xl">Voltar ao Lobby</button> </div>}
            <Header title={game.prize} onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="w-full bg-white rounded-xl shadow-lg p-4 mb-4 text-center animate-tada"> <p className="text-6xl font-bold text-red-500" style={{fontFamily: "'Arial Black', Gadget, sans-serif"}}>{getBingoLetter(lastCalled)}{lastCalled || '--'}</p> </div>
                <div className="mb-4"> <BingoCard cardData={cards[0]} theme={playerState.theme} calledNumbers={calledNumbers} onMarkNumber={(num) => handleMarkNumber(num, 0)} daub={daub} isAlmost={calculateNumbersToWin(cards[0].data, cards[0].marked) === 1} isPowerMode={isPowerMode} /> </div>
                <div className="mt-auto space-y-3">
                    <div>
                         <h3 className="text-center text-sm font-bold text-gray-500 mb-1">Números Chamados</h3>
                         <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-inner h-16 overflow-x-auto">
                            {calledNumbers.length === 0 && <p className="text-gray-400 text-sm w-full text-center">Aguardando o sorteio...</p>}
                            {calledNumbers.slice().reverse().map(num => (
                                <span key={num} className="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white text-md shadow-sm flex-shrink-0">{num}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setIsAutoMark(!isAutoMark)} className={`py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center text-sm ${isAutoMark ? 'bg-green-500' : 'bg-gray-400'}`}>Auto</button>
                            <button onClick={activatePower} aria-label="Usar Carimbo Grátis" className="py-3 rounded-lg font-semibold text-white bg-purple-500 flex items-center justify-center"><PowerIcon />Poder</button>
                            <button onClick={handleBingoClick} className="col-span-1 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-lg text-2xl shadow-lg active:transform active:scale-95">BINGO!</button>
                        </div>
                    </div>
                </div>
            </PageContent>
        </AppContainer>
    );
};

const PurchaseScreen = ({ onNavigate, setPlayerState, params }) => {
    const { game } = params; const [quantity, setQuantity] = useState(1); const [isLoading, setIsLoading] = useState(false);
    const handlePayment = () => { setIsLoading(true); setTimeout(() => { const newCards = Array.from({ length: quantity }, () => ({ id: Math.random(), data: generateBingoCard(), marked: [] })); setPlayerState(p => ({ ...p, cards: newCards, cardsBought: p.cardsBought + quantity })); setIsLoading(false); onNavigate('game', { cards: newCards, game }); }, 2000); };
    return (
      <AppContainer>
          <Header title="Comprar Cartelas" onBack={() => onNavigate('lobby')} />
          <PageContent>
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center shadow-lg"><h2 className="text-xl font-bold">{game.prize}</h2></div>
            <div className="my-8"> <label className="font-bold text-gray-700 text-lg">Quantidade (Máx. 4)</label> <div className="flex items-center justify-center mt-2"> <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-200 h-12 w-12 text-2xl font-bold rounded-lg">-</button> <span className="mx-6 text-3xl font-bold">{quantity}</span> <button onClick={() => setQuantity(q => Math.min(4, q + 1))} className="bg-gray-200 h-12 w-12 text-2xl font-bold rounded-lg">+</button> </div> </div>
            <div className="text-center bg-gray-200 p-4 rounded-lg mt-auto"> <p className="text-sm text-gray-600">R$ {game.price.toFixed(2)} POR CARTELA</p> <p className="text-2xl font-bold text-gray-800">TOTAL: R$ {(game.price * quantity).toFixed(2)}</p> </div>
            <div className="mt-4 space-y-2"> <button onClick={handlePayment} disabled={isLoading} className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-lg text-2xl shadow-lg flex items-center justify-center disabled:bg-lime-300">{isLoading ? <Spinner /> : 'PAGAR'}</button></div>
          </PageContent>
      </AppContainer>
    );
};

const HistoryScreen = ({ onNavigate, playerState }) => {
    return (
        <AppContainer>
            <Header title="Histórico e Estatísticas" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="grid grid-cols-2 gap-4 mb-8 text-center"> <div className="bg-blue-100 p-4 rounded-lg"><p className="text-2xl font-bold text-blue-700">{playerState.wins}</p><p className="text-sm text-gray-600">Vitórias</p></div> <div className="bg-yellow-100 p-4 rounded-lg"><p className="text-2xl font-bold text-yellow-700">{playerState.cardsBought}</p><p className="text-sm text-gray-600">Cartelas Compradas</p></div> </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Histórico de Jogos (Exemplo)</h3>
                <div className="space-y-3 flex-grow"> {[{ id: '#123456', date: '22 de abr', result: 'VITÓRIA' }, { id: '#123455', date: '21 de abr', result: 'DERROTA' }].map(item => ( <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"><div className="text-left"><p className="font-bold text-gray-500 text-sm">{item.date}</p><p className="font-semibold text-gray-700">{item.id}</p></div><span className={`px-4 py-1 rounded-full font-bold text-sm text-white ${item.result === 'VITÓRIA' ? 'bg-green-500' : 'bg-red-500'}`}>{item.result}</span></div>))} </div>
            </PageContent>
        </AppContainer>
    );
};

const LoginScreen = ({ onNavigate }) => (
    <AppContainer>
      <PageContent>
        <div className="flex flex-col justify-center flex-grow">
            <div className="text-center mb-8"> <h1 className="text-5xl font-bold text-white bg-blue-500 py-2 px-4 rounded-lg shadow-lg" style={{ fontFamily: "'Arial Black', Gadget, sans-serif" }}>Bingool</h1> <h2 className="text-3xl font-semibold text-gray-700 mt-2">Aceda à sua Conta</h2> </div> <div className="space-y-6"> <input type="text" placeholder="Utilizador ou email" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500 transition-colors" /> <input type="password" placeholder="Senha" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500 transition-colors" /> <button onClick={() => onNavigate('lobby')} className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-lg text-xl shadow-lg">LOGIN</button> <button onClick={() => onNavigate('lobby')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg text-lg">CADASTRE-SE</button> </div>
        </div>
      </PageContent>
    </AppContainer>
  );

// --- Componente Principal ---

export default function App() {
  const [page, setPage] = useState({ name: 'lobby', params: {} });
  const [playerState, setPlayerState] = useState({ level: 1, wins: 0, coins: 500, cardsBought: 0, theme: 'default', cards: [], });
  const handleNavigate = (name, params = {}) => setPage({ name, params });
  useEffect(() => { const scripts = [{ id: 'confetti-script', src: "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js" }, { id: 'tone-script', src: "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js" }]; scripts.forEach(s => { if (!document.getElementById(s.id)) { const script = document.createElement('script'); script.id = s.id; script.src = s.src; script.async = true; document.head.appendChild(script); } }); }, []);

  const renderPage = () => {
    const props = { onNavigate: handleNavigate, playerState, setPlayerState, params: page.params };
    switch (page.name) {
      case 'lobby': return <LobbyScreen {...props} />;
      case 'profile': return <ProfileScreen {...props} />;
      case 'game': return <GameScreen {...props} />;
      case 'purchase': return <PurchaseScreen {...props} />;
      case 'history': return <HistoryScreen {...props} />;
      case 'login': return <LoginScreen {...props} />;
      default: return <LobbyScreen {...props} />;
    }
  };
  
  useEffect(() => { document.body.className = 'bg-gray-100'; }, []);
  return (
    <>
      <style>{`
        @keyframes daub { 0% { transform: scale(0.5); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
        .animate-daub { animation: daub 0.4s ease-out forwards; }
        @keyframes pulse-bright { 0%, 100% { box-shadow: 0 0 2px 2px rgba(250, 204, 21, 0.0); } 50% { box-shadow: 0 0 8px 5px rgba(250, 204, 21, 0.7); } }
        .animate-pulse-bright { animation: pulse-bright 1.5s infinite; }
      `}</style>
      <div className="font-sans">{renderPage()}</div>
    </>
  );
}
