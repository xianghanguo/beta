import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileCreatePage } from './profile-create';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfileCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileCreatePage),
    TranslateModule.forChild(),
    IonicImageLoader
  ],
})
export class ProfileCreatePageModule {}
