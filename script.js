// Навигация секциялары
function scrollToSection(id){
    document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

// Дыбыстар
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');
const moveSound = new Audio('sounds/move.mp3');
const captureSound = new Audio('sounds/capture.mp3');

// Ойын логикасы
let boardState=[], selectedPiece=null;

// 20 сұрақ мысалы (әр шашкаға)
const questions = [
  {piece:'W1', question:'«Мен барамын, … сен үйде қаласың» – дұрыс шылау?', options:['бірақ','және','немесе'], answer:'бірақ'},
  {piece:'W2', question:'«Ол кітап оқиды, … сабаққа дайындалады» – дұрыс шылау?', options:['және','немесе','бірақ'], answer:'және'},
  {piece:'W3', question:'«Сен оқыдың ба, … мен де оқыдым» – дұрыс шылау?', options:['де','па','ме'], answer:'де'},
  {piece:'B1', question:'«Мен барып келдім, … сен көрдің бе?» – дұрыс шылау?', options:['және','бірақ','немесе'], answer:'бірақ'},
  {piece:'B2', question:'«Ол ән айтады, … биді билейді» – дұрыс шылау?', options:['және','немесе','бірақ'], answer:'және'},
  // Қалған шашкаларға да сұрақтар осы тәрізді қосылады
];

// Тақта құру
function initBoard(){
    const board = document.getElementById('board');
    board.innerHTML='';
    boardState = Array(64).fill(null);

    // 8×8 шашка бастапқы орналасуы
    const whiteStart=[1,3,5,7,8,10,12,14,17,19,21,23];
    const blackStart=[40,42,44,46,49,51,53,55,56,58,60,62];

    whiteStart.forEach((i,j)=>placePiece(i,'white','W'+(j+1)));
    blackStart.forEach((i,j)=>placePiece(i,'black','B'+(j+1)));

    enableDragDrop();
}

// Шашканы орналастыру
function placePiece(index,color,id){
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if((Math.floor(index/8)+index)%2===0) cell.classList.add('white');
    else cell.classList.add('black');
    cell.dataset.index=index;
    const piece = document.createElement('div');
    piece.classList.add('piece',color);
    piece.id = id;
    piece.draggable = true;
    cell.appendChild(piece);
    document.getElementById('board').appendChild(cell);
    boardState[index]=id;
}

// Drag & Drop логикасы
let dragSourceIndex = null;

function enableDragDrop(){
    document.querySelectorAll('.piece').forEach(p=>{
        p.addEventListener('dragstart', e=>{
            dragSourceIndex = [...document.querySelectorAll('.cell')].findIndex(c=>c.contains(e.target));
        });
    });
    document.querySelectorAll('.cell').forEach(cell=>{
        cell.addEventListener('dragover', e=> e.preventDefault());
        cell.addEventListener('drop', e=>{
            if(dragSourceIndex===null) return;
            const targetIndex = [...document.querySelectorAll('.cell')].indexOf(cell);
            const pieceId = boardState[dragSourceIndex];
            if(!pieceId) return;
            showQuestionForPiece(pieceId,targetIndex);
            dragSourceIndex=null;
        });
    });
}

// Сұрақ шығару
function showQuestionForPiece(pieceId,targetIndex){
    const q = questions.find(q=>q.piece===pieceId);
    if(!q){ movePiece(pieceId,targetIndex); return; }

    const qt = document.getElementById('question-text');
    const ansDiv = document.getElementById('answers');
    qt.textContent = q.question;
    ansDiv.innerHTML='';
    q.options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = ()=>checkAnswer(opt,q.answer,pieceId,targetIndex);
        ansDiv.appendChild(btn);
    });
}

// Жауапты тексеру
function checkAnswer(selected,correct,pieceId,targetIndex){
    if(selected===correct){
        correctSound.play();
        movePiece(pieceId,targetIndex);
    } else {
        wrongSound.play();
        alert('Қате жауап!');
    }
}

// Шашка қозғалысы
function movePiece(id,targetIndex){
    const oldIndex = boardState.findIndex(p=>p===id);
    if(boardState[targetIndex]){
        document.getElementById(boardState[targetIndex]).remove();
        captureSound.play();
    }
    const oldCell = document.querySelector(`.cell[data-index='${oldIndex}']`);
    oldCell.innerHTML='';
    const color = id[0]==='W'?'white':'black';
    placePiece(targetIndex,color,id);
    moveSound.play();
    checkWinner();
}

// Жеңімпазды тексеру
function checkWinner(){
    const whiteLeft = document.querySelectorAll('.piece.white').length;
    const blackLeft = document.querySelectorAll('.piece.black').length;
    if(whiteLeft===0 || blackLeft===0){
        const winnerDiv = document.getElementById('winner');
        winnerDiv.classList.remove('hidden');
        winnerDiv.textContent = whiteLeft===0 ? 'Қара шашка жеңді!' : 'Ақ шашка жеңді!';
    }
}

// Ойынды қайта бастау
function resetGame(){
    boardState=[]; selectedPiece=null;
    document.getElementById('winner').classList.add('hidden');
    document.getElementById('board').innerHTML='';
    document.getElementById('question-text').textContent='';
    document.getElementById('answers').innerHTML='';
    initBoard();
}

// Сайт ашылғанда автоматты тақта
window.onload = initBoard;
