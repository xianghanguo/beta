import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContestApplyPage } from './contest-apply';
import { ImageUploadModule } from '../../components/image-upload/image-upload.module';



@NgModule({
  declarations: [
    ContestApplyPage,
  ],
  imports: [
    IonicPageModule.forChild(ContestApplyPage),
    ImageUploadModule
  ]
  
})
export class ContestApplyPageModule {}
