import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from './db.service';
import { Game } from './schemas/game.schema';
import { CreateGameDTO } from './DTO/create-game.dto';
import { AddPlayerMessageDTO, GetGameMessageDTO } from './DTO/messages.dto';
import { generateBoard } from './game.utils';

@Injectable()
export class GameService {
  constructor(private dbService: DbService) {}

  onEvent(message: any): Promise<Game> {
    console.log('Received data', message);

    switch (message.type) {
      case 'NEW_GAME':
        return this.newGame();
      case 'GET_GAME':
        return this.getGame(new GetGameMessageDTO(message));
      case 'ADD_PLAYER':
        return this.addPlayer(new AddPlayerMessageDTO(message));
      default:
        throw new BadRequestException('Invalid message type');
    }
  }

  private newGame(): Promise<Game> {
    const gameToStart = new CreateGameDTO({
      state: 'NEW_GAME',
      gameId: uuidv4(),
      turn: 0,
      gameBoard: JSON.stringify(generateBoard(12, 12)),
      players: [],
    });
    return this.dbService.create(gameToStart);
  }

  private async getGame({ gameId }: GetGameMessageDTO): Promise<Game> {
    const foundGame = await this.dbService.getGame(gameId);
    if (!foundGame) {
      throw new BadRequestException(`Invalid ID ${gameId}`);
    }
    return foundGame;
  }

  private async addPlayer(message: AddPlayerMessageDTO): Promise<Game> {
    const theGame = await this.dbService.getGame(message.gameId);

    const [{ sessionId }] = theGame.players;
    const {
      player: { sessionId: newSessionId },
      gameId,
    } = message;

    if (!theGame) {
      throw new BadRequestException(`Invalid ID ${message.gameId}`);
    }

    if (theGame.players.length !== 0) {
      if (newSessionId === sessionId) {
        throw new BadRequestException(`Player already exist.`);
      }

      if (theGame.players.length > 1) {
        throw new BadRequestException(
          `Game ${gameId} already has enough players.`,
        );
      }
    }
    const updatedPlayers = theGame.players.concat(message.player);

    return this.dbService.updateGame(gameId, {
      players: updatedPlayers,
    });

    // return Promise.resolve<any>(null);
  }
}
