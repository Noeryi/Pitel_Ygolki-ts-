import { openScreen } from './screens.js';
import * as GameScreen from './screens/game.js';
import * as ResultScreen from './screens/result.js';

GameScreen.setTurnHandler( turnHandler );
ResultScreen.setRestartHandler( restartHandler );

/**
 * Отправляет сообщение на сервер
 */
let sendMessage: typeof import( './connection.js' ).sendMessage;

/**
 * Устанавливает функцию отправки сообщений на сервер
 * 
 * @param sendMessageFunction Функция отправки сообщений
 */
function setSendMessage( sendMessageFunction: typeof sendMessage ): void
{
	sendMessage = sendMessageFunction;
}

/**
 * Обрабатывает ход игрока
 * 
 * @param number Загаданное пользователем число
 */
function turnHandler(number:any, playerMove:any, lostMoveX:any, newMoveX:any, lostMoveY:any, newMoveY:any) {
    sendMessage({
        type: 'playerRoll',
        number,
        playerMove,
        lostMoveX,
        newMoveX,
        lostMoveY,
        newMoveY,
    });
}

/**
 * Обрабатывает перезапуск игры
 */
function restartHandler(): void
{
	sendMessage( {
		type: 'repeatGame',
	} );
}

/**
 * Начинает игру
 */
function startGame(): void
{
	openScreen( 'game' );
}

/**
 * Меняет активного игрока
 * 
 * @param myTurn Ход текущего игрока?
 */
function changePlayer( myTurn: boolean, playerMove: any, lostMoveX: any, newMoveX: any, lostMoveY: any, newMoveY: any  ): void
{
	GameScreen.update( myTurn, playerMove, lostMoveX, newMoveX, lostMoveY, newMoveY);
}

/**
 * Завершает игру
 * 
 * @param result Результат игры
 */
function endGame( result: 'win' | 'loose' | 'abort' ): void
{
	ResultScreen.update( result );
	openScreen( 'result' );
}

export {
	startGame,
	changePlayer,
	endGame,
	setSendMessage,
};
