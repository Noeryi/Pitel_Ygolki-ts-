import WebSocket from 'ws';
import { onError } from './on-error.js';

import type {
	//AnyClientMessage,
	AnyServerMessage,
	//GameStartedMessage,
	GameAbortedMessage,
} from '../../common/messages.js';


let massivimg: any[] = [];
massivimg[0] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Ffree.png?v=1583175458724";
massivimg[1] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Fwhite.png?v=1583179638484";
massivimg[2] = "https://cdn.glitch.com/f8448435-13ae-4330-88b5-8937ac590d35%2Fdark.png?v=1583179645260";

/**
 * Класс игры
 * 
 * Запускает игровую сессию.
 */
class Game
{
	/**
	 * Количество игроков в сессии
	 */
	static readonly PLAYERS_IN_SESSION = 2;
	
	/**
	 * Игровая сессия
	 */
	private _session: WebSocket[];
	
	/**
	 * @param session Сессия игры, содержащая перечень соединений с игроками
	 */
	constructor( session: WebSocket[] )
	{
		this._session = session;
		
		this._sendStartMessage()
			.then(
				() =>
				{
					this._listenMessages();
				}
			)
			.catch( onError );
	}
	
	/**
	 * Уничтожает данные игровой сессии
	 */
	destroy(): void
	{
		// Можно вызвать только один раз
		this.destroy = () => {};
		
		for ( const player of this._session )
		{
			if (
				( player.readyState !== WebSocket.CLOSED )
				&& ( player.readyState !== WebSocket.CLOSING )
			)
			{
				const message: GameAbortedMessage = {
					type: 'gameAborted',
				};
				
				this._sendMessage( player, message )
					.catch( onError );
				player.close();
			}
		}
		
		// Обнуляем ссылки
		this._session = null as unknown as Game['_session'];
	}
	
	/**
	 * Отправляет сообщение о начале игры
	 */
	private _sendStartMessage(): Promise<void[]>
	{
		
		const data: any = {
			type: 'gameStarted',
			myTurn: true,
			playerMove: massivimg[1],
            lostMoveX: 0,
            newMoveX: 0,
            lostMoveY: 0,
            newMoveY: 0,
		};
		const promises: Promise<void>[] = [];
		
		for ( const player of this._session )
		{
			promises.push( this._sendMessage( player, data ) );
			data.myTurn = false;
		}
		
		return Promise.all( promises );
	}
	
	/**
	 * Отправляет сообщение игроку
	 * 
	 * @param player Игрок
	 * @param message Сообщение
	 */
	private _sendMessage( player: WebSocket, message: AnyServerMessage ): Promise<void>
	{
		return new Promise(
			( resolve, reject ) =>
			{
				player.send(
					JSON.stringify( message ),
					( error ) =>
					{
						if ( error )
						{
							reject();
							
							return;
						}
						
						resolve();
					}
				)
			},
		);
	}
	
	/**
	 * Добавляет слушателя сообщений от игроков
	 */
	private _listenMessages(): void
	{
		for ( const player of this._session )
		{
			player.on(
				'message',
				( data ) =>
				{
					const message = this._parseMessage( data );
					
					this._processMessage( player, message );
				},
			);
			
			player.on( 'close', () => this.destroy() );
		}
	}
	
	/**
	 * Разбирает полученное сообщение
	 * 
	 * @param data Полученное сообщение
	 */
	private _parseMessage( data: unknown ): any
	{
		if ( typeof data !== 'string' )
		{
			return {
				type: 'incorrectRequest',
				message: 'Wrong data type',
			};
		}
		
		try
		{
			return JSON.parse( data );
		}
		catch ( error )
		{
			return {
				type: 'incorrectRequest',
				message: 'Can\'t parse JSON data: ' + error,
			};
		}
	}
	
	/**
	 * Выполняет действие, соответствующее полученному сообщению
	 * 
	 * @param player Игрок, от которого поступило сообщение
	 * @param message Сообщение
	 */
	private _processMessage( player: WebSocket, message: any ): void
	{
		switch ( message.type )
		{
			case 'playerRoll':
				this._onPlayerRoll( player, message.number, message.playerMove, message.lostMoveX, message.newMoveX, message.lostMoveY, message.newMoveY, );
				break;
			
			case 'repeatGame':
				this._sendStartMessage()
					.catch( onError );
				break;
			
			case 'incorrectRequest':
				this._sendMessage( player, message )
					.catch( onError );
				break;
			
			case 'incorrectResponse':
				console.error( 'Incorrect response: ', message.message );
				break;
			
			default:
				this._sendMessage(
					player,
					{
						type: 'incorrectRequest',
						message: `Unknown message type: "${(message as any).type}"`,
					},
				)
					.catch( onError );
				break;
		}
	}
	
	/**
	 * Обрабатывает ход игрока
	 * 
	 * @param currentPlayer Игрок, от которого поступило сообщение
	 * @param currentPlayerNumber Число, загаданное игроком
	 */
	private _onPlayerRoll( currentPlayer: WebSocket, currentPlayerNumber: any, playerMove: any, lostMoveX: any, newMoveX: any, lostMoveY: any, newMoveY: any): void
	{
		
		let maxNumber: any = currentPlayerNumber;
		let colorMove: any = playerMove;
        let x1: any = lostMoveX;
        let x2: any = newMoveX;
        let y1: any = lostMoveY;
        let y2: any = newMoveY;
		
		if (maxNumber === 100) {
			for ( const player of this._session )
			{
				this._sendMessage(
					player,
					{
						type: 'gameResult',
						win: ( player === currentPlayer ),
					},
				)
					.catch( onError );
			}
		} else {
		for ( const player of this._session )
			{
				
				if ( player != currentPlayer )
				{
					this._sendMessage(
						player,
						{
							type: 'changePlayer',
							myTurn: true,
							playerMove: colorMove,
                            lostMoveX: x1,
                            newMoveX: x2,
                            lostMoveY: y1,
                            newMoveY: y2,
						},
					)
						.catch( onError );
					this._sendMessage(
						currentPlayer,
						{
							type: 'changePlayer',
							myTurn: false,
							playerMove: colorMove,
                            lostMoveX: x1,
                            newMoveX: x2,
                            lostMoveY: y1,
                            newMoveY: y2,
						},
					)
						.catch( onError );

				}
			}
		}
	}
}

export {
	Game,
};
