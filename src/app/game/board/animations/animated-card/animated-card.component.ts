import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { AnimatedCard } from '../animations.component';

@Component({
	selector: 'app-animated-card',
	templateUrl: './animated-card.component.html',
	styleUrls: ['./animated-card.component.css'],
	animations: [
		trigger('cardAnimation', [
			state('initial', style({
				transform: 'translateX(0) translateY(0) scale(0.4)',
				opacity: '.5'
			})),
			state('topLeft', style({
				transform: 'translateX(-300px) translateY(-250px) scale(0.4) rotate(180deg)',
				opacity: 0
			})),
			state('topRight', style({
				transform: 'translateX(300px) translateY(-250px) scale(0.4) rotate(180deg)',
				opacity: 0
			})),
			state('bottomLeft', style({
				transform: 'translateX(-300px) translateY(250px) scale(0.4) rotate(180deg)',
				opacity: 0
			})),
			state('bottomRight', style({
				transform: 'translateX(300px) translateY(250px) scale(0.4) rotate(180deg)',
				opacity: 0
			})),
			state('play', style({
				transform: 'translateX(47px) translateY(-1px) scale(0.4)',
				opacity: 1
			})),
			state('discard', style({
				transform: 'translateX(47px) translateY(-1px) scale(0.4)',
				opacity: 1
			})),
			transition('* <=> play', [
				animate('.5s ease-out', style({
					transform: 'scale(0.9) rotate(0deg)',
					opacity: 1
				})),
				animate('.25s 2s')
			]),
			transition('* <=> discard', [
				animate('.5s ease-out'),
			])
		])
	]
})
export class AnimatedCardComponent implements OnInit {
	cardState: string;
	@Input() animatedCard: AnimatedCard;
	@Output() done = new EventEmitter<void>();

	constructor() { }

	ngOnInit(): void {
		this.cardState = this.animatedCard.startPosition || 'initial';
		setTimeout(() => {
			this.cardState = this.animatedCard.endPosition || 'discard';
		}, 0);
	}

	onDone(event: AnimationEvent) {
		// console.log('Done Fired...?', this.cardState, event);
		if (event.fromState !== 'void') {
			this.done.emit();
		}
	}
}
