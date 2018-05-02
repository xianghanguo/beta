import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Loading, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { AuthProvider, LoadingProvider, NotificationProvider, TranslateProvider, DataProvider, RequestProvider } from '../../providers';
import firebase from 'firebase';
import { GalleryModal } from 'ionic-gallery-modal';

/**
 * Generated class for the ProfileUserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile-user',
  templateUrl: 'profile-user.html',
})
export class ProfileUserPage {
  private user: any;
  private currentUser: any;
  private currentUserId: any;
  private subscriptions: Subscription[];
  private contacts: any[];
  private userId: string;
  private from: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public authProvider: AuthProvider,
              public loadingProvider: LoadingProvider,
              public dataProvider: DataProvider,
              public requestProvider: RequestProvider,
              public translate: TranslateProvider,
              public notificationProvider: NotificationProvider,
              public modalCtrl: ModalController
            
            ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileUserPage');
    this.subscriptions = [];
    this.from = this.navParams.get('from');
    this.currentUserId = firebase.auth().currentUser.uid;
    if(!this.userId){
      this.userId = this.navParams.get('userId');
    }

    this.loadingProvider.show();
    let subscription = this.dataProvider.getCurrentUser().valueChanges().subscribe((user:any) => {
      this.currentUser = user;
      this.subscriptions.push(subscription);
    });

    let subscription_ = this.dataProvider.getUser(this.userId).valueChanges().subscribe((user:any)=> {
      this.user = user;
      
    })
    this.loadingProvider.hide();
  }

  openGalleryModal(user){
    let photo = [{url: user.profileImg}]

    let modal = this.modalCtrl.create(GalleryModal, {
      photos: photo,
    });
    modal.present();
  }

  setUser(userId: string): void {
    this.userId = userId;
    this.contacts = [];
    this.ionViewDidLoad();
  }

  getRequestStatus(user: any): number {
    //0 -> Can be requested | 1 -> Request is pending | 2 -> Sent a contact request | 3 -> Is a contact | -1 -> User is the currentUser
    if (this.currentUser) {
      if (this.currentUser.friends && this.currentUser.friends.indexOf(this.userId) > -1) {
        return 3;
      } else {
        if (user.requestsReceived && user.requestsReceived.indexOf(this.currentUserId) > -1) {
          return 1;
        } else if (user.requestsSent && user.requestsSent.indexOf(this.currentUserId) > -1) {
          return 2;
        } else if (this.userId == this.currentUserId) {
          return -1;
        } else {
          return 0;
        }
      }
    }
    return 0;
  }


  sendRequest(user: any): void {
    this.loadingProvider.show();
    this.requestProvider.sendFriendRequest(this.currentUserId, this.userId).then(() => {
      // Send a push notification to the user.
      if (user.notifications) {
        this.notificationProvider.sendPush(user.pushToken, this.currentUser.username, this.translate.get('push.contact.sent'), { newRequest: true });
      }
      this.loadingProvider.hide();
    }).catch(() => {
      this.loadingProvider.hide();
    });
  }

  cancelRequest(userId: string): void {
   
    this.requestProvider.cancelFriendRequest(this.currentUserId, this.userId);
      
   
  }

  rejectRequest(userId: string): void {
    
    this.requestProvider.cancelFriendRequest(this.userId, this.currentUserId);
  }


  acceptRequest(user: any): void {
    this.loadingProvider.show();
    this.requestProvider.acceptFriendRequest(this.userId, this.currentUserId).then(() => {
      // Send a push notification to the user.
      if (user.notifications) {
        this.notificationProvider.sendPush(user.pushToken, this.currentUser.username, this.translate.get('push.contact.accepted'), { acceptRequest: true });
      }
      this.loadingProvider.hide();
    }).catch(() => {
      this.loadingProvider.hide();
    });
  }



}
