import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { DataProvider, RequestProvider, NotificationProvider } from '../../providers';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-requests',
  templateUrl: 'requests.html',
})
export class RequestsPage {
  chatId;
  user;
  myChat: any;
  myChatList: any;
  chatList= [];
  users = [];
  requestsReceived: any;
  requestsSent: any;
  alert: any;
  friends: any;
  private updateRef: any;
  private usersToShow: number = 10;
  private subscriptions: Subscription [];
  private excludedIds = [];
  
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController, 
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public dataProvider: DataProvider,
    public notificationProvider: NotificationProvider,
    public translate: TranslateService,
    public requestProvider: RequestProvider
  ) {
  }
  
  

  ionViewWillEnter(){
   
    this.updateLogin();
    this.updateRef = setInterval(() => {
      this.updateLogin();

    }, 60000);



  }

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad ChatListPage');
    //this.chatId = this.navParams.get('chatId');

    this.subscriptions = [];
    let subscription = this.dataProvider.getLatestUsers().snapshotChanges().take(1).subscribe(users => {
      this.users = users.reverse();
      this.subscriptions.push(subscription);
    });


    let subscription_ = this.dataProvider.getUser(this.afAuth.auth.currentUser.uid).snapshotChanges().subscribe(user => {
      this.user = user;
      this.excludedIds = [this.user.key];
      
      if(this.user.payload.val().friends){
        this.user.payload.val().friends.forEach(friend => {
          this.excludedIds.push(friend);
        })
      }

      if(this.user.payload.val().requestsReceived){
        this.user.payload.val().requestsReceived.forEach(request => {
          
          let subscription = this.dataProvider.getUser(request).snapshotChanges().take(1).subscribe(user => {
            if (this.user.payload.val().requestsReceived && this.user.payload.val().requestsReceived.indexOf(user.key) > -1) {
              this.addOrUpdateReceived(user);
              
              this.excludedIds.push(request);
              this.subscriptions.push(subscription);
            }
          })
        })
      }
      else this.requestsReceived = [];
      this.subscriptions.push(subscription_);
    });
    
   
 
  }



  ionViewWillLeave(){
    // if (this.subscriptions) {
    //   for (let i = 0; i < this.subscriptions.length; i++) {
    //     this.subscriptions[i].unsubscribe();
    //   }
    // }
    clearInterval(this.updateRef);
  }


  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      this.ionViewDidLoad();
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }



     
   // Called when infinite scroll is triggered.
   doInfinite(): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Show 10 more users on the list.
        this.usersToShow += 10;
        resolve();
      }, 500);
    })
  }

  

  addOrUpdateReceived(sender) {
  if (!this.requestsReceived) {
    this.requestsReceived = [sender];
  } else {
    var index = -1;
    for (var i = 0; i < this.requestsReceived.length; i++) {
      if (this.requestsReceived[i].key == sender.key) {
        index = i;
      }
    }
    if (index > -1) {
      
        this.requestsReceived[index] = sender;
    } else {
      
        this.requestsReceived.push(sender);
    }
  }
}

// Add or update requests sent only if the user is not yet a friend.
addOrUpdateSent(receiver) {
  if (!this.requestsSent) {
    this.requestsSent = [receiver];
  } else {
    var index = -1;
    for (var i = 0; i < this.requestsSent.length; i++) {
      if (this.requestsSent[i].key == receiver.key) {
        index = i;
      }
    }
    if (index > -1) {
      
        this.requestsSent[index] = receiver;
    } else {
      
        this.requestsSent.push(receiver);
    }
  }
}

addOrUpdateFriend(friend) {
  if (!this.myChatList) {
    this.myChatList = [friend];
  } else {
    var index = -1;
    for (var i = 0; i < this.myChatList.length; i++) {
      if (this.myChatList[i].$key == friend.$key) {
        index = i;
      }
    }
    if (index > -1) {
      this.myChatList[index] = friend;
    } else {
      this.myChatList.push(friend);
    }
  }
}

