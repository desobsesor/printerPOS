var express = require("express"),
  escpos = require("escpos"),
  app = express(),
  http = require("http"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  server = http.createServer(app);

const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

router.get('/estadoDelServicio', function (req, res) {
  console.log("Servicio inicializado exitosamente!");
  res.send("Servicio inicializado exitosamente!");
});

router.get('/imprimirFactura', function (req, res) {
  //res.send("Hello World!");
  const options = { encoding: "CP860"  }
  const device = new escpos.USB(0x04B8, 0x0E15);
  //const device  = new escpos.Serial(0x04B8,0x0E15);
  const printer = new escpos.Printer(device, options);
  //console.log(escpos.USB.findPrinter());
  // encoding is optional
  
  let detalles = req.query.detalles;

  let factura = {};
  factura = JSON.parse(req.query.factura);
  console.log("factura:", factura);
  var esc = '\x1B'; //ESC byte in hex notation
  var newLine = '\x0A'; //LF byte in hex notation
  var cmds = esc + "@"; //Initializes the printer (ESC @)
  cmds += esc + '!' + '\x38'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)

  cmds += newLine;
  var detallesFactura = [];
  detallesFactura = detalles;
  console.log("detallesFactura.length :",detallesFactura.length );
  if (detallesFactura.length > 20) {
    let o = JSON.parse(detallesFactura);
     console.log("o: ", o)
    cmds += ('Producto: ' + o.producto);
    cmds += newLine;
    cmds += ('Cantidad: ' + o.cantidad);
    cmds += newLine;
    cmds += ('Precio Unitario: $' + formatMyNumber( + o.precioUnitario));
    cmds += newLine;
    cmds += ('Valor Total: $' + formatMyNumber(o.total));
    cmds += newLine;
    cmds += '------------------------------------------------';
  } else {
    for (var i = 0; i < detallesFactura.length; i++) {
      var obj = detallesFactura[i];
      var o = JSON.parse(obj);
      cmds += ('Producto: ' + o.producto);
      cmds += newLine;
      cmds += ('Cantidad: ' + o.cantidad);
      cmds += newLine;
      cmds += ('Precio Unitario: $' + formatMyNumber(o.precioUnitario) + ' ---' + ' Descuento: $' + formatMyNumber(o.descuentoDetalle));
      cmds += newLine;
      cmds += ('Valor Total: $' + formatMyNumber(o.total));
      cmds += newLine;
      cmds += '------------------------------------------------';
    }
  }

  //cmds += '-----------------------------------------------';
  cmds += newLine;
  cmds += 'SUBTOTAL                              $' + formatMyNumber(factura.subtotal);
  cmds += newLine;
  //parametrizar activación.
  //cmds += 'IVA                                   $' + formatMyNumber(factura.impuestosTotal);
  //cmds += newLine;
  cmds += 'Descuento                             $' + formatMyNumber(factura.descuentosTotal);
  cmds += newLine;
  cmds += 'TOTAL                                 $' + formatMyNumber(factura.total);
  cmds += newLine;
  cmds += '-----------------------------------------------';
  cmds += newLine;
  cmds += 'Efectivo                              $' + formatMyNumber(factura.efectivo);
  cmds += newLine;
  cmds += 'Cambio                                $' + formatMyNumber(factura.cambio);
  cmds += newLine + newLine;
  cmds += esc + '!' + '\x18'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
  if (detallesFactura.length > 20)
    cmds += 'Total de productos: ' + (detallesFactura.length > 20 ? '1' : detallesFactura.length);
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine + newLine;
  cmds += 'Vendido por: ' + factura.vendedor;
  cmds += newLine;
  cmds += 'Fecha de impresión: ' + new Date().toDateInputValue();
  cmds += newLine;
  cmds += 'Impreso por CDS (Casa de desarrollo de software)';
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine ;
  cmds += '';

  let direccion = {};
  let contacto = {};
  direccion = factura.direccion;
  contacto = factura.contacto;

  const tux = './assets/sinimagen.jpg';
  escpos.Image.load(tux, function (image) {
    device.open(function () {
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(2, 2)
        .text('DROGUERIA')
        .font('a')
        .align('ct')
        .style('bu')
        .size(3, 3)
        .text('FARMASALUD WEF')
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        //.text('wef.cds.net.co')
        //.align('LEFT')
        .text('Regimen Simplificado - Nit:' + factura.nitEmpresa)
        .text('' + direccion.municipio + ', ' + direccion.departamento + ', Barrio ' + direccion.barrio + ' calle ' + direccion.calle + ' Manz. ' + direccion.manzana + ' Casa No:' + direccion.numero + '')
        .text('Telefono: ' + contacto.telefonoCelular)
        .font('a')
        .align('ct')
        .style('bu')
        .size(2, 2)
        .text('Factura de venta No: ' + factura.id)
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('Fecha: ' + factura.fechaRegistro)
        .text('' + (factura.cliente=='Ingrese un documento para buscar!' ? 'Cliente: POS' : 'Cliente: ' + factura.cliente))
        .text('' + ((factura.numeroDocumentoCliente !== '' && factura.numeroDocumentoCliente !== 'undefined'  && factura.numeroDocumentoCliente !== undefined ? 'No. Documento: ' : '---------') + 
        (factura.numeroDocumentoCliente !== 'undefined'  && factura.numeroDocumentoCliente !== undefined ? factura.numeroDocumentoCliente : '---------' )))
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('DETALLES DE FACTURA')
        .text(cmds)
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('Por favor verifique su cambio. ')
        .font('b')
        .align('ct')
        .style('bu')
        .size(2, 1)
        .text('GRACIAS POR SU COMPRA!')
        //.image(image)
        //.text('敏捷的棕色狐狸跳过懒狗')
        //.barcode('1234567', 'EAN8')
        .cut()
        .close();
    });
  });
  res.send("Impresión de factura realizada con exito!");
});

