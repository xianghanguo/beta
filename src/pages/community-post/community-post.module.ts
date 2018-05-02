import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommunityPostPage } from './community-post';
import { PipeModule } from '../../pipes/pipe.module';
import { IonicImageLoader } from 'ionic-image-loader';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CommunityPostPage
    
  ],
  imports: [
    IonicPageModule.forChild(CommunityPostPage),
    PipeModule,
    TranslateModule.forChild(),
    IonicImageLoader
  ],
  exports: [
    CommunityPostPage
  ]
})
export class BoardviewPageModule {}
