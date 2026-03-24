import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ScoreBridgeService } from '@gymnastics-manager/shared-util';

@Component({
  imports: [RouterModule,RouterOutlet],
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private bridge = inject(ScoreBridgeService);
    ngOnInit(): void {
          console.log('🌉 Scoreboard bridge active, polling localStorage...');

    // Small delay to let BroadcastChannel listener register first
    // setTimeout(() => this.bridge.requestSync(), 500);
  }
}
