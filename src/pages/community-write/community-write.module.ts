import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommunityWritePage } from './community-write';
import { ImageUploadModule } from "../../components/image-upload/image-upload.module";

@NgModule({
  declarations: [
    CommunityWritePage
  ],
  imports: [
    IonicPageModule.forChild(CommunityWritePage),
    ImageUploadModule,
  ],
})
export class BoardwritePageModule {}
