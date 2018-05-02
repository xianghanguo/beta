import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommunityPage } from './community';
import { PipeModule } from '../../pipes/pipe.module';
@NgModule({
  declarations: [
    CommunityPage,
  ],
  imports: [
    IonicPageModule.forChild(CommunityPage),
    PipeModule
  ],
})
export class CommunityPageModule {}