presentAlert(req, user) {
  /* 쪽지 전송 시작 req=0 */
  if(req==0){
    let alert = this.alertCtrl.create({
      title: '쪽지 전송',
      subTitle: '상대방에게 쪽지를 전송합니다. 전송 시 90p가 차감됩니다. (최대 100자)',
      inputs: [
        {
          name: 'msg',
          placeholder: '전송할 내용을 작성하세요.',
          type: 'text',
        }
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '전송',
          handler: data => {
            
          }
        }
      ]
    });
    alert.present();
  }
  /* 쪽지 전송 끝 req=0 */
  /* 대화 요청 시작 req=1 */
  if(req==1){
    let alert = this.alertCtrl.create({
      title: '대화 참가',
      subTitle: '상대방에게 대화를 신청합니다',
      buttons: [
        {
          text:'취소',
          role:'cancel',
          handler:() => {
            console.log('Cancel clicked');
          }
        },
        {
          text:'신청',
          handler:() => {
            this.requestProvider.sendFriendRequest(this.user.key, user.key).then(() => {
              if(user.payload.val().notifications){
                
                var text;
                this.translate.get('push.requests.sent').subscribe(res => {
                  text = res;
                } );
                this.notificationProvider.sendPush(user.payload.val().pushToken, this.user.payload.val().username, text , {newRequest: true});
              }
            })
            // this.afDB.object('/chat/'+ chatId + '/request').update({})
            // this.navCtrl.push('ChatRoomPage',{chatId: this.chatId, user:this.user});
          }
        }
      ]
    });
    alert.present();
  }
  /* 대화 요청 끝 req=1 */
}

// Accept Friend Request.
acceptFriendRequest(user) {
  this.alert = this.alertCtrl.create({
    
    title: 'Confirm Friend Request',
    message: 'Do you want to accept <b>' + user.payload.val().username + '</b> as your friend?',
    buttons: [
      {
        text: 'Cancel',
        handler: data => { }
      },
      {
        text: 'Reject Request',
        handler: () => {
          this.requestProvider.cancelFriendRequest(user.key, this.user.key);
          this.requestsReceived.splice( this.requestsReceived.indexOf(user), 1)
        }
      },
      {
        text: 'Accept Request',
        handler: () => {
          this.requestProvider.acceptFriendRequest(user.key, this.user.key);
          this.requestsReceived.splice( this.requestsReceived.indexOf(user), 1)

           // New Conversation with friend.
        var messages = [];
        messages.push({
          date: new Date().toString(),
          sender: 'tianya',
          type: 'notice_start',
          message: 'chat_start'
        });
        var users = [];
        users.push(this.user.key);
        users.push(user.key);
        // Add conversation.
        this.afDB.list('conversations').push({
          dateCreated: new Date().toString(),
          messages: messages,
          users: users
        }).then((success) => {
          let conversationId = success.key;
          this.afDB.object('/conversations/' + conversationId).update({
            conversationId: conversationId
          })
          // Add conversation reference to the users.
          this.afDB.object('/accounts/' + this.user.key + '/conversations/' + user.key).update({
            conversationId: conversationId,
            messagesRead: 0
          });
          this.afDB.object('/accounts/' + user.key + '/conversations/' + this.user.key).update({
            conversationId: conversationId,
            messagesRead: 0
          });

          if(user.payload.val().notifications){
            var text;
            this.translate.get('push.requests.accept').subscribe(res => {
              text = res;
            } );
            this.notificationProvider.sendPush(user.payload.val().pushToken, this.user.payload.val().username, text , {acceptRequest: true});
          }
        });

        }
      }
    ]
  }).present();
}

// Cancel Friend Request sent.
cancelFriendRequest(user) {
  this.alert = this.alertCtrl.create({
    title: 'Friend Request Pending',
    message: 'Do you want to delete your friend request to <b>' + user.payload.val().username + '</b>?',
    buttons: [
      {
        text: 'Cancel',
        handler: data => { }
      },
      {
        text: 'Delete',
        handler: () => {
          this.requestProvider.cancelFriendRequest(this.user.key, user.key);
        }
      }
    ]
  }).present();
}


isFriends(userId) {
  
  if (this.myChat.friends) {
    if (this.myChat.friends.indexOf(userId) == -1) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

message(user) {
  this.modalCtrl.create('ChatRoomPage', {userId: user.$key}).present();
  
}

openUserProfile(user){
  let modal = this.modalCtrl.create('ProfileUserPage', {userId: user.key, from: 1})
  modal.present();
}


updateLogin(){
  let ref = this.afDB.object('/accounts/' + this.afAuth.auth.currentUser.uid);
  ref.update({
    lastLogin: firebase.database['ServerValue'].TIMESTAMP
  });
}

private getRequestStatus(target): number {
  //0 -> Can be requested | 1 -> Request is pending | 2 -> Sent a contact request
  if (target) {
    if (this.user.payload.val().requestsSent && this.user.payload.val().requestsSent.indexOf(target.key) > -1) {
      return 1;
    } else if (this.user.payload.val().requestsReceived && this.user.payload.val().requestsReceived.indexOf(target.key) > -1) {
      return 2;
    } else {
      return 0;
    }
  }
  return 0;
}

}
