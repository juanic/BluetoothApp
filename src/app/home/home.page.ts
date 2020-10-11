import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public bat: string;
  public bat_int;
  public temp: string;
  public x: string;
  public y: string;
  public z: string;

  constructor(private cdr: ChangeDetectorRef, public navCtrl: NavController, private bt: BluetoothSerial, private alertCtrl: AlertController, private toastCtrl: ToastController) {
    this.checkBluetoothEnabled();
  }
  public dis;
  pairedDeviceID: number = 0;
  

  public checkBluetoothEnabled() {
    this.bt.isEnabled().then(success => {
      this.listaDisp();
    }, error => {
      this.showError("Active el Bluetooth")
    });
  }
  public async onClick() {
    try{
      await this.bt.isEnabled();
      alert("Bluetooth activado");
      this.listaDisp();
    } catch (e) {
      alert(e);
    }
  }
  public async listaDisp() {
    this.dis = await this.bt.list();
  }
  
  public connect(address) {
    // Conecto al dispositivo elegido
    this.bt.connect(address).subscribe(success => {
      this.deviceConnected();
      this.showToast("Conectado");
    }, error => {
      this.showError("Error:Conectando al dispositivo");
    });
  }

  selectDevice() {
    let connectedDevice = this.dis[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Seleccione dispositivo a conectarse');
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;

    this.connect(address);
  }


  public deviceConnected() {
    // Se ejecuta handleData luego de recibir el delimitador de paquetes 
    this.bt.subscribe('\n').subscribe(success => {
      this.handleData(success);
      this.cdr.detectChanges();
    }, error => {
      this.showError(error);
    });
  }
 

  public handleData(data) {
    // Recibo el paquete y separo las variables a mostrar
    var str = data;
    data = str.split(","); 
    this.bat = data[0];
    this.bat_int = Number(this.bat) * 10;
    console.log(this.bat);
    this.temp = data[1];
    this.x = data[2];
    this.y = data[3];
    this.z = data[4];
  }
  
  async showError(error) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      subHeader: error,
      buttons: ['Aceptar']
    });
    await alert.present(); 
  }

  async showToast(msj) {
    const toast = await this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    await toast.present();
  }

  public deviceDisconnected() {
    // Desconecto
    this.bt.disconnect();
    this.showToast("Dispositivo desconectado");
  }

  public enableBluetooth() {
    // Habilito Bluetooth
    this.bt.enable();
  }

}
