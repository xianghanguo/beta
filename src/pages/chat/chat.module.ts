import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from '../../pipes/pipe.module';
import { IonicImageLoader } from 'ionic-image-loader';
@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    TranslateModule.forChild(),
    IonicImageLoader,
    PipeModule
  ],
})
export class ChatPageModule {}
