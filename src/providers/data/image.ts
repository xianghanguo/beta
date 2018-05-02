import { Injectable } from '@angular/core';
import { AlertProvider } from '../alert/alert';
import { LoadingProvider } from '../';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class ImageProvider {
  // Image Provider
  // This is the provider class for most of the image processing including uploading images to Firebase.
  // Take note that the default function here uploads the file in .jpg. If you plan to use other encoding types, make sure to
  // set the encodingType before uploading the image on Firebase.
  // Example for .png:
  // data:image/jpeg;base64 -> data:image/png;base64
  // generateFilename to return .png
  private profilePhotoOptions: CameraOptions;
  private photoMessageOptions: CameraOptions;
  private groupPhotoOptions: CameraOptions;
  // All files to be uploaded on Firebase must have DATA_URL as the destination type.
  // This will return the imageURI which can then be processed and uploaded to Firebase.
  // For the list of cameraOptions, please refer to: https://github.com/apache/cordova-plugin-camera#module_camera.CameraOptions
  constructor(public angularfireDatabase: AngularFireDatabase, public alertProvider: AlertProvider, public loadingProvider: LoadingProvider, public camera: Camera) {
    console.log("Initializing Image Provider");
    this.profilePhotoOptions = {
      quality: 50,
      targetWidth: 384,
      targetHeight: 384,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      allowEdit: true
    };

    this.photoMessageOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };

    this.groupPhotoOptions = {
      quality: 50,
      targetWidth: 384,
      targetHeight: 384,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };
  }

  // Function to convert dataURI to Blob needed by Firebase
  imgURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: mimeString
    });
  }

  // Generate a random filename of length for the image to be uploaded
  generateFilename() {
    var length = 8;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + ".jpg";
  }

  // Set ProfilePhoto given the user and the cameraSourceType.
  // This function processes the imageURI returned and uploads the file on Firebase,
  // Finally the user data on the database is updated.
  setProfilePhoto(userId, sourceType): Promise<any> {
    this.profilePhotoOptions.sourceType = sourceType;
    return new Promise((resolve, reject) => {
      this.camera.getPicture(this.profilePhotoOptions).then((imageData) => {
        this.loadingProvider.show();
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // Generate filename and upload to Firebase Storage.
       
        firebase.storage().ref().child('images/' + userId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          // Delete previous profile photo on Storage if it exists.
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
              // Update User Data on Database.
              this.angularfireDatabase.object('/accounts/' + userId).update({
                profileImg: url
              }).then((success) => {
                
                this.loadingProvider.hide();
                resolve(url);
              }).catch((error) => {
                this.loadingProvider.hide();
                reject();
              });
            })
            .catch((error) => {
              this.loadingProvider.hide();
              reject();
            });
        }).catch((error) => {
          this.loadingProvider.hide();
          reject();
        });
    })
  }

  uploadProfilePhoto(userId, sourceType): Promise<any> {
    this.profilePhotoOptions.sourceType = sourceType;
    return new Promise((resolve, reject) => {
      //this.photoMessageOptions.sourceType = sourceType;
     
      // Get picture from camera or gallery.
      this.camera.getPicture(this.profilePhotoOptions).then((imageData) => {
        this.loadingProvider.show();
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        firebase.storage().ref().child('images/' + userId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          // Delete previous profile photo on Storage if it exists.
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((err) => {
          console.log("ERROR STORAGE: " + JSON.stringify(err));
          this.loadingProvider.hide();  
          reject();
          // this.toast.show(this.translate.get('storage.upload.error'));
        });

       }).catch(err => {
        console.log("ERROR CAMERA: " + JSON.stringify(err));
        reject();
        // this.toast.show(this.translate.get('storage.upload.error'));
       });
      })
    }



  

  // Upload and set the group object's image.
  setGroupPhoto(group, sourceType) {
    this.groupPhotoOptions.sourceType = sourceType;
    this.loadingProvider.show();
    // Get picture from camera or gallery.
    this.camera.getPicture(this.groupPhotoOptions).then((imageData) => {
      // Process the returned imageURI.
      let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
      let metadata = {
        'contentType': imgBlob.type
      };
      firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
        this.deleteImageFile(group.img);
        // URL of the uploaded image!
        let url = snapshot.metadata.downloadURLs[0];
        group.img = url;
        this.loadingProvider.hide();
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage('image/error-image-upload');
      });
    }).catch((error) => {
      this.loadingProvider.hide();
    });
  }

  // Set group photo and return the group object as promise.
  setGroupPhotoPromise(group, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.groupPhotoOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // Get picture from camera or gallery.
      this.camera.getPicture(this.groupPhotoOptions).then((imageData) => {
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          this.deleteImageFile(group.img);
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
          group.img = url;
          this.loadingProvider.hide();
          resolve(group);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  //Delete the image given the url.
  deleteImageFile(path) {
    var fileName = path.substring(path.lastIndexOf('%2F') + 3, path.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  //Delete the user.img given the user.
  deleteUserImageFile(user) {
    var fileName = user.img.substring(user.img.lastIndexOf('%2F') + 3, user.img.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + user.userId + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  // Delete group image file on group storage reference.
  deleteGroupImageFile(groupId, path) {
    var fileName = path.substring(path.lastIndexOf('%2F') + 3, path.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + groupId + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  deletePostImageFile(postId, photos){
    photos.forEach(photo => {
      let userId = firebase.auth().currentUser.uid;
      let fileName = photo.url.substring(photo.url.lastIndexOf('%2F') + 3, photo.url.lastIndexOf('?'));
      firebase.storage().ref().child('images/' + postId + '/' + fileName ).delete().then(() => {}).catch((error)=> { });
    })
  }

  // Upload photo message and return the url as promise.
  uploadPhotoMessage(conversationId, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.photoMessageOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // Get picture from camera or gallery.
      this.camera.getPicture(this.photoMessageOptions).then((imageData) => {
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // Generate filename and upload to Firebase Storage.
        firebase.storage().ref().child('images/' + conversationId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  // Upload group photo message and return a promise as url.
  uploadGroupPhotoMessage(groupId, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.photoMessageOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // Get picture from camera or gallery.
      this.camera.getPicture(this.photoMessageOptions).then((imageData) => {
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // Generate filename and upload to Firebase Storage.
        firebase.storage().ref().child('images/' + groupId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

 

  uploadPhoto(Id, imageData): Promise<any> {
    return new Promise(resolve => {
      //this.photoMessageOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // Get picture from camera or gallery.
     
        // Process the returned imageURI.
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // Generate filename and upload to Firebase Storage.
        firebase.storage().ref().child('images/' + Id + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          // URL of the uploaded image!
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      })
    }

    sendFeedPhoto(feedId, imageURL) {

      this.angularfireDatabase.object('/feed/' + feedId ).update({ images: imageURL
      }).then((success) => {
        this.loadingProvider.hide();
        //this.alertProvider.showProfileUpdatedMessage();
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage('profile/error-change-photo');
      });
    }

    sendContestPhoto(imageURL) {

        this.angularfireDatabase.object('/accounts/' + firebase.auth().currentUser.uid + '/contest' ).update({ contestImages: imageURL
        }).then((success) => {
          this.loadingProvider.hide();
          this.alertProvider.showProfileUpdatedMessage();
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('profile/error-change-photo');
        });
      }

    sendCommunityPhoto(communityId, imageURL, location) {

      this.angularfireDatabase.object('/'+location+ '/' + communityId ).update({ images: imageURL
      }).then((success) => {
        this.loadingProvider.hide();
        //this.alertProvider.showProfileUpdatedMessage();
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage('profile/error-change-photo');
      });
    }

    updatePostUrl(postId, imageURL, category): Promise<any> {

      return new Promise((resolve, reject) => {
        this.angularfireDatabase.object('/community/' + category + '/' + postId ).update({ images: imageURL
        }).then((success) => {
          resolve();
          this.loadingProvider.hide();
          //this.alertProvider.showProfileUpdatedMessage();
        }).catch((error) => {
          this.loadingProvider.hide();
          reject();
        });
     })
    }
  

}