import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageUpload } from './image-upload';

@NgModule({
  declarations: [
    ImageUpload,
  ],
  imports: [
    IonicPageModule.forChild(ImageUpload),
  ],
  exports: [
    ImageUpload
  ]
})
export class ImageUploadModule {}
