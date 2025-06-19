import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// --- Ícones ---
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserAvatarIcon = ({ onClick }) => <button aria-label="Ver Perfil" onClick={onClick} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></button>;
const Spinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PowerIcon = () => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StarIcon = () => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;

// --- Lógica do Jogo de Bingo ---
const generateBingoCard = () => {
    const card = { B: [], I: [], N: [], G: [], O: [] };
    const ranges = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };
    for (const col in ranges) { 
        const numbers = new Set(); 
        while (numbers.size < 5) { 
            if (col === 'N' && numbers.size === 2) { 
                numbers.add('FREE'); 
            } else { 
                numbers.add(Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0]); 
            } 
        } 
        card[col] = Array.from(numbers); 
    }
    return card;
};

// --- Componentes ---
const AppContainer = ({ children }) => <div className="w-screen h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-green-400 flex flex-col">{children}</div>;
const PageContent = ({ children }) => <div className="p-4 flex-grow flex flex-col">{children}</div>;
const Header = ({ title, onBack, rightContent }) => (
    <header className="flex-shrink-0 bg-white shadow-lg z-10 rounded-b-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between p-4 h-16">
            <div className="w-1/4">
                {onBack && <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition"><BackIcon /></button>}
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

const Modal = ({ title, children, onClose }) => ( 
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative text-center"> 
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">{title}</h2> 
            {children} 
            <button onClick={onClose} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">Fechar</button> 
        </div> 
    </div> 
);

const PurchaseScreen = ({ onNavigate, playerState, setPlayerState, params }) => {
    const { game } = params;
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const totalPrice = (game.price * quantity).toFixed(2);

    const handlePurchase = () => {
        setShowPayment(true);
    };

    const handlePayment = () => {
        setIsLoading(true);
        setTimeout(() => {
            const newCards = Array.from({ length: quantity }, () => ({
                data: generateBingoCard(),
                marked: []
            }));
            
            setPlayerState(prev => ({
                ...prev,
                cards: newCards,
                cardsBought: prev.cardsBought + quantity,
                coins: prev.coins - (game.price * quantity * 100)
            }));
            
            setIsLoading(false);
            setShowPayment(false);
            setShowConfirmation(true);
        }, 2000);
    };

    const handleStartGame = () => {
        onNavigate('game', { cards: playerState.cards, game });
    };

    if (showConfirmation) {
        return (
            <AppContainer>
                <Header title="Confirmação" onBack={() => onNavigate('lobby')} />
                <PageContent>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h2>
                            <p className="text-gray-600 mb-4">{quantity} cartela(s)</p>
                            <p className="text-xl font-bold text-gray-800 mb-6">Total: R$ {totalPrice}</p>
                            <button 
                                onClick={handleStartGame}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Começar Jogo
                            </button>
                        </div>
                    </div>
                </PageContent>
            </AppContainer>
        );
    }

    if (showPayment) {
        return (
            <AppContainer>
                <Header title="Pagamento" onBack={() => setShowPayment(false)} />
                <PageContent>
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Dados do Cartão</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                                <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Nome como no cartão"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/AA"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input 
                                        type="text" 
                                        placeholder="000"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                As informações estão seguras
                            </div>
                        </div>
                        <button 
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <Spinner /> : null}
                            {isLoading ? 'Processando...' : 'Pagar'}
                        </button>
                    </div>
                </PageContent>
            </AppContainer>
        );
    }

    return (
        <AppContainer>
            <Header title="Comprar Cartelas" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                    <div className="text-center mb-6">
                        <div className="bg-blue-500 text-white p-4 rounded-xl mb-4">
                            <div className="text-lime-400 font-bold text-lg mb-2">BINGO</div>
                            <div className="grid grid-cols-5 gap-1 mb-2">
                                {Array.from({ length: 25 }, (_, i) => (
                                    <div key={i} className="bg-lime-400 text-blue-800 text-xs font-bold rounded aspect-square flex items-center justify-center">
                                        {i === 12 ? 'FREE' : Math.floor(Math.random() * 75) + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{game.prize}</h3>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 bg-lime-400 text-blue-800 font-bold rounded-full hover:bg-lime-500 transition"
                            >
                                -
                            </button>
                            <span className="text-2xl font-bold text-gray-800 w-12 text-center">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 bg-lime-400 text-blue-800 font-bold rounded-full hover:bg-lime-500 transition"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2">R$ {game.price.toFixed(2)} por cartela</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-xl mb-6">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                            <span>TOTAL:</span>
                            <span>R$ {totalPrice}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePurchase}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        PAGAR
                    </button>
                </div>
            </PageContent>
        </AppContainer>
    );
};

const LobbyScreen = ({ onNavigate, setPlayerState }) => {
    const [showDailyReward, setShowDailyReward] = useState(false);
    
    useEffect(() => { 
        const lastVisit = localStorage.getItem('lastBingoolVisit'); 
        const today = new Date().toDateString(); 
        if (lastVisit !== today) { 
            setShowDailyReward(true); 
            localStorage.setItem('lastBingoolVisit', today); 
        } 
    }, []);
    
    const claimReward = () => { 
        setPlayerState(prev => ({ ...prev, coins: prev.coins + 100 })); 
        setShowDailyReward(false); 
    };
    
    const games = [ 
        { id: 1, prize: 'Prémio de R$ 300,00', price: 2.00 }, 
        { id: 2, prize: 'Prémio: iPhone 16 Pro', price: 5.00 }, 
        { id: 3, prize: 'Prémio: Moto 0KM', price: 10.00 }, 
    ];
    
    return (
        <AppContainer>
            {showDailyReward && ( 
                <Modal title="🎁 Recompensa Diária! 🎁" onClose={claimReward}> 
                    <p className="text-gray-600 mb-4">Bem-vindo de volta! Aqui está o seu bónus por jogar hoje.</p> 
                    <p className="text-3xl font-bold text-lime-500">100 Moedas</p> 
                </Modal> 
            )}
            <Header title="BINGO" rightContent={<UserAvatarIcon onClick={() => onNavigate('profile')} />} />
            <PageContent>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl mb-6 shadow-lg">
                    <h3 className="font-bold text-gray-700 text-xl mb-4 text-center">Jogos Disponíveis</h3>
                    <div className="space-y-3"> 
                        {games.map(game => ( 
                            <button 
                                key={game.id} 
                                onClick={() => onNavigate('purchase', { game })} 
                                className="w-full flex items-center bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            > 
                                <span className="bg-lime-400 text-blue-800 rounded-full h-10 w-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">{game.id}</span> 
                                <span className="font-semibold">Bingo - {game.prize}</span> 
                            </button> 
                        ))} 
                    </div>
                </div>
                <div className="flex-grow flex flex-col">
                    <h3 className="font-bold text-white text-xl mb-4 text-center drop-shadow-lg">Minhas Cartelas</h3>
                    <div className="flex justify-around items-center mb-6"> 
                        <button 
                            onClick={() => onNavigate('purchase', { game: games[0] })} 
                            className="flex flex-col items-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <CardIcon />
                            <span className="mt-2 font-semibold text-gray-700">Marcar Cartela</span>
                        </button> 
                        <button 
                            onClick={() => onNavigate('purchase', { game: games[0] })} 
                            className="flex flex-col items-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <CartIcon />
                            <span className="mt-2 font-semibold text-gray-700">Comprar Cartelas</span>
                        </button> 
                    </div>
                    <button 
                        onClick={() => onNavigate('history')} 
                        className="w-full mt-auto bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 font-bold py-4 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl"
                    >
                        Histórico
                    </button>
                </div>
            </PageContent>
        </AppContainer>
    );
};

const ProfileScreen = ({ onNavigate, playerState, setPlayerState }) => {
    const achievements = [ 
        { id: 1, text: 'Ganhe 10 jogos', unlocked: playerState.wins >= 10 }, 
        { id: 2, text: 'Faça um bingo rápido (30 bolas)', unlocked: false }, 
        { id: 3, text: 'Jogue 7 dias seguidos', unlocked: true }, 
        { id: 4, text: 'Compre 50 cartelas', unlocked: playerState.cardsBought >= 50 }, 
    ];
    
    const themes = [ 
        { id: 'default', name: 'Padrão', bg: 'bg-white', text: 'text-blue-600' }, 
        { id: 'carnaval', name: 'Carnaval', bg: 'bg-yellow-200', text: 'text-purple-700' }, 
        { id: 'espaco', name: 'Espaço', bg: 'bg-gray-800', text: 'text-cyan-300' }, 
    ];
    
    return (
        <AppContainer>
            <Header title="Meu Perfil" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="flex flex-col items-center mb-6"> 
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg"> 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg> 
                    </div> 
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Utilizador Exemplo</h2> 
                    <div className="mt-2 text-lg font-semibold text-lime-300 flex items-center drop-shadow-lg"> 
                        <StarIcon /> Nível {playerState.level} 
                    </div> 
                </div>
                <div className="mb-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg"> 
                    <h3 className="font-bold text-gray-700 text-lg mb-4">Tema da Cartela</h3> 
                    <div className="flex justify-around bg-gray-100 p-2 rounded-xl"> 
                        {themes.map(theme => 
                            <button 
                                key={theme.id} 
                                onClick={() => setPlayerState(p => ({ ...p, theme: theme.id }))} 
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${playerState.theme === theme.id ? `${theme.bg} ${theme.text} ring-2 ring-blue-500` : 'bg-white hover:bg-gray-50'}`}
                            >
                                {theme.name}
                            </button>
                        )} 
                    </div> 
                </div>
                <div className="mb-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg"> 
                    <h3 className="font-bold text-gray-700 text-lg mb-4">Conquistas</h3> 
                    <div className="space-y-3"> 
                        {achievements.map(ach => ( 
                            <div key={ach.id} className={`flex items-center p-4 rounded-xl transition-all ${ach.unlocked ? 'bg-lime-100 text-lime-800 shadow-md' : 'bg-gray-100 text-gray-500'}`}> 
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${ach.unlocked ? 'bg-lime-500 text-white' : 'bg-gray-300'}`}>
                                    {ach.unlocked && '✔'}
                                </div> 
                                {ach.text} 
                            </div> 
                        ))} 
                    </div> 
                </div>
            </PageContent>
        </AppContainer>
    );
};

const BingoCard = ({ cardData, theme, calledNumbers, onMarkNumber, daub, isPowerMode, isAlmost }) => {
    if (!cardData) return <div className="p-2 rounded-lg shadow-md bg-gray-200 animate-pulse"></div>;
    
    const themes = { default: 'bg-white', carnaval: 'bg-yellow-200', espaco: 'bg-gray-800' };
    const textColors = { default: 'text-blue-600', carnaval: 'text-purple-700', espaco: 'text-cyan-300' };
    const markedBg = { default: 'bg-lime-400', carnaval: 'bg-pink-500', espaco: 'bg-indigo-500' };
    
    return (
        <div className={`relative grid grid-cols-5 gap-2 p-4 rounded-2xl shadow-lg ${themes[theme]} ${isAlmost ? 'animate-pulse-bright ring-4 ring-lime-400' : ''}`}>
            {['B', 'I', 'N', 'G', 'O'].map(letter => 
                <div key={letter} className={`text-center font-bold text-2xl ${textColors[theme]}`}>{letter}</div>
            )}
            {Object.values(cardData.data).flat().map((number, index) => {
                const isCenter = number === 'FREE';
                const isMarked = cardData.marked.includes(number) || isCenter;
                const isCalled = calledNumbers.includes(number);
                return (
                    <button
                        key={index}
                        onClick={() => !isCenter && onMarkNumber(number)}
                        disabled={isCenter || (!isPowerMode && !isCalled)}
                        className={`relative aspect-square w-full flex items-center justify-center rounded-full text-lg font-bold transition-all duration-300 active:transform active:scale-90 shadow-md hover:shadow-lg
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

const GameScreen = ({ onNavigate, playerState, setPlayerState, params }) => {
    const { cards, game } = params;
    const [allNumbers] = useState(Array.from({ length: 75 }, (_, i) => i + 1));
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [lastCalled, setLastCalled] = useState(null);
    const [isGameRunning, setIsGameRunning] = useState(true);
    const [showBingo, setShowBingo] = useState(false);
    const [isAutoMark, setIsAutoMark] = useState(false);
    const [daub, setDaub] = useState(null);
    const [isPowerMode, setIsPowerMode] = useState(false);
    
    const calculateNumbersToWin = useCallback((cardData, markedNumbers) => { 
        const lines = []; 
        const columns = Object.values(cardData); 
        for(let i = 0; i < 5; i++) lines.push(columns.map(col => col[i])); 
        for(let col of columns) lines.push(col); 
        lines.push([cardData.B[0], cardData.I[1], cardData.N[2], cardData.G[3], cardData.O[4]]); 
        lines.push([cardData.B[4], cardData.I[3], cardData.N[2], cardData.G[1], cardData.O[0]]); 
        let minMissing = 5; 
        for (const line of lines) { 
            const missingInLine = line.filter(num => num !== 'FREE' && !markedNumbers.includes(num)).length; 
            if (missingInLine < minMissing) minMissing = missingInLine; 
        } 
        return minMissing; 
    }, []);
    
    useEffect(() => { 
        if (isAutoMark && lastCalled) { 
            cards.forEach((card, index) => { 
                if (Object.values(card.data).flat().includes(lastCalled)) { 
                    handleMarkNumber(lastCalled, index, true); 
                } 
            }); 
        } 
    }, [lastCalled, isAutoMark, cards]);
    
    useEffect(() => { 
        if (!isGameRunning) return; 
        const interval = setInterval(() => { 
            setCalledNumbers(prev => { 
                if (prev.length >= 75) { 
                    clearInterval(interval); 
                    setIsGameRunning(false); 
                    return prev; 
                } 
                const remaining = allNumbers.filter(n => !prev.includes(n)); 
                const newNumber = remaining[Math.floor(Math.random() * remaining.length)]; 
                setLastCalled(newNumber); 
                return [...prev, newNumber]; 
            }); 
        }, 2000); 
        return () => clearInterval(interval); 
    }, [allNumbers, isGameRunning]);

    const handleMarkNumber = useCallback((number, cardIndex, isAuto = false) => {
        const currentCard = playerState.cards[cardIndex];
        if (currentCard.marked.includes(number)) return;
        
        if (isPowerMode) { 
            setPlayerState(p => { 
                const updatedCards = [...p.cards]; 
                updatedCards[cardIndex].marked = [...currentCard.marked, number]; 
                return {...p, cards: updatedCards, coins: p.coins - 50}; 
            }); 
            setIsPowerMode(false); 
            return; 
        }
        
        setDaub(number);
        setTimeout(() => setDaub(null), 400);
        setPlayerState(p => { 
            const updatedCards = [...p.cards]; 
            updatedCards[cardIndex].marked = [...currentCard.marked, number]; 
            return {...p, cards: updatedCards}; 
        });
    }, [isPowerMode, playerState.cards, setPlayerState]);
    
    const handleBingoClick = () => {
        const cardData = cards[0].data; 
        const marked = cards[0].marked;
        const lines = []; 
        const columns = Object.values(cardData);
        for(let i = 0; i < 5; i++) lines.push(columns.map(col => col[i]));
        for(let col of columns) lines.push(col);
        lines.push([cardData.B[0], cardData.I[1], cardData.N[2], cardData.G[3], cardData.O[4]]);
        lines.push([cardData.B[4], cardData.I[3], cardData.N[2], cardData.G[1], cardData.O[0]]);
        const hasBingo = lines.some(line => line.every(num => num === 'FREE' || marked.includes(num)));
        
        if (hasBingo) { 
            setShowBingo(true); 
            setIsGameRunning(false); 
            setPlayerState(p => ({ 
                ...p, 
                wins: p.wins + 1, 
                coins: p.coins + 300 
            })); 
        }
    };

    return (
        <AppContainer>
            {showBingo && ( 
                <Modal title="🎉 BINGO! 🎉" onClose={() => onNavigate('lobby')}> 
                    <p className="text-gray-600 mb-4">Parabéns! Você ganhou!</p> 
                    <p className="text-2xl font-bold text-lime-500">Prémio: R$ 300,00</p> 
                </Modal> 
            )}
            <Header title="Jogo de Bingo" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl mb-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Última Bola</p>
                            <p className="text-3xl font-bold text-blue-600">{lastCalled || '--'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Bolas Chamadas</p>
                            <p className="text-2xl font-bold text-gray-800">{calledNumbers.length}/75</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setIsAutoMark(!isAutoMark)} 
                            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${isAutoMark ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Auto-Marcar
                        </button>
                        <button 
                            onClick={() => setIsPowerMode(true)} 
                            disabled={playerState.coins < 50} 
                            className="flex-1 py-2 px-4 rounded-xl font-semibold bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center"
                        >
                            <PowerIcon />Power (50 moedas)
                        </button>
                    </div>
                </div>
                <div className="space-y-4 mb-4">
                    {cards.map((card, index) => (
                        <BingoCard
                            key={index}
                            cardData={card}
                            theme={playerState.theme}
                            calledNumbers={calledNumbers}
                            onMarkNumber={(number) => handleMarkNumber(number, index)}
                            daub={daub}
                            isPowerMode={isPowerMode}
                            isAlmost={calculateNumbersToWin(card.data, card.marked) === 1}
                        />
                    ))}
                </div>
                <button 
                    onClick={handleBingoClick} 
                    className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-2xl text-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    BINGO!
                </button>
            </PageContent>
        </AppContainer>
    );
};

const HistoryScreen = ({ onNavigate }) => {
    const gameHistory = [
        { id: 1, date: '22 de dezembro', result: 'VITÓRIA', prize: 'R$ 300,00', status: 'won' },
        { id: 2, date: '21 de dezembro', result: 'DERROTA', prize: '-', status: 'lost' },
        { id: 3, date: '20 de dezembro', result: 'DERROTA', prize: '-', status: 'lost' },
        { id: 4, date: '19 de dezembro', result: 'VITÓRIA', prize: 'R$ 150,00', status: 'won' },
        { id: 5, date: '18 de dezembro', result: 'DERROTA', prize: '-', status: 'lost' },
        { id: 6, date: '17 de dezembro', result: 'VITÓRIA', prize: 'R$ 75,00', status: 'won' },
    ];

    return (
        <AppContainer>
            <Header title="Histórico" onBack={() => onNavigate('lobby')} />
            <PageContent>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-gray-700 text-lg mb-4 text-center">Resultados</h3>
                    <div className="space-y-3">
                        {gameHistory.map(game => (
                            <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">{game.date}</p>
                                    <p className="font-semibold text-gray-800">#{game.id.toString().padStart(6, '0')}</p>
                                </div>
                                <div className="text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        game.status === 'won' 
                                            ? 'bg-lime-100 text-lime-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {game.result}
                                    </span>
                                    {game.prize !== '-' && (
                                        <p className="text-sm text-gray-600 mt-1">{game.prize}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-center">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                            VER DETALHES
                        </button>
                    </div>
                </div>
            </PageContent>
        </AppContainer>
    );
};

// Componente principal da aplicação
const App = () => {
    const [currentScreen, setCurrentScreen] = useState('lobby');
    const [screenParams, setScreenParams] = useState({});
    const [playerState, setPlayerState] = useState({
        coins: 500,
        level: 1,
        wins: 0,
        cardsBought: 0,
        theme: 'default',
        cards: []
    });

    const navigate = (screen, params = {}) => {
        setCurrentScreen(screen);
        setScreenParams(params);
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'lobby':
                return <LobbyScreen onNavigate={navigate} setPlayerState={setPlayerState} />;
            case 'profile':
                return <ProfileScreen onNavigate={navigate} playerState={playerState} setPlayerState={setPlayerState} />;
            case 'purchase':
                return <PurchaseScreen onNavigate={navigate} playerState={playerState} setPlayerState={setPlayerState} params={screenParams} />;
            case 'game':
                return <GameScreen onNavigate={navigate} playerState={playerState} setPlayerState={setPlayerState} params={screenParams} />;
            case 'history':
                return <HistoryScreen onNavigate={navigate} />;
            default:
                return <LobbyScreen onNavigate={navigate} setPlayerState={setPlayerState} />;
        }
    };

    return renderScreen();
};

export default App;

