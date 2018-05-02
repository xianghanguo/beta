import {Component} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {ActionSheetController, AlertController, Platform, ToastController} from "ionic-angular";
import {Camera, CameraOptions} from "@ionic-native/camera";
import { ImageProvider } from "../../providers/data/image"

@Component({
    selector: 'image-upload',
    templateUrl: 'image-upload.html',
    providers: [Camera, Platform]
})

export class ImageUpload {
   te: WindowBase64

    public isUploading = false;
    public uploadingProgress = {};
    public uploadingHandler = {};
    public images: any = [];
    public imageURL: any = [];
    public removeImages: any = [];
    protected imagesValue: Array<any>;
    public key;

    constructor(private sanitization: DomSanitizer, 
                private actionSheetCtrl: ActionSheetController, 
                private camera: Camera, 
                private alertCtrl: AlertController, 
                private toastCtrl: ToastController,
                private imageProvider: ImageProvider,
            ) {

                     
    }



    public uploadPostImages(category): Promise<Array<any>> {
        
        return new Promise((resolve, reject) => {
            this.isUploading = true;
            Promise.all(this.images.map(image => {
                return this.uploadImage(image);
            }))
                .then(resolve => {
                    this.imageProvider.updatePostUrl(this.key, this.imageURL, category);
                    
                })
                .catch(reason => {
                    this.isUploading = false;
                    this.uploadingProgress = {};
                    this.uploadingHandler = {};
                    this.imageURL = [];
                    reject(reason);
                });

        });
    }

    // public uploadImages(location : string): Promise<Array<any>> {
        
    //     return new Promise((resolve, reject) => {
    //         this.isUploading = true;
    //         Promise.all(this.images.map(image => {
    //             return this.uploadImage(image);
    //         }))
    //             .then(resolve => {
    //                 this.imageProvider.sendBoardPhoto(this.key, this.imageURL, location);
                    
    //             })
    //             .catch(reason => {
    //                 this.isUploading = false;
    //                 this.uploadingProgress = {};
    //                 this.uploadingHandler = {};
    //                 this.imageURL = [];
    //                 reject(reason);
    //             });

    //     });
    // }


    public abort() {
        if (!this.isUploading)
            return;
        this.isUploading = false;
        for (let key in this.uploadingHandler) {
            this.uploadingHandler[key].abort();
        }
    }

    // ======================================================================

    protected removeImage(image) {
        if (this.isUploading)
            return;
        this.util.confirm("Are you sure to remove it?").then(value => {
            console.log(image);
            console.log(this.imageURL);
            if (value) {
                if(this.imagesValue)this.util.removeFromArray(this.imagesValue, image);
                if(this.images) this.util.removeFromArray(this.images, image.url);
                if(this.imageURL) {
                    this.removeImages.push(image);
                    this.util.removeFromArray(this.imageURL, image);
                    
                }
                
            }
        });
    }

    protected showAddImage() {
        if (!window['cordova']) {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = "image/x-png,image/gif,image/jpeg";
            input.click();
            input.onchange = () => {
                let blob = window.URL.createObjectURL(input.files[0]);
                this.images.push(blob);
                this.util.trustImages();
            }
        } else {
            new Promise((resolve, reject) => {
                let actionSheet = this.actionSheetCtrl.create({
                    title: 'Add a photo',
                    buttons: [
                        {
                            text: 'From photo library',
                            handler: () => {
                                resolve(this.camera.PictureSourceType.PHOTOLIBRARY);
                            }
                        },
                        {
                            text: 'From camera',
                            handler: () => {
                                resolve(this.camera.PictureSourceType.CAMERA);
                            }
                        },
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                                reject();
                            }
                        }
                    ]
                });
                actionSheet.present();
            }).then(sourceType => {
               
                if (!window['cordova'])
                    return;
                let options: CameraOptions = {
                    quality: 50,
                    sourceType: sourceType as number,
                    destinationType: this.camera.DestinationType.DATA_URL,
                    encodingType: this.camera.EncodingType.JPEG,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                this.camera.getPicture(options).then((imagePath) => {
                    
                    this.images.push(imagePath);
                    this.util.trustImages();
                });
            }).catch(() => {
            });
        }
    }




    private uploadImage(targetPath) {
        return new Promise((resolve, reject) => {
            this.uploadingProgress[targetPath] = 0;

            if (window['cordova']) {
              console.log('cordova');

              this.imageProvider.uploadPhoto(this.key, targetPath).then((url)=>{
                  
                  resolve(this.imageURL.push({url: url}));
                  
              }).catch(() => {
                  askRetry();
              });
            }  
                
            

            let askRetry = () => {
                // might have been aborted
                if (!this.isUploading) return reject(null);
                this.util.confirm('Do you wish to retry?', 'Upload failed').then(res => {
                    if (!res) {
                        this.isUploading = false;
                        for (let key in this.uploadingHandler) {
                            this.uploadingHandler[key].abort();
                        }
                        return reject(null);
                    }
                    else {
                        if (!this.isUploading) return reject(null);
                        this.uploadImage(targetPath).then(resolve, reject);
                    }
                });if (!this.isUploading) return reject(null);
                this.util.confirm('Do you wish to retry?', 'Upload failed').then(res => {
                    if (!res) {
                        this.isUploading = false;
                        for (let key in this.uploadingHandler) {
                            this.uploadingHandler[key].abort();
                        }
                        return reject(null);
                    }
                    else {
                        if (!this.isUploading) return reject(null);
                        this.uploadImage(targetPath).then(resolve, reject);
                    }
                });
            };
        });
    }

    private util = ((_this: any) => {
        return {
            removeFromArray<T>(array: Array<T>, item: T) {
                let index: number = array.indexOf(item);
                if (index !== -1) {
                    array.splice(index, 1);
                }
            },
            confirm(text, title = '', yes = "Yes", no = "No") {
                return new Promise(
                    (resolve) => {
                        _this.alertCtrl.create({
                            title: title,
                            message: text,
                            buttons: [
                                {
                                    text: no,
                                    role: 'cancel',
                                    handler: () => {
                                        resolve(false);
                                    }
                                },
                                {
                                    text: yes,
                                    handler: () => {
                                        resolve(true);
                                    }
                                }
                            ]
                        }).present();
                    }
                );
            },
            trustImages() {
                _this.imagesValue = _this.images.map(
                    val => {
                        return {
                            url: val,
                            sanitized: _this.sanitization.bypassSecurityTrustStyle("url(" + "data:image/jpeg;base64," + val + ")")
                        }
                    }
                );
            },
            showToast(text: string) {
                _this.toastCtrl.create({
                    message: text,
                    duration: 5000,
                    position: 'bottom'
                }).present();
            }
        }
    })(this);
}
