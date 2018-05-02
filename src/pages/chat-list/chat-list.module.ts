import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatListPage } from './chat-list';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from '../../pipes/pipe.module';

@NgModule({
  declarations: [
    ChatListPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatListPage),
    TranslateModule.forChild(),
    PipeModule
  ],
})
export class ChatListPageModule {}
