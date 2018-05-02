import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, Platform } from 'ionic-angular';
import { AuthProvider, TranslateProvider, DataProvider } from '../../providers';
import { Subscription } from 'rxjs/Subscription';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';




@IonicPage()
@Component({
  selector: 'page-chat-list',
  templateUrl: 'chat-list.html',
})
export class ChatListPage {

  private subscriptions: Subscription[];
  private conversations: any[];
  //private searchUser: string;
  //private user;
  private userConversations: Map<string, any>;
  private partners: Map<string, any>;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private dataProvider: DataProvider,
    private translate: TranslateProvider,
    private modalCtrl: ModalController,
    private app: App
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatListPage');


    this.subscriptions = [];
    this.userConversations = new Map<string, any>();
    this.partners = new Map<string, any>();
    let subscription = this.dataProvider.getConversations().snapshotChanges().subscribe(conversations => {
      conversations.forEach(conversation => {
        let partnerId = conversation.key;
        
        let conversationId = conversation.payload.val().conversationId;
        let subscription = this.dataProvider.getUserConversation(this.afAuth.auth.currentUser.uid, partnerId).snapshotChanges().subscribe(userConversation => {
         
          this.userConversations.set(conversationId, userConversation.payload.val());
        })
        this.subscriptions.push(subscription);

        let subscription_ = this.dataProvider.getConversation(conversationId).valueChanges().subscribe((conversation : any) => {
          
          if(conversation){
            if(conversation.users.indexOf(this.afAuth.auth.currentUser.uid) > -1){
              this.addOrUpdateConversation(conversation);
             
            }else {
              this.deleteConversationById(conversationId);
              this.userConversations.delete(conversationId);
              if(this.conversations && this.conversations.length == 0) this.conversations = null;
            }
          }else{
            this.deleteConversationById(conversationId);
            this.userConversations.delete(conversationId);
            if(this.conversations && this.conversations.length == 0) this.conversations = null;
          }
         
          this.subscriptions.push(subscription_);
        });

        let subscription__ = this.dataProvider.getUser(partnerId).snapshotChanges().subscribe(user => {
          this.partners.set(conversationId, user);
          
          this.subscriptions.push(subscription__);
        })
      });
    })
    this.subscriptions.push(subscription);
  }

  ionViewWillUnload() {
    // Clear the subscriptions.
    if (this.subscriptions) {
      for (let i = 0; i < this.subscriptions.length; i++) {
        this.subscriptions[i].unsubscribe();
      }
    }
  }


  addOrUpdateConversation(conversation): void {
    
    if (this.conversations) {
      let index = -1;
      for (let i = 0; i < this.conversations.length; i++) {
        if (conversation.conversationId == this.conversations[i].conversationId) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations[index] = conversation;
      }
      else {
        this.conversations.push(conversation);
      }
    } else {
      this.conversations = [conversation];
    }
  }

  deleteConversationById(conversationId): void {
    if (this.conversations) {
      let index = -1;
      for (let i = 0; i < this.conversations.length; i++) {
        if (conversationId == this.conversations[i].conversationId) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations.splice(index, 1);
      }
    }
  }

  // Get the last message given the messages list.
  getLastMessage(messages): string {
    
    let message = messages[messages.length - 1];
    // Photo Message
    if (message.type == 1) {
      if (message.sender == this.afAuth.auth.currentUser.uid) {
        return this.translate.get('chats.message.sent.photo');
      } else {
        return this.translate.get('chats.message.received.photo');
      }
    } else {
      // Text Message
      if (message.sender == this.afAuth.auth.currentUser.uid) {
        return this.translate.get('chats.message.you') + message.message;
      } else if(message.type == 'notice_start') {
        return '채팅이 시작되었습니다.';
      } else if(message.type == 'notice_userOut') {
        return '대화가 종료되었습니다.'
      } else{
        return message.message;
      }
    }
  }

   // Get the last date of the message given the messages list.
  getLastMessageDate(messages): Date {
    let message = messages[messages.length - 1];
    return message.date;
  }

  // Get the number of unread messages given the conversationId, and messages list.
  getUnreadMessages(conversationId: string, messages): number {
   
    if (!this.userConversations.get(conversationId))
      return null;
    else {
      let unread = messages.length - this.userConversations.get(conversationId).messagesRead;
      
      if (unread > 0) {
        return unread;
      } else {
        return null;
      }
    }
  }


  // Open the chat with the user given the conversationId.
  chat(conversationId: string): void {
    if (true){
      let modalCtrl = this.modalCtrl.create('ChatPage', { userId: this.partners.get(conversationId).key });

      modalCtrl.present();
    }

  }

  delete(conversation){
    
    let conversationId = conversation.conversationId;
    let partner = this.partners.get(conversationId);
    let users = conversation.users;
    let messages = conversation.messages;
    let uid = this.afAuth.auth.currentUser.uid;


  

    this.afDB.object('/accounts/' + uid + '/conversations/' + partner.key).remove().then(success => {
      
     
      
      if(users.length == 2) {
        messages.push({
          date: new Date().toString(),
          sender: 'tianya',
          type: 'notice_userOut',
          message: 'user_out'
        });
          
        users.splice(users.indexOf(uid), 1);

        this.dataProvider.getConversation(conversationId).update({
          messages: messages,
          users: users
        })
      }
      else{
        this.dataProvider.getConversation(conversationId).remove()
        .then(() => {

          this.dataProvider.getUserFriends(uid).valueChanges().take(1).subscribe( friends => {
            friends.splice(friends.indexOf(partner.key),1);
            
            this.dataProvider.getCurrentUser().update({
              friends: friends
            })
          });
  
          this.dataProvider.getUserFriends(partner.key).valueChanges().take(1).subscribe( friends => {
            friends.splice(friends.indexOf(uid),1);
            
            this.dataProvider.getUser(partner.key).update({
               
              friends: friends
            });
          });
        })
      }

    })
    

    
  }




}
