/**
 * Заголовок экрана
 */
const title = document.querySelector( 'main.game>h2' ) as HTMLHeadingElement;
/**
 * Форма для действий игрока
 */
const form = document.forms.namedItem( 'player-roll' )!;
/**
 * Набор полей на форме
 */
const fieldset = form.querySelector( 'fieldset' )!;
/**
 * Поле с загаданным числом
 */

if ( !title || !form || !fieldset )
{
	throw new Error( 'Can\'t find required elements on "game" screen' );
}

/**
 * Обработчик хода игрока
 */
type TurnHandler = ( number: any, playerMove: any, lostMoveX: any, newMoveX: any, lostMoveY: any, newMoveY: any,) => void;

/**
 * Обработчик хода игрока
 */
let turnHandler: any;

form.addEventListener( 'submit', onSubmit );

let numberInput: any = 0;

const X = 10,
    Y = 10;
let massiv: any[][] = [];
for (let r = 0; r < X; r++) {
    massiv.push([]);
}
for (let r = 0; r < X; r++) {
    for (let c = 0; c < Y; c++) {
    massiv[r][c] = 0;  
    }
}
let elems: { src: any; }[][] = []; 
for (let r = 0; r < X; r++) {
    elems.push([]);
}
let massivimg: any[] = [];
massivimg[0] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Ffree.png?v=1583175458724";
massivimg[1] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Fwhite.png?v=1583179638484";
massivimg[2] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Fdark.png?v=1583179645260";

let boardAdd: any = massivimg[0];
let playerMove: any = "";
let lostMoveX: any = "";
let lostMoveY: any = "";
let newMoveX: any = "";
let newMoveY: any = "";

const board: any = document.getElementById('board');
for (let x = 9; x > 0; x--) {
    const row: any = document.createElement('div');
    row.classList.add('class', 'row');
    board.appendChild(row);
    for (let y = 1; y < 10; y++) {
        const tile: any = document.createElement('IMG');
        tile.classList.add('class', 'tile');
        if (x < 4 && y < 4) {
            tile.src = massivimg[1];
        } else if (x > 6 && y > 6) {
            tile.src = massivimg[2];
        } else {
            tile.src = massivimg[0];
        }

        tile.addEventListener('click', () => {
            if (boardAdd == massivimg[0] && tile.src != massivimg[0] && tile.src == playerMove && title.textContent == 'Ваш ход') {
                boardAdd = tile.src;
                tile.src = massivimg[0];
                lostMoveX = x;
                lostMoveY = y;
            } else if ((lostMoveX != x || lostMoveY != y) && boardAdd != massivimg[0] && tile.src == massivimg[0] && (Math.abs(lostMoveX - x) < 2 && Math.abs(lostMoveY - y) < 2 || gameJump(x, y) == true)) {
                tile.src = boardAdd;
                boardAdd = massivimg[0];
                newMoveX = x;
                newMoveY = y;
                if (playerMove == massivimg[1]) {
                    playerMove = massivimg[2];
                } else {
                    playerMove = massivimg[1];
                }
                gameEnd();
                onSubmit(event);
            }
        });


        row.appendChild(tile);
        elems[x][y] = tile;
    }
}

function gameEnd() {
    numberInput = null;
    let winWhite = 0;
    let winBlack = 0;
    for (let x = 9; x > 0; x--) {
        for (let y = 1; y < 10; y++) {
            if (x < 4 && y < 4 && elems[x][y].src == massivimg[2]) {
                winBlack += 1;
            } else if (x > 6 && y > 6 && elems[x][y].src == massivimg[1]) {
                winWhite += 1;
            }
        }
    }

    if (winWhite == 9) {
        numberInput = 100;
    } else if (winBlack == 9) {
        numberInput = 100;
    }
}

function gameJump(x: any, y: any) {
    if (Math.abs(lostMoveX - x) < 3 && Math.abs(lostMoveY - y) < 3) {
        let jumpX = (lostMoveX + x) / 2;
        let jumpY = (lostMoveY + y) / 2;
        if (elems[jumpX][jumpY].src != massivimg[0]) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

/**
 * Обрабатывает отправку формы
 * 
 * @param event Событие отправки
 */
function onSubmit( event: any ): void
{
	event.preventDefault();
	
	turnHandler && turnHandler( numberInput, playerMove, lostMoveX, newMoveX, lostMoveY, newMoveY );
}

/**
 * Обновляет экран игры
 * 
 * @param myTurn Ход текущего игрока?
 */
function update( myTurn: boolean, playerMoveS: any, lostMoveXS: any, xS: any, lostMoveYS: any, yS: any): void
{
	if ( myTurn )
	{
        numberInput = null;
        playerMove = playerMoveS;
        if (lostMoveXS > 0 && xS > 0) {

            elems[lostMoveXS][lostMoveYS].src = massivimg[0];
            if (playerMoveS == massivimg[1]) {
                elems[xS][yS].src = massivimg[2];
            } else {
                elems[xS][yS].src = massivimg[1];
            }
        }
        title.textContent = 'Ваш ход';
        fieldset.disabled = false;
        return;
	}
	
	title.textContent = 'Ход противника';
	fieldset.disabled = true;
}

/**
 * Устанавливает обработчик хода игрока
 * 
 * @param handler Обработчик хода игрока
 */
function setTurnHandler( handler: TurnHandler ): void
{
	turnHandler = handler;
}

export {
	update,
	setTurnHandler,
};
