import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController, ActionSheetController, Content, App } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { AuthProvider, TranslateProvider, LoadingProvider, ToastProvider, NotificationProvider, DataProvider, ImageProvider, AlertProvider } from '../../providers';

import { Camera } from '@ionic-native/camera';
import { Subscription } from 'rxjs/Subscription';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Keyboard } from '@ionic-native/keyboard';
import { ModalController } from 'ionic-angular';
import { GalleryModal } from 'ionic-gallery-modal';
import { AngularFireDatabase } from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  @ViewChild("content") contentHandle: Content;

  private contentBox;
  private tabBarHeight;
  private android: boolean;
  private profileForm: FormGroup;
  private user: any;
  private userId: string;
  private hasError: boolean;
  private hasPassword: boolean;
  private hasPushToken: boolean;
  private subscriptions: Subscription [];
  private uniqueUsername: boolean;
  private nameValidator: ValidatorFn = Validators.compose([
    Validators.required
  ]);
  private usernameValidator: ValidatorFn = Validators.compose([
    Validators.pattern('^([a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D\u3131-\uD79D]{3,10})*$'),
    Validators.required
  ]);
  private emailValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.email
  ]);
  private bioValidator: ValidatorFn = Validators.compose([
    Validators.required
  ]);
  private requiredValidator: ValidatorFn = Validators.compose([
    Validators.required
  ])

  constructor(private navCtrl: NavController,
    private app: App,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    private afDB:AngularFireDatabase,
    private alertProvider: AlertProvider,
    private imageProvider: ImageProvider,
    private translate: TranslateProvider,
    private dataProvider: DataProvider,
    private authProvider: AuthProvider,
    private loadingProvider: LoadingProvider,
    private toast: ToastProvider,
    private notification: NotificationProvider,
    private camera: Camera,
    private modalCtrl: ModalController,
    private keyboard: Keyboard) {
    this.profileForm = formBuilder.group({
     
      birth: ['', this.bioValidator],
      username: ['', this.usernameValidator],
      address: ['', this.requiredValidator],
      email: ['', this.emailValidator],
      bio: ['', this.bioValidator],
      gender: ['', this.requiredValidator]
    });
  }

  keyDownFunction(event) {
    // User pressed return on keypad, proceed with updating profile.
    if (event.keyCode == 13) {
     
      this.updateProfile();
    }
  }

  onInput(username: string) {
    // Check if the username entered on the form is still available.
    // this.uniqueUsername = true;
    // if (this.profileForm.controls.username.valid && !this.profileForm.controls.username.hasError('required')) {
    //   this.firestore.getUserByUsername('@' + username.toLowerCase()).then((user: User) => {
    //     if (user && (this.userId != user.userId)) {
    //       this.uniqueUsername = false;
    //     }
    //   }).catch(() => { });
    // }
  }

  
  openGalleryModal(photos){
    let modal = this.modalCtrl.create(GalleryModal, {
      photos: photos,
    });
    modal.present();
  }

  ionViewDidLoad() {
    this.contentBox = document.querySelector(".profile-content .scroll-content")['style'];
    this.tabBarHeight = this.contentBox.marginBottom;

    // this.platform.ready().then(() => {
    //   // Check if device is running on android and adjust the scss accordingly.
    //   if (this.device.platform == 'Android') {
    //     this.android = true;
    //   } else {
    //     this.android = false;
    //   }
    // }).catch(() => { });
    // Set placeholder photo, while the user data is loading.
    

    
      // Check if user is logged in using email and password and show the change password button.
      this.userId = this.afAuth.auth.currentUser.uid;
    
      // Get userData from Firestore and update the form accordingly.
      this.dataProvider.getUser(this.userId).valueChanges().subscribe(user => {
        
          this.user = user;
          this.hasPushToken = this.user.notifications;
          this.profileForm.setValue({
            username: this.user.username,
            birth: this.user.birth,
            gender: this.user.gender,
            address: this.user.address,
            email: this.user.email,
            bio: this.user.bio
          });
        });
  }

  ionViewDidEnter(){
    this.subscriptions = [];

    let subscription = this.keyboard.onKeyboardShow().subscribe(() => {
      
    document.querySelector(".tabbar")['style'].display = 'none';
    this.contentBox.marginBottom = 0;
    this.contentHandle.resize();
    })

    let subscription_ = this.keyboard.onKeyboardHide().subscribe(() => {
     
    document.querySelector(".tabbar")['style'].display = 'flex';
    this.contentBox.marginBottom = this.tabBarHeight;
    this.contentHandle.resize();
    })

    this.subscriptions.push(subscription);
    this.subscriptions.push(subscription_)
  }
 
  ionViewWillLeave() {
    
    // Unsubscribe to Subscription.
    if (this.subscriptions){
      
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        })
    }
      
    // Delete the photo uploaded from storage to preserve Firebase storage space since it's no longer going to be used.
    // if (this.auth.getUserData().photo != this.user.photo)
    //   this.storage.delete(this.user.userId, this.user.photo);
  }

  

  private setPhoto(photo): void {
    // Allow user to upload and set their profile photo using their camera or photo gallery.
    if (true) {
      this.actionSheetCtrl.create({
        title: this.translate.get('auth.profile.photo.title'),
        buttons: [
          {
            text: this.translate.get('auth.profile.photo.take'),
           
            handler: () => {
              this.openGalleryModal([{url: photo}]);
              
            }
          },
          {
            text: this.translate.get('auth.profile.photo.take'),
            role: 'destructive',
            handler: () => {
              let beforeImg = this.user.profileImg;
              this.imageProvider.setProfilePhoto(this.userId, this.camera.PictureSourceType.CAMERA).then((url: string) => {
                this.imageProvider.deleteImageFile(beforeImg);
                
              }).catch(()=> { });
            }
          },
          {
            text: this.translate.get('auth.profile.photo.gallery'),
            handler: () => {
              let beforeImg = this.user.profileImg;
              this.imageProvider.setProfilePhoto(this.userId, this.camera.PictureSourceType.PHOTOLIBRARY).then((url: string) => {
                this.imageProvider.deleteImageFile(beforeImg);
              }).catch(()=> { });
            }
          },
          {
            text: this.translate.get('auth.profile.photo.cancel'),
            role: 'cancel',
            handler: () => { }
          }
        ]
      }).present();
    }
  }

  private updateProfile(): void {
    // Check if profileForm is valid and username is unique and proceed with updating the profile.
    if (!this.profileForm.valid) {
      this.hasError = true;
    } else {
     
        this.loadingProvider.show();
       
        let username =  this.profileForm.value['username'];
        let bio = this.profileForm.value['bio'];
        let address = this.profileForm.value['address'];
        let birth = this.profileForm.value['birth'];
            
      
        this.dataProvider.getUser(this.userId).update({
          
        
          username: username,
          address: address,
          birth: birth,
          bio: bio,
          notifications: this.hasPushToken

        }).then(success => {
          // Formatting the first and last names to capitalized.
            // Initialize pushToken to receive push notifications if the user enabled them, otherwise clear pushToken.
            if (this.hasPushToken) {
              this.notification.init();
            } else {
              this.notification.destroy();
            }
            this.loadingProvider.hide();
            this.toast.show(this.translate.get('auth.profile.updated'));
          }).catch(() => { });
       
      }
    
  }

  logout(): void {
    this.alertProvider.showConfirm(this.translate.get('auth.menu.logout.title'), this.translate.get('auth.menu.logout.text'), this.translate.get('auth.menu.logout.button.cancel'), this.translate.get('auth.menu.logout.button.logout')).then(confirm => {
      if (confirm) {
        this.afDB.database.ref('/accounts/'+this.afAuth.auth.currentUser.uid).update({
          lastLogin: firebase.database['ServerValue'].TIMESTAMP
        })
        this.authProvider.logout().then(() => {
          this.notification.destroy();
          this.app.getRootNavs()[0].setRoot('LoginPage');
        }).catch(() => { });
      }
    }).catch(() => { });
  }
  
}
