import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FlatGameLogItem, GameLogItem } from './game/game.service';
import { Subject } from 'rxjs';

const firebaseUrl = environment.firebaseUrl;

@Injectable({
	providedIn: 'root',
})

export class LiveService {
	incomingMessage = new Subject<FlatGameLogItem>();
	connections: EventSource[] = [];

	openConnection(gameId: number) {
		const eventSource = new EventSource(`${firebaseUrl}/games/${gameId}/gameLog.json`);

		eventSource.addEventListener('put', this.handleEvent.bind(this));
		eventSource.addEventListener('patch', this.handleEvent.bind(this));

		eventSource.onmessage = (e) => {
			console.log('EventSource', e);
		};
		this.connections.push(eventSource);
	}

	handleEvent(event: MessageEvent) {
		const eventData = JSON.parse(event.data);
		console.log('EventSource', event.type, eventData);

		if (eventData.data	) {
			this.incomingMessage.next(eventData.data as FlatGameLogItem);
		}
	}

	closeAllConnections() {
		this.connections.forEach(stream => {
			stream.close();
		});
	}
}
