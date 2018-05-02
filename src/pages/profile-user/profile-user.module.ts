import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileUserPage } from './profile-user';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfileUserPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileUserPage),
    TranslateModule.forChild(),
    IonicImageLoader
  ],
})
export class ProfileUserPageModule {}
