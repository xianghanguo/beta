import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContestProfilePage } from './contest-profile';

@NgModule({
  declarations: [
    ContestProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ContestProfilePage),
  ],
})
export class ContestProfilePageModule {}
