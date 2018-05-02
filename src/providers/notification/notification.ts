import { Injectable } from '@angular/core';
import { Platform, App, ModalController } from 'ionic-angular';
import { FCM } from '@ionic-native/fcm';
import { DataProvider } from '../';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Headers, RequestOptions } from '@angular/http';
import { Environment } from '../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';

@Injectable()
export class NotificationProvider {
  private subscriptions: Subscription[];
  private app: App;
  constructor(private platform: Platform,
    private fcm: FCM,
    private dataProvider: DataProvider,
    private modalCtrl: ModalController,
    
    private http: HttpClient) { }

  // Called after user is logged in to set the pushToken on Firestore.
  public init(): void {
    if (this.platform.is('cordova')) {
      if (this.subscriptions) {
        for (let i = 0; i < this.subscriptions.length; i++) {
          this.subscriptions[i].unsubscribe();
        }
      } else {
        this.subscriptions = [];
      }
      
      this.fcm.getToken().then((token: string) => {
        this.dataProvider.setPushToken(firebase.auth().currentUser.uid, token);

        let sub = this.fcm.onTokenRefresh().subscribe((token: string) => {
          this.dataProvider.setPushToken(firebase.auth().currentUser.uid, token);
        });
        this.subscriptions.push(sub);
        // Deeplink when push notification is tapped.
        let subscription = this.fcm.onNotification().subscribe(data => {
          if (data.wasTapped) {
            // Notification was received when app is minimized and tapped by the user.
            if (data.partnerId) {
              // Open the conversation
              this.app.getActiveNavs()[0].popToRoot().then(() => {
                this.app.getActiveNavs()[0].parent.select(2);
                let modalCtrl = this.modalCtrl.create('ChatPage', { userId: data.partnerId });
                modalCtrl.present();
              });
            }
            if (data.groupId) {
              // Open the group conversation
              this.app.getRootNavs()[0].popToRoot().then(() => {
                this.app.getActiveNavs()[0].parent.select(1);
                this.app.getRootNavs()[0].push('GroupPage', { groupId: data.groupId });
              });
            }
            if (data.newContact) {
              // View user contacts
              this.app.getRootNavs()[0].popToRoot().then(() => {
                this.app.getActiveNavs()[0].parent.select(2);
              });
            }
            if (data.newRequest) {
              // View pending user requests
              this.app.getRootNavs()[0].popToRoot().then(() => {
                this.app.getActiveNavs()[0].parent.select(1);
                
              });
            }
            if (data.acceptRequest) {
              // View pending user requests
              this.app.getRootNavs()[0].popToRoot().then(() => {
                this.app.getActiveNavs()[0].parent.select(2);
                
              });
            }

          } else {
            //Notification was received while the app is opened or in foreground. In case the user needs to be notified.
          }
        });
        this.subscriptions.push(subscription);
      }).catch(err => {
        console.log('Error Saving Token: ', JSON.stringify(err));
      });
    } else {
      console.error('Cordova not found. Please deploy on actual device or simulator.');
    }
  }

  // Called when the user logged out to clear the pushToken on Firestore.
  public destroy(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        this.dataProvider.removePushToken(firebase.auth().currentUser.uid);
        resolve();
      } else {
        reject();
      }
    });
  }

  // Send a push notification given the pushToken, title, data, and the message.
  public sendPush(pushToken: string, title: string, message: string, data: {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let postParams = {
        'notification': {
          'title': title,
          'body': message,
          'sound': 'default',
          'click_action': 'FCM_PLUGIN_ACTIVITY',
          'icon': 'fcm_push_icon'
        },
        'data': data,
        'to': pushToken,
        'priority': 'high',
        'restricted_package_name': ''
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'key=' + Environment.gcmKey
      });
      let options = { headers: headers };

      this.http.post('https://fcm.googleapis.com/fcm/send', postParams, options).subscribe(response => {
        resolve(response);
      }, err => {
        reject(err);
      });
    });
  }

  // Set the app to have access to navigation views for Push Notifications Deeplink.
  public setApp(app: App): void {
    this.app = app;
  }
}
