import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DataProvider, LoadingProvider, AlertProvider } from '../../providers';
import { validateCallback } from '@firebase/util';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2';

/**
 * Generated class for the PurchasePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-purchase',
  templateUrl: 'purchase.html',
})
export class PurchasePage implements OnInit{

  private productsToShow = [];
  private productIds = [];
  private products = [];
  private user: any;
  public product: any = {
    name: 'xianghanguo',
    appleProductId: '1234',
    googleProductId: 'test.xinhan.tianya.test001'
  };

  constructor(private navCtrl: NavController, 
              private navParams: NavParams,
              private platform: Platform,
              private dataProvider: DataProvider,
              private loadingProvider: LoadingProvider,
              private alertProvider: AlertProvider,
              private store: InAppPurchase2
              
            
            ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PurchasePage');

    this.dataProvider.getCurrentUser().snapshotChanges().subscribe(user => {
      this.user = user;
    })
    this.dataProvider.getProducts().valueChanges().take(1).subscribe((products :any) => {
      this.productsToShow = products;
      
      // this.configureProducts(products);
    })

  }

  
  ngOnInit() {
    this.configurePurchasing();
  }

  configurePurchasing() {
    if (!this.platform.is('cordova')) { return; }
    let productId;
    try {
      if (this.platform.is('ios')) {
        productId = this.product.appleProductId;
      } else if (this.platform.is('android')) {
        productId = this.product.googleProductId;
      }
      alert('초기화');
      
      // Register Product
      // Set Debug High
      this.store.verbosity = this.store.DEBUG;
      // Register the product with the store
      this.store.register({
        id: productId,
        alias: productId,
        type: this.store.CONSUMABLE
      });

      this.registerHandlers(productId);

      this.store.ready().then((status) => {
        console.log(JSON.stringify(this.store.get(productId)));
        console.log('Store is Ready: ' + JSON.stringify(status));
        console.log('Products: ' + JSON.stringify(this.store.products));
      });

      // Errors On The Specific Product
      this.store.when(productId).error( (error) => {
        alert('An Error Occured' + JSON.stringify(error));
      });
      // Refresh Always
      console.log('Refresh Store');
      this.store.refresh();
    } catch (err) {
      console.log('Error On Store Issues' + JSON.stringify(err));
    }
  }

  registerHandlers(productId) {
    // Handlers
    this.store.when(productId).approved( (product: IAPProduct) => {
      // Purchase was approved
      alert('된다된다');
      product.finish();
    });

    this.store.when(productId).registered( (product: IAPProduct) => {
      console.log('Registered: ' + JSON.stringify(product));
    });

    this.store.when(productId).updated( (product: IAPProduct) => {
      console.log('Loaded' + JSON.stringify(product));
    });

    this.store.when(productId).cancelled( (product) => {
      alert('Purchase was Cancelled');
    });

    // Overall Store Error
    this.store.error( (err) => {
      alert('Store Error ' + JSON.stringify(err));
    });
  }

  async purchase() {
    /* Only configuring purchase when you want to buy, because when you configure a purchase
    It prompts the user to input their apple id info on config which is annoying */
    if (!this.platform.is('cordova')) { return };

    let productId;

    if (this.platform.is('ios')) {
      productId = this.product.appleProductId;
    } else if (this.platform.is('android')) {
      productId = this.product.googleProductId;
    }

    console.log('Products: ' + JSON.stringify(this.store.products));
    console.log('Ordering From Store: ' + productId);
    try {
      let product = this.store.get(productId);
      console.log('Product Info: ' + JSON.stringify(product));
      let order = await this.store.order(productId);
      alert('Finished Purchase');
    } catch (err) {
      console.log('Error Ordering ' + JSON.stringify(err));
    }
  }

  // configureProducts(products){
  //   console.log(products);
  //   this.loadingProvider.show();
  //   if(products){

  //     products.forEach(product => {
  //       this.productIds.push(product.productId);
  //     })
  //     console.log(this.productIds);
  //     this.iap.getProducts(this.productIds).then((products) => {
  //       this.products = products
  //       console.log(this.products);
  //       this.loadingProvider.hide();
  //     }).catch((err)=> {
  //       console.log(err);
  //       this.loadingProvider.hide();
  //     })
  //   }

   
  // }

  // purchase(productId){
  //   console.log(productId)
  //   this.loadingProvider.show();
  //   this.iap.buy(productId).then((data) => {
  //     console.log(JSON.stringify(data));
  //     console.log('transactionId:' + data.transactionId);
  //     return this.iap.consume(data.productType, data.receipt, data.signature);
  //   }).then(() => {
  //     this.alertProvider.showAlert('Purchase was Successful!', 'Check your console log for the transaction data', 'Okay' );
  //     this.loadingProvider.hide();
  //   }).catch((err)=> {
  //     console.log(err)
  //     this.alertProvider.showAlert('error', 'error', 'Okay');
  //     this.loadingProvider.hide();
  //   })
  // }

}
