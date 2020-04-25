import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { FlatGameLogItem } from './game/game-log-item.interface';

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

		this.connections.push(eventSource);
	}

	handleEvent(event: MessageEvent) {
		const eventData = JSON.parse(event.data);

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
