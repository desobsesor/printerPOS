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
//#region CONOCER EL ESTADO DEL SERVICIO
router.get('/estadoDelServicio', function (req, res) {
  console.log("Servicio inicializado ...");
});
//#endregion
//#region IMPRESIÓN DE FACTURA
router.get('/imprimirFactura', function (req, res) {
  
  const options = { encoding: "CP860"  }
  const device = new escpos.USB(0x04B8, 0x0E15);
  const printer = new escpos.Printer(device, options);

  let detalles = req.query.detalles;

  let factura = {};
  factura = JSON.parse(req.query.factura);

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
    cmds += ('Producto: ' + o.itemMedicamento);
    cmds += newLine;
    cmds += ('Cantidad: ' + o.cantidad);
    cmds += newLine;
    cmds += ('Precio Unitario: ' + o.precioUnitario);
    cmds += newLine;
    cmds += ('Valor Total: $' + formatMyNumber(o.total));
    cmds += newLine;
    cmds += '------------------------------------------------';
  } else {
    for (var i = 0; i < detallesFactura.length; i++) {
      var obj = detallesFactura[i];
      var o = JSON.parse(obj);
      cmds += ('Producto: ' + o.itemMedicamento);
      cmds += newLine;
      cmds += ('Cantidad: ' + o.cantidad);
      cmds += newLine;
      cmds += ('Precio Unitario: ' + o.precioUnitario);
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
  cmds += 'IVA                                   $' + formatMyNumber(factura.impuestosTotal);
  cmds += newLine;
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

  let direccion = {};
  let contacto = {};
  direccion = factura.direccion;
  contacto = factura.contacto;

  const content = './assets/logocds.png';
  escpos.Image.load(content, function (image) {
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
        .text('Nit:' + factura.nitEmpresa)
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
        .text('Cliente: ' + factura.cliente)
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('DETALLES DE FACTURA')
        .text(cmds)
        //.image(image)
        .cut()
        .close();
    });
  });
  res.send("Impresión de factura realizada con exito!");
});
//#endregion
//#region IMPRESIÓN DE CIERRE DE CAJA
router.get('/cerrarCaja', function (req, res) {

  const options = { encoding: "CP860" }
  const device = new escpos.USB(0x04B8, 0x0E15);
  const printer = new escpos.Printer(device, options);

  let cajaControl = {};
  cajaControl = JSON.parse(req.query.caja);

  let empresa = {};
  empresa = JSON.parse(req.query.empresa);

  var esc = '\x1B'; //ESC byte in hex notation
  var newLine = '\x0A'; //LF byte in hex notation
  var cmds = esc + "@"; //Initializes the printer (ESC @)
  cmds += esc + '!' + '\x38'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
  cmds += esc + '!' + '\x00'; 
  //cmds += '-----------------------------------------------';
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'MONTO INICIAL                         $' + formatMyNumber(cajaControl.montoInicial);
  cmds += esc + '!' + '\x00'; 
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'MONTO FINAL                           $' + formatMyNumber(cajaControl.montoFinal); 
  cmds += esc + '!' + '\x00'; 
  cmds += newLine;
  cmds += esc + '!' + '\x18';
  cmds += 'TOTAL VENTA                           $' + formatMyNumber(parseInt(cajaControl.montoFinal)-parseInt(cajaControl.montoInicial));
  cmds += esc + '!' + '\x00'; 
  cmds += newLine;
  cmds += '------------------------------------------------';
  cmds += newLine;
  cmds += 'RESPONSABLE APERTURA                   ';
  cmds += newLine;
  cmds += (cajaControl.personaAbre.nombres.primerNombre+" "+cajaControl.personaAbre.nombres.segundoNombre+" "+ cajaControl.personaAbre.apellidos.primerApellido+" "+cajaControl.personaAbre.apellidos.segundoApellido);
  cmds += newLine;
  
  var ac =  new Date(cajaControl.fechaApertura).toLocaleString();
  cmds += 'FECHA APERTURA - ' + ac;
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
  
  cmds += 'FECHA CIERRE - ' + a;
  cmds += newLine;
  cmds += 'NOVEDAD CIERRE                         ';
  cmds += newLine;
  cmds += cajaControl.novedadCierre;
  cmds += newLine;
  cmds += '-----------------------------------------------';
  cmds += newLine;
  cmds += 'Fecha de impresión: ' + new Date().toDateInputValue();
  cmds += newLine;
  cmds += 'Impreso por CDS (Casa de desarrollo de software)';

  let direccion = {};
  let contacto = {};
  direccion = empresa.direccion;
  contacto = empresa.contacto;

  const content = './assets/logocds.png';
  escpos.Image.load(content, function (image) {
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
        .cut()
        .close();
    });
  });
  res.send("Impresion Realizada con exito!");
});
//#endregion
//#region REGIÓN Y FECHA
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
	next();
});

app.listen(4000, function () {
  console.log("Server de impresión inicializado en http://localhost:4000");
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