router.get('/cerrarCaja', function (req, res) {

  //res.send("Hello World!");
  const options = { encoding: "CP860" /* default */ }
  const device = new escpos.USB(0x04B8, 0x0E15);
  //const device  = new escpos.Serial(0x04B8,0x0E15);
  const printer = new escpos.Printer(device, options);
  //console.log(escpos.USB.findPrinter());
  // encoding is optional
  let cajaControl = {};
  cajaControl = JSON.parse(req.query.caja);

  //console.log("cajaControl: ", cajaControl);
  //console.log("cajaControl.length: ", cajaControl.length);

  let empresa = {};
  empresa = JSON.parse(req.query.empresa);

  var esc = '\x1B'; //ESC byte in hex notation
  var newLine = '\x0A'; //LF byte in hex notation
  var cmds = esc + "@"; //Initializes the printer (ESC @)
  cmds += esc + '!' + '\x38'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
  //cmds += 'DETALLES DE FACTURA'; //text to print
  //cmds += newLine + newLine;
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)

  //cmds += '-----------------------------------------------';
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'MONTO INICIAL                         $' + formatMyNumber(cajaControl.montoInicial);
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'MONTO FINAL                           $' + formatMyNumber(cajaControl.montoFinal); 
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'TOTAL VENTA                           $' + formatMyNumber(parseInt(cajaControl.montoFinal)-parseInt(cajaControl.montoInicial));
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine;
  cmds += '------------------------------------------------';
  cmds += newLine;
  cmds += 'RESPONSABLE APERTURA                   ';
  cmds += newLine;
  cmds += (cajaControl.personaAbre.nombres.primerNombre+" "+cajaControl.personaAbre.nombres.segundoNombre+" "+ cajaControl.personaAbre.apellidos.primerApellido+" "+cajaControl.personaAbre.apellidos.segundoApellido);
  cmds += newLine;
  
  var ac =  new Date(cajaControl.fechaApertura).toLocaleString();
  cmds += 'FECHA APERTURA - ' + ac; //.replace(text/g,' ').replace(/T/, ' ').replace(/\..+/, '');
  cmds += newLine;
  cmds += 'NOVEDAD APERTURA                       ';
  cmds += newLine;
  cmds += cajaControl.novedadApertura;  
  cmds += newLine;
  cmds += '------------------------------------------------';
  cmds += newLine;
  cmds += 'RESPONSABLE CIERRE                   ';
  cmds += newLine;
  cmds += (cajaControl.personaCierra.nombres.primerNombre+" "+cajaControl.personaCierra.nombres.segundoNombre+" "+ cajaControl.personaCierra.apellidos.primerApellido+" "+cajaControl.personaCierra.apellidos.segundoApellido);
  cmds += newLine;
  var a = new Date(cajaControl.fechaCierre).toLocaleString();
  
  cmds += 'FECHA CIERRE - ' + a;//.replace(text/g,' ').replace(/T/, ' ').replace(/\..+/, '');
  cmds += newLine;
  cmds += 'NOVEDAD CIERRE                         ';
  cmds += newLine;
  cmds += cajaControl.novedadCierre;
  cmds += newLine;
  cmds += '-----------------------------------------------';
  /*cmds += newLine + newLine;
  cmds += esc + '!' + '\x18'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
  cmds += 'Total venta: ' + formatMyNumber(cajaControl.montoFinal - cajaControl.montoInicial);
  cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
  cmds += newLine + newLine;
  cmds += '-----------------------------------------------';*/
  cmds += newLine;
  cmds += 'Fecha de impresión: ' + new Date().toDateInputValue();
  cmds += newLine;
  cmds += 'Impreso por CDS (Casa de desarrollo de software)';

  let direccion = {};
  let contacto = {};
  direccion = empresa.direccion;
  contacto = empresa.contacto;

  const tux = './assets/sinimagen.jpg';
  escpos.Image.load(tux, function (image) {
    device.open(function () {
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(2, 2)
        .text('DROGUERIA')
        .font('a')
        .align('ct')
        .style('bu')
        .size(3, 3)
        .text('FARMASALUD WEF')
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        //.text('wef.cds.net.co')
        //.align('LEFT')
        .text('Nit:' + empresa.nit)
        .text('' + direccion.municipio + ', ' + direccion.departamento + ', Barrio ' + direccion.barrio + ' calle ' + direccion.calle + ' Manz. ' + direccion.manzana + ' Casa No:' + direccion.numero + '')
        .text('Telefono: ' + contacto.telefonoCelular)
        .font('a')
        .align('ct')
        .style('bu')
        .size(2, 2)
        .text('Cierre de caja')
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('DETALLES')
        .text(cmds)
        //.image(image)

        //.text('敏捷的棕色狐狸跳过懒狗')
        //.barcode('1234567', 'EAN8')
        /*.image('./assets/afrodes.png', function(err){
          this.cut();
          this.close();
        })*/

        /*.image(image, 's8')
        .image(image, 'd8')
        .image(image, 's24')
        .image(image, 'd24')
        
        .raster(image)
        .raster(image, 'dw')
        .raster(image, 'dh')
        .raster(image, 'dwdh')*/

        .cut()
        .close();
    });
  });
  res.send("Impresion Realizada con exito!");
});

