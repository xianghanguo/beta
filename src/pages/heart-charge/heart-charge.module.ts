import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HeartChargePage } from './heart-charge';

@NgModule({
  declarations: [
    HeartChargePage,
  ],
  imports: [
    IonicPageModule.forChild(HeartChargePage),
  ],
})
export class HeartChargePageModule {}
