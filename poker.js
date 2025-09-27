const suits = ['♠','♥','♦','♣'];
const values = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
const botNames = ['Bot Ali','Bot Sara','Bot King','Bot Mona','Bot Poker','Bot Jaafar'];
function dealPokerHands(userName) {
    let deck = [];
    suits.forEach(s => values.forEach(v => deck.push(v+s)));
    deck = shuffle(deck);
    let hands = [];
    let names = [userName].concat(botNames.slice(0,5));
    for (let i=0; i<6; i++) {
        hands.push({player: names[i], cards: deck.slice(i*5, i*5+5)});
    }
    return hands;
}
function renderPokerTableWithHands(hands) {
    const seats = document.querySelectorAll('.seat');
    seats.forEach((seat, idx) => {
        seat.innerHTML = '';
        let hand = hands[idx];
        hand.cards.forEach(card => {
            let c = document.createElement('div');
            c.className = 'playing-card';
            c.textContent = card;
            seat.appendChild(c);
        });
        let pname = document.createElement('div');
        pname.style.fontSize='0.7em'; pname.style.color='#ffd700'; pname.textContent=hand.player;
        seat.appendChild(pname);
    });
}
function renderPokerTable(){
    let hands = dealPokerHands(window.PokerApp.user?.displayName||'أنت');
    renderPokerTableWithHands(hands);
}
function evaluatePokerWinner(hands) {
    let ranked = hands.map(h => ({
        player: h.player,
        rank: getPokerHandRank(h.cards)
    }));
    ranked.sort((a,b)=>b.rank.score-a.rank.score);
    return ranked[0];
}
function getPokerHandRank(cards) {
    let valMap = {'A':14,'K':13,'Q':12,'J':11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};
    let v = cards.map(c=>c.slice(0,-1)).map(x=>valMap[x]);
    let s = cards.map(c=>c.slice(-1));
    v.sort((a,b)=>b-a);
    let isFlush = s.every(x=>x===s[0]);
    let isStraight = v.every((x,i,arr)=>i===0||x===arr[i-1]-1) || (JSON.stringify(v)==='[14,5,4,3,2]');
    let counts = {};
    v.forEach(x=>counts[x]=(counts[x]||0)+1);
    let vals = Object.values(counts).sort((a,b)=>b-a);
    if (isFlush && JSON.stringify(v.slice(0,5))==='[14,13,12,11,10]') return {score:10,name:'Royal Flush'};
    if (isFlush && isStraight) return {score:9,name:'Straight Flush'};
    if (vals[0]===4) return {score:8,name:'Four of a Kind'};
    if (vals[0]===3 && vals[1]===2) return {score:7,name:'Full House'};
    if (isFlush) return {score:6,name:'Flush'};
    if (isStraight) return {score:5,name:'Straight'};
    if (vals[0]===3) return {score:4,name:'Three of a Kind'};
    if (vals[0]===2 && vals[1]===2) return {score:3,name:'Two Pair'};
    if (vals[0]===2) return {score:2,name:'Pair'};
    return {score:1,name:'High Card'};
}
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