//#region METODO REGION FECHA
Date.prototype.toDateInputValue = (function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return (local.toJSON().slice(0, 10) + ' ' + local.toJSON().slice(11, 19));
});
//#endregion
app.use(router);

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
	res.header("Access-Control-Allow-Headers", "content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	//res.header("Access-Control-Allow-Headers", "content-type, Authorization, Content-Length, X-Requested-With, Origin, Accept");
	next();
});

app.listen(4000, function () {
  console.log("Node server running on http://localhost:4000");
});

formatMyNumber = function (numero) {
  // Limit to two decimal places 
  numero = parseFloat(numero).toFixed(1);
  //Seperates the components of the number
  var n = numero.toString().split(".");
  //Comma-fies the first part
  n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //Combines the two sections
  return n.join(".");
}

/*
router.get('/', function(req, res) {
  // Select the adapter based on your printer type
//const device = new escpos.USB("USB001");
const options = { encoding: "GB18030" }
const device  = new escpos.USB(0x04B8,0x0E15);
//const device  = new escpos.Serial(0x04B8,0x0E15);
const printer = new escpos.Printer(device, options);
//console.log(escpos.USB.findPrinter());
// encoding is optional

device.open(function(){
  printer
  .font('a')
  .align('ct')
  .style('bu')
  .size(1, 1)
  .text('The quick brown fox jumps over the lazy dog')
  //.text('敏捷的棕色狐狸跳过懒狗')
  .barcode('1234567', 'EAN8')
  .qrimage('./assets/afrodes.png', function(err){
    this.cut();
    this.close();
  });
});

   res.send("Hello World!");
});*/

//app.use(router);






