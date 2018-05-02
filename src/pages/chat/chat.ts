import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Content } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { AngularFireDatabase } from 'angularfire2/database';
import { RequestProvider, TranslateProvider, NotificationProvider } from '../../providers';
import { Camera } from '@ionic-native/camera';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs/Subscription';
import { Keyboard } from '@ionic-native/keyboard';

/**
 * Generated class for the ChatRoomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;
  @ViewChild('messageBox') messageBox: ElementRef;

  private subscriptions: Subscription[];

  private partnerId: any;
  private partner: any;
  private user: any;
  private title: any;
  
  private messages: any;
  private alert: any;
  private messagesToShow: number = 10;
  private startIndex: any = -1;
  private scrollDirection: any = 'bottom';
 
  private numOfMessages: number = 10;
  private updateDateTime: any;
  private conversationId: any;
  private conversation: any;
  private from: number;

  private message: string;
  private collapsed: string;
  private expanded: string;



  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public dataProvider: DataProvider,
    public requestProvider: RequestProvider,
    public translate: TranslateProvider,
    public afAuth: AngularFireAuth,
    public notification: NotificationProvider,
    public afDB: AngularFireDatabase,
    public camera: Camera,
    public keyboard: Keyboard
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    
    this.subscriptions = [];

    this.partnerId = this.navParams.get('userId');
    let subscription = this.dataProvider.getUser(this.partnerId).snapshotChanges().take(1).subscribe((user) => {
      this.partner = user;
      this.subscriptions.push(subscription);
    });

    let subscription_ = this.dataProvider.getUser(this.afAuth.auth.currentUser.uid).snapshotChanges().take(1).subscribe((user) => {
      this.user = user;
      let subscription = this.dataProvider.getUserConversation(this.user.key, this.partnerId).snapshotChanges().subscribe((userConversation) => {
        if (userConversation) {
          // User already have conversation with this friend, get conversation
          this.conversationId = userConversation.payload.val().conversationId;
    
          // Get conversation
          let subscription = this.dataProvider.getConversation(this.conversationId).valueChanges().subscribe((conversation) => {
            this.conversation = conversation
            if (this.conversation.messages) {
              this.from = this.conversation.messages.length - this.messagesToShow;
              if (this.from < 1) {
                this.from = 0;
              }
              this.scrollBottom();
              this.dataProvider.getUserConversation(this.user.key, this.partnerId).update({
                messagesRead: this.conversation.messages.length
              });
            } 
            this.subscriptions.push(subscription);
          });
          
        } else{
          this.conversationId = null;
        }
        this.subscriptions.push(subscription);
      });
      this.subscriptions.push(subscription_);
    });
    
   // Get conversationInfo with friend.
  

  // Update messages' date time elapsed every minute based on Moment.js.
  var that = this;
  if (!that.updateDateTime) {
    that.updateDateTime = setInterval(function() {
      if (that.conversation.messages) {
        that.conversation.messages.forEach((message) => {
          let date = message.date;
          message.date = new Date(date);
        });
      }
    }, 60000);
  }
}

  ionViewWillUnload() {
    
    // Clear subscriptions.f
    if (this.subscriptions) {
      for (let i = 0; i < this.subscriptions.length; i++) {
        this.subscriptions[i].unsubscribe();
      }
    }
  }


  send() {
    
    if (this.message && this.message.length > 0) {
      let text = this.message;
      this.message = '';
      // Collapse the expanded text area.
      // let element = this.messageBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
      // element.style.height = this.collapsed;
      // this.collapsed = null;
      // this.expanded = null;

      // User entered a text on messagebox
      if (this.conversationId) {
        // Add Message to the existing conversation
        // Clone an instance of messages object so it will not directly be updated.
        // The messages object should be updated by our observer declared on ionViewDidLoad.
        
        this.conversation.messages.push({
          date: new Date().toString(),
          sender: this.user.key,
          type: 'text',
          message: text
        });
        // Update conversation on database.
        this.requestProvider.getConversation(this.conversationId).update({
          messages: this.conversation.messages
        }).then((success) => {
          if (this.partner.payload.val().pushToken) {
            this.notification.sendPush(this.partner.payload.val().pushToken, this.user.payload.val().username , text, { partnerId: this.user.key });
          }
        });
        // Clear messagebox.
        
        
        
      } else {
       
      }
    }
   
  }

 

   // Check if the user is the sender of the message.
   isSender(message) {
    if (message.sender == this.user.key) {
      return true;
    } else {
      return false;
    }
  }
   // Scroll depending on the direction.
   doScroll() {
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }
// Scroll to bottom of the view.
  scrollBottom(): void {
  let self = this;
  setTimeout(function() {
    if(self.content._scroll) self.content.scrollToBottom();
  }, 300);
}


  // Scroll to top of the page after a short delay.
  scrollTop() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 300);
  }

  keyDownFunction(event) {
    //User pressed return on the keyboard, send the text message.
    if (event.keyCode == 13) {
      
      this.send();
    }
  }

  onRefresh(refresher) {
    //Load more messages depending on numOfMessages.
    if (this.messagesToShow + this.numOfMessages <= this.conversation.messages.length) {
      
      this.messagesToShow += this.numOfMessages;
      // Update the start index of the slice filter.
      this.from = this.conversation.messages.length - this.messagesToShow;
      if (this.from < 1) {
        this.from = 0;
      }
    } else {
     
      this.messagesToShow = this.conversation.messages.length;
      // Update the start index of the slice filter.
      this.from = this.conversation.messages.length - this.messagesToShow;
      if (this.from < 1) {
        this.from = 0;
      }
    }
    let self = this;
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }



  onBlur() {
    // Keeps track of the expanded state of the text area.
    let expanded = this.messageBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0].style.height;
    if (expanded != this.collapsed) {
      this.expanded = expanded;
    }
    if (!this.message) {
      // Collapsed the expanded text area since the message is cleared.
      let element = this.messageBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
      element.style.height = this.collapsed;
      this.collapsed = null;
      this.expanded = null;
    }
  }

  onFocus() {
    // Expand the text area depending on the length of the message.
    // If the text area is expanded when it lost focus, it will retain the expanded state when focused.
    let element = this.messageBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    if (this.expanded) {
      element.style.height = this.expanded;
    } else {
      if (!this.collapsed) {
        this.collapsed = this.messageBox['_elementRef'].nativeElement.getElementsByClassName("text-input")[0].style.height;
      }
      element.style.height = this.collapsed;
    }

    this.scrollBottom();
  }

  ionViewWillLeave() {
    //   페이지 나가면 쳐다보는거 그만해! DB에서도 빼!
    // this.afDB.list('/conversations/'+this.conversationId).remove();
    // this.afDB.list('/chat/'+firebase.auth().currentUser.uid+'/conversations/'+this.userId).remove();
  }

}
