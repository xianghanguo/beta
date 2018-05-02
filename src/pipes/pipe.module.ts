import { NgModule } from '@angular/core';
import { ChatsPipe } from './chats'
import { UsersPipe } from './users'
import { DateFormatPipe } from './date';

@NgModule({
    declarations: [
        DateFormatPipe,
        ChatsPipe,
        UsersPipe
    ],
    imports: [

    ],
    exports: [
        DateFormatPipe,
        ChatsPipe,
        UsersPipe
    ]
    
})
export class PipeModule {}