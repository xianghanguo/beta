import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginViewPage } from './login-view';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LoginViewPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginViewPage),
    TranslateModule.forChild()
  ],
})
export class LoginViewPageModule {}
