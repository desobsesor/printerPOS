# PrinterPOS
API para servir impresión de factura y cierre de caja (NodeJS and EscPos)
============
* [printerpos.cds.net.co](http://cds.net.co)

_App para servicio de impresion de facturas y cierres de caja en scip_
Aplicación NodeJS-EscPos


## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

Mira **Deployment** para conocer como desplegar el proyecto.

Ejecutar en consola "node printerPOS.js", se instala en el cliente fisico que tendra la caja.
Para arrancar el app node se crea un servicio en el equipo del cliente a traves del App para crear servicios

### Pre-requisitos 📋

_Node.js_
```
node printerPOS.js
```
_https://github.com/Rob--W/cors-anywhere/_
```
//pasando por el servicio Cors con la url para ser detectado de confianza
http://localhost:8080/http://localhost:4000/imprimirFactura
```
_Llamado desde el metodo de "imprimir factura" desde SCIP pasando parametros al app de servicio de impresion_
```
        var arrayDetalles = [];
        for(var i=0; i < $scope.facturaDetalles.length; i++){
            var objectA={
                producto : $scope.facturaDetalles[i].itemMedicamento.nombreGenerico,
                cantidad: $scope.facturaDetalles[i].cantidad,
                total: $scope.facturaDetalles[i].total,
                precioUnitario: $scope.facturaDetalles[i].precioUnitario,
            };
            arrayDetalles.push(objectA);
        }

        $scope.objectPrinterFactura = {
            detalles:   arrayDetalles,
            factura:    {
                id:         factura.id,
                subtotal:   factura.subtotal,
                impuestosTotal: factura.impuestos.total==undefined?0:factura.impuestos.total,
                descuentosTotal:    factura.descuentos.total==undefined?0:factura.descuentos.total,
                total:  factura.total,
                efectivo:   factura.efectivo,
                cambio: factura.cambio,
                cliente:    $scope.newItemCliente.persona.nombres.primerNombre,
                vendedor:   $scope.vendedor,
                direccion:    $scope.empresaActual.direccion,
                contacto:    $scope.empresaActual.contacto,
                nitEmpresa: $scope.empresaActual.nit
            }
        };

        $http.get('http://localhost:8080/http://localhost:4000/imprimirFactura', {
            params: {
                detalles:   $scope.objectPrinterFactura.detalles,
                factura:    $scope.objectPrinterFactura.factura
            },
            headers: {
                ....
```

### Instalación 🔧

_Para usar este proyecto continue con los siguientes pasos_

_Genere un clon del proyecto o descargue una version en formato .zip_
```
git clone https://github.com/desobsesor/printerPOS.git
```
_Asegurese de construir nuevamente los modulos necesarios_
```
npm install
```
_Descomprima y arranque desde consola ubicandose en la raiz de la carpeta_
```
node printerPOS.js
```
_Asegurese que el servicio este inicializado_
```
http://localhost:4000/estadoDelServicio
```

## Ejecutando las pruebas ⚙️

_Explica como ejecutar las pruebas automatizadas para este sistema_

### Analice las pruebas end-to-end 🔩

_Explica que verifican estas pruebas y por qué_

```
Da un ejemplo
```

### Y las pruebas de estilo de codificación ⌨️

_Explica que verifican estas pruebas y por qué_

```
Da un ejemplo
```

## Deployment 📦

_Abre el proyecto con visual estudio code y ejecuta f5 para configurar arranque del nodeserver_

## Construido con 🛠️

_Herramientas y Tecnologias utilizadas

* [Nodejs](https://nodejs.org/es//) - Entorno JavaScript de lado de servidor, utiliza un modelo asíncrono y dirigido por eventos.
* [NPM](https://www.npmjs.com/) - Manejador de dependencias
* [EscPos](https://www.npmjs.com/package/escpos) - Libreria para impresión en termicas

## Contribuyendo 🖇️

Actualmente no se permiten contribuciones.

## Versionado 📌

Usamos [SemVer](http://semver.org/) para el versionado. Para todas las versiones disponibles, mira los [tags en este repositorio](https://github.com/tu/proyecto/tags).

## Autores ✒️

_Personal encargado_

* **Yovany Suárez Silva** - *Desarrollador FullStack Java, C# y Javascript* - [desobsesor](https://github.com/desobsesor)


También puedes mirar la lista de todos los [contribuyentes](https://github.com/your/project/contributors) quíenes han participado en este proyecto. 

## Licencia 📄

Este proyecto está bajo la Licencia (Tu Licencia) - mira el archivo [LICENSE.md](LICENSE.md) para detalles

## Expresiones de Gratitud 🎁

* Comenta a otros sobre este proyecto 📢
* Invita una cerveza 🍺 a alguien del equipo. 
* Da las gracias públicamente 🤓.
* etc.

---
⌨️ con ❤️ por [desobsesor](https://github.com/desobsesor) 😊
