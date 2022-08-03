import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { MainMenuComponent } from './pages/main-menu/main-menu.component';

const routes: Routes = [
  {path: 'main', component: MainMenuComponent},
  {path: 'game', component: GameComponent},
  {path: '**', redirectTo: 'main'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
