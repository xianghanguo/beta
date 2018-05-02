import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestsPage } from './requests';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from '../../pipes/pipe.module';

import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    RequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestsPage),
    TranslateModule.forChild(),
    IonicImageLoader,
    PipeModule
  ],
  
})
export class FindListPageModule {}
