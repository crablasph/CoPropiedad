// ==UserScript==
// @name VUR
// @namespace VUR
// @description This script will automagically blah blah blah
// @include *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require       https://unpkg.com/jspdf@latest/dist/jspdf.min.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/xlsx.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/jszip.js
// @require       https://unpkg.com/jspdf@latest/dist/jspdf.min.js
// @require       https://github.com/niklasvh/html2canvas/releases/download/0.4.1/html2canvas.js
// 
// ==/UserScript==
//
//  

//https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js

const DB = "https://www.vur.gov.co/portal/PantallasVUR/webresources/consultaIndices/datosBasicos/tierras/";
const EJ = "https://www.vur.gov.co/portal/PantallasVUR/webresources/consultaIndices/estadoJuridico/tierras/";
const IN = "https://www.vur.gov.co/portal/PantallasVUR/webresources/consultaIndices/";
const SE = "https://www.vur.gov.co/portal/PantallasVUR/webresources/consultaIndices/serverid";
const IDDIV  = 'page-content';
const IDFILE = 'my_file_input';
var oFileIn;


$(function() {
    var contents = $('#'+IDDIV);
    appendInput();
    
    //console.log(contents);
    oFileIn = document.getElementById(IDFILE);
    if(oFileIn.addEventListener) {
        oFileIn.addEventListener('change', filePicked, false);
    }
});

function appendInput() {
  alert("creando...");
  var txt2 = document.createElement("p");
  txt2.innerHTML = "Excel Descarga"
  
  var txt3 = document.createElement("input");  // Create with DOM
  txt3.type = "file";
  txt3.id = 'my_file_input';
  
  var sel = document.createElement("select");
  sel.id= "sel";
  var opt1 = document.createElement("option");
  var opt2 = document.createElement("option");

  opt1.value = "1";
  opt1.text = "Datos Basicos";

  opt2.value = "2";
  opt2.text = "Estado Juridico";

  sel.add(opt1, null);
  sel.add(opt2, null);
  
  var txt4 = document.createElement("p");
  txt4.innerHTML = "Resultados:<br> "
  txt4.id = 'my_file_output';
  
  $("#"+IDDIV).append( txt2, txt3, sel,txt4);      // Append the new elements
}

function requestDownload(cadena, mtd, fmi, url){
  //console.log("Consulta",cadena);
  let str = cadena;
  let lfmi = fmi;
  let uri = url;
  $.ajax({
    type: mtd,    
    url: str,
    cache: false,
    async: false,
    //crossDomain: true,
    //dataType: 'json',
    xhrFields: {
       withCredentials: true
    },
    success: function (data) {
        var myProp = 'numeroMatricula';
        //console.log("data",data,str,lfmi);
        parseAndDownload(data, str, lfmi, uri);
                
      }
    });
}

function parseAndDownload(cadena, url, fmi, bas){
  
  
  
  try{
     let lfmi = fmi;
     let uri =  url;
     let base =  bas;
     let dataObj =  JSON.parse(cadena);
     
     switch (base) {
      case DB:
        procesarDB(dataObj);
        download(JSON.stringify(dataObj),fmi+"DB.json","json");
        break;
      case EJ:
        procesarEJ(dataObj);
        download(JSON.stringify(dataObj),fmi+"EJ.json","json");
        break;
      default:
        console.log(dataObj);
        
        break;
    }
    
   }

 catch(e){
   console.log(e);// you can get error here
   }
}

function procesarDB(obj){
  let dObj = obj;
  let htmlObj =  htmlTextDB();
  let verLlena = fillDB(dObj, htmlObj);
  console.log(dObj,htmlObj,verLlena );
}

function procesarEJ(obj){
  let dObj = obj;
  let htmlObj =  htmlTextEJ();
  let verLlena = fillEJ(dObj, htmlObj);
  console.log(dObj,htmlObj,verLlena );
}

function requestDB(fmi){
  var url =  DB;
  let reqURL = url+fmi;
  method = "GET";
  requestDownload(reqURL,method, fmi, url);
}

function requestEJ(fmi){
  var url = EJ;
  let reqURL = url+fmi;
  method = "GET";
  requestDownload(reqURL,method,fmi, url);
}

function requestIN(fmi){
  var url =  IN;
  let reqURL = url+fmi;
  method = "POST";
  requestDownload(reqURL,method,fmi, url);
}

function requestSE(fmi){
  var url =  SE;
  let reqURL = url;
  method = "GET";
  requestDownload(reqURL,method,fmi, url);
}

function parseHtml(cadena){
  let str =  cadena;
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, "text/html");
  return doc;
}

function filePicked(oEvent) {
  
    // Get The File From The Input
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    // Create A File Reader HTML5
    var reader = new FileReader();
    
    // Ready The Event For When A File Gets Selected
    reader.onload = function(e) {
        var data = e.target.result;
        var cfb = XLS.CFB.read(data, {type: 'binary'});
        var wb = XLS.parse_xlscfb(cfb);
        // Loop Over Each Sheet
        wb.SheetNames.forEach(function(sheetName) {
            // Obtain The Current Row As CSV
            //var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);   
            //var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);   
            var jJS = XLS.utils.sheet_to_json(wb.Sheets[sheetName]);
            //console.log(jJS);
            var fmi = [];
            for (i in jJS) {
                 var fila = jJS[i];
                 fmi[i] = fila.FMI;
                 //console.log(fmi[i]);
                $("#my_file_output").append(i+". Procesando Folio "+fmi[i]+"<br>");
                selection = $('#sel').find(":selected").text();
                //console.log("Opcion: "+selection);
              
                switch (selection) {
                    case 'Datos Basicos':
                      //setTimeout(function() {
                        requestIN(fmi[i]);
                        requestDB(fmi[i]);
                        requestSE(fmi[i]);

                      //}, 5000);
                      break;
                    case 'Estado Juridico':
                      //setTimeout(function() {
                        requestIN(fmi[i]);
                        requestEJ(fmi[i]);
                        requestSE(fmi[i]);

                      //}, 5000);
                      break;
                   default:
                      //setTimeout(function() {
                        requestIN(fmi[i]);
                        requestDB(fmi[i]);
                        requestSE(fmi[i]);

                      //}, 5000);
                    break;
                  }
                  
               
              
                 
            }

            
            
        });
    };
  
    
    
    // Tell JS To Start Reading The File.. You could delay this if desired
    reader.readAsBinaryString(oFile);
}

//https://medium.com/@tertiumnon/js-how-to-decode-html-entities-8ea807a140e5
function encodeHTMLEntities(text) {
  return $("<textarea/>")
    .text(text)
    .html();
}

function download(data, filename, type) {
	
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
  }

function htmlTextDB(){
  
  cadena= '';
  
  return cadena;
}

function htmlToPdf(htmlstr, fmi, td){
  
  let htmlL = htmlstr;
  let folio =  fmi;
  let tipo = td;
  let ht = parseHtml(htmlL);
  
  var doc = new jsPDF();   

  doc.html(ht, {
     callback: function (doc) {
       doc.save(folio+tipo+".pdf");
     }
  });
  
  /*html2canvas( $(htmlL) ).then(function(canvas) {
    
    download(canvas,folio+"EJ.png","image/png");
  });*/
  
  
   
  
  //document.write('<img src="'+img+'"/>');
  
  return true;
}

function fillEJ(obj, cadena){
  let cadFinal = "";
  let lObj = obj;
  let htmlCadena = cadena;
  let fmi = lObj.circulo+"-"+lObj.numeroMatricula;
  
  
  
  //Reemplaza fecha
  const repFecha = "<b>Fecha:</b> 17/10/2019";
  let newFecha   = "<b>Fecha:</b> "+lObj.fecha;
  cadFinal = htmlCadena.replace(repFecha, newFecha);
  
  //Reemplaza hora
  const repHora = "<b>Hora:</b> 12:32 PM";
  let newHora   = "<b>Hora:</b> "+lObj.hora;
  cadFinal = cadFinal.replace(repHora, newHora);
  
  //Fecha Hora Fecha
  const repFechaHora = '<span id="menu-fecha">17/10/2019 12:31:48 PM</span></div>';
  let newFechaHora   = '<span id="menu-fecha">'+lObj.fecha+ ' ' +lObj.hora+'</span></div> ';
  cadFinal = cadFinal.replace(repFechaHora, newFechaHora);
  
  //Reemplaza Consulta
  const repConsulta = "<b>No. Consulta: </b> 165428805";
  let newConsulta   = "<b>No. Consulta: </b> "+lObj.consulta;
  cadFinal = cadFinal.replace(repConsulta, newConsulta);
  
  //Reemplaza fmi
  const repFmi = "<b>No. Matricula Inmobiliaria: </b> 008-8020";
  let newFmi   = "<b>No. Matricula Inmobiliaria: </b> "+fmi;
  cadFinal = cadFinal.replace(repFmi, newFmi);
  
  //Reemplaza fmi
  const repRca = "<b>Referencia Catastral: </b> 123456";
  let refCat = lObj.referenciaCatastral == undefined ? "":lObj.referenciaCatastral;
  let newRca   = "<b>Referencia Catastral: </b> "+refCat;
  cadFinal = cadFinal.replace(repRca, newRca);
  
  //Replaza textoAnotaciones
  let repTan = "";
  let mrep   = "";
  
  repTan+= '              <div class="tab-pane ng-scope ng-isolate-scope active" ng-class="{active: selected}" ng-transclude="" title="Lista">';
  mrep+= '                    <!-- ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  mrep+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 1 Fecha: 16-10-1998 Radicación: 1363<br>Doc: ESCRITURA 1066 DEL 1997-12-30 00:00:00  NOTARIA UNICA DE CHIGORODO          VALOR ACTO: $<br>ESPECIFICACION: 911 LOTEO';

  mrep+= '(OTRO)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>A: RAMIREZ PEREZ LUIS GERARDO    X   </span>';
  mrep+= '                      <hr>';
  mrep+= '                  </div><!-- end ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  mrep+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 2 Fecha: 02-05-2001 Radicación: 562<br>Doc: RESOLUCION 007 DEL 2001-02-12 00:00:00  ALCALDIA DE CHIGORODO          VALOR ACTO: $<br>ESPECIFICACION: 915 PERMISO DE VENTA  (OTRO)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>A: RAMIREZ PEREZ LUIS GERARDO    X   </span>';
  mrep+= '                      <hr>';
  mrep+= '                  </div><!-- end ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  mrep+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 3 Fecha: 08-11-2006 Radicación: 2311<br>Doc: ESCRITURA S/N DEL 2006-10-31 00:00:00  NOTARIA UNICA DE CHIGORODO          VALOR ACTO: $3.230.000<br>ESPECIFICACION: 0125 COMPRAVENTA  (MODO DE ADQUISICION)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>DE: RAMIREZ PEREZ LUIS GERARDO             <br>A: MARTINEZ MARQUEZ RUDIT MARIA   CC 32286649 X   </span>';
  mrep+= '                     <hr>';
  mrep+= '                  </div>';
  repTan+= mrep;
  repTan+= '              </div>';
 
  
  let newTan   = "";
  
  for (i=0;i<lObj.textoAnotaciones.length;i++){
    
    
    // reemplazar en texto anotaciones
    //let textoInsertar = lObj.textoAnotaciones[i].replace("Radicación","Radicaci&oacute;n");
    let textoInsertar = estandariza(lObj.textoAnotaciones[i]);
    
    newTan   += '<div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
    newTan   += '                    <span ng-bind-html="anotacion" class="ng-binding">'+textoInsertar+'</span>                        ';
	newTan   += '					<hr>';
    newTan   += '                </div>';
  }
  
  let reemplazo = repTan.replace(mrep,newTan);
  
  cadFinal = cadFinal.replace(repTan, reemplazo);
  
  
  //Descargar html VUR EJ
  download(cadFinal,fmi+"EJ.html","text/html");
  
  let jsonCadena= '  <div id="json">';
  jsonCadena+= ' </div>';
  
  let newJson   = '<div id="json">'+ "<br><pre>"+JSON.stringify(obj) +'</pre></div>';
  cadFinal = cadFinal.replace(jsonCadena, newJson);
  //console.log(cadFinal);
  download(cadFinal,fmi+"EJ_FULLDATA.html","text/html");
  
  return true;
}

function fillDB(obj, cadena){
  
  let cadFinal = "";
  let lObj = obj;
  let htmlCadena = cadena;
  let fmi = lObj.circulo+"-"+lObj.numeroMatricula;
  
  //Reemplaza fecha
  const repFecha = '<span class="span-titulo">Fecha: </span>17/10/2019';
  let newFecha   = '<span class="span-titulo">Fecha: </span> '+lObj.fecha;
  cadFinal = htmlCadena.replace(repFecha, newFecha);
  
  //Reemplaza hora
  const repHora = '<span class="span-titulo">Hora: </span>09:21 AM';
  let newHora   = '<span class="span-titulo">Hora: </span> '+lObj.hora;
  cadFinal = cadFinal.replace(repHora, newHora);
  
  //Fecha Hora Fecha
  const repFechaHora = '<span id="menu-fecha">17/10/2019 09:20:56 AM</span>';
  let newFechaHora   = '<span id="menu-fecha">'+lObj.fecha+ ' ' +lObj.hora+'</span></div> ';
  cadFinal = cadFinal.replace(repFechaHora, newFechaHora);
  
  //Reemplaza Consulta
  const repConsulta = '<span class="span-titulo">No. Consulta: </span>165364626';
  let newConsulta   = '<span class="span-titulo">No. Consulta: </span>'+lObj.numeroConsulta;
  cadFinal = cadFinal.replace(repConsulta, newConsulta);
  
  //Reemplaza fmi
  const repFmi = '<span class="span-titulo">N&deg; Matr&iacute;cula Inmobiliar&iacute;a: </span>008-150';
  let newFmi   = '<span class="span-titulo">N&deg; Matr&iacute;cula Inmobiliar&iacute;a: </span>'+fmi;
  cadFinal = cadFinal.replace(repFmi, newFmi);
  
  //Reemplaza Ref Cat
  const repRca = '<span class="span-titulo">Referencia Catastral: </span>123456';
  let newRca   = '<span class="span-titulo">Referencia Catastral: </span'+lObj.referenciaCatastral;
  cadFinal = cadFinal.replace(repRca, newRca);
  
  //Reemplaza Departamento
  const repDpt = '<span class="span-titulo">Departamento: </span>ANTIOQUIA';
  let newDpt   = '<span class="span-titulo">Departamento: </span>'+lObj.departamento.nombre;
  cadFinal = cadFinal.replace(repDpt, newDpt);
  
  //Reemplaza Ref Cat Anterior
  //
  let refCatAnt = (lObj.referenciaCatastralAnterior == undefined) ? "" : lObj.referenciaCatastralAnterior;
  const repRan = '<span class="span-titulo">Referencia Catastral Anterior: </span>789321';
  let newRan   = '<span class="span-titulo">Referencia Catastral Anterior: </span>'+ refCatAnt;
  cadFinal = cadFinal.replace(repRan, newRan);
  
  //Reemplaza Municipio
  const repMun = '<span class="span-titulo">Municipio: </span>CHIGORODO';
  let newMun   = '<span class="span-titulo">Municipio: </span>'+lObj.municipio.nombre;
  cadFinal = cadFinal.replace(repMun, newMun);
  
  //Reemplaza CCAT
  let cCat = (lObj.cedulaCatastral == undefined) ? "" : lObj.cedulaCatastral;
  const repCat = '<span class="span-titulo">C&eacute;dula Catastral: </span>147852';
  let newCat   = '<span class="span-titulo">C&eacute;dula Catastral: </span>'+cCat;
  cadFinal = cadFinal.replace(repCat, newCat);
  
  //Reemplaza Vereda
  const repVer = '<span class="span-titulo">Vereda: </span>CHIGORODO';
  let newVer   = '<span class="span-titulo">Vereda: </span>'+lObj.vereda;
  cadFinal = cadFinal.replace(repVer, newVer);
  
  //Reemplaza Direccion Actual
  const repDin = '<span class="span-titulo">Direcci&oacute;n Actual del Inmueble: </span> URBANIZACION CASABLANCA - MANZANA I LOTE 8';
  let newDin   = '<span class="span-titulo">Direcci&oacute;n Actual del Inmueble: </span> '+lObj.direccion;
  cadFinal = cadFinal.replace(repDin, newDin);
  
  //Reemplaza Direcciones Anteriores
  let repDan = '                  <span class="span-titulo">Direcciones Anteriores: </span>CALLE FALSA 123';
  repDan += '                  <ul>';
  repDan += '                      <!-- ngRepeat: dir in datosDetalle.direccionesAnteriores -->';
  repDan += '                  </ul>';
  let newDan   = '                  <span class="span-titulo">Direcciones Anteriores: </span>';
  newDan += '                  <ul>';
  
  ///Agregar Li
  if(lObj.hasOwnProperty('direccionesAnteriores')){
    
    for(i=0;i<lObj.direccionesAnteriores.length;i++){
      newDan +='<li>'+lObj.direccionesAnteriores[i]+'</li>';
    }
    
  }
  newDan += '                  </ul>';
  cadFinal = cadFinal.replace(repDan, newDan);
  
  //Reemplaza Fecha Apertura Folio
  const repAfo = '<span class="span-titulo">Fecha de Apertura del Folio: </span> 15/05/1979';
  let newAfo   = '<span class="span-titulo">Fecha de Apertura del Folio: </span> '+lObj.fechaAperturaFolio;
  cadFinal = cadFinal.replace(repAfo, newAfo);
  
  
  //Reemplaza Tipo Instrumento
  const repTin = '<span class="span-titulo">Tipo de Instrumento: </span> SIN INFORMACION';
  let newTin   = '<span class="span-titulo">Tipo de Instrumento: </span> '+lObj.tipoInstrumento;
  cadFinal = cadFinal.replace(repTin, newTin);
  
  //Reemplaza Fecha Instrumento
  const repFap = '<span class="span-titulo">Fecha de Instrumento: </span> 15/05/1979';
  let newFap   = '<span class="span-titulo">Fecha de Instrumento: </span> '+lObj.fechaInstrumento;
  cadFinal = cadFinal.replace(repFap, newFap);
  
  //Reemplaza Estado Folio
  const repEfo = '<span class="span-titulo">Estado Folio: </span> ACTIVO';
  let newEfo   = '<span class="span-titulo">Estado Folio: </span> '+lObj.estadoFolio;
  cadFinal = cadFinal.replace(repEfo, newEfo);
  
  
  //Reemplaza Matricula Matriz
  let repMma= '                  <span class="span-titulo">Matr&iacute;cula(s) Matriz: </span> ';
  repMma+= '                  <ul>';
  repMma+= '                      <!-- ngRepeat: matriz in datosDetalle.matriculasMatriz -->';
  repMma+= '                  </ul>';
  let newMma   = '                  <span class="span-titulo">Matr&iacute;cula(s) Matriz: </span> ';
  newMma += '                  <ul>';
  
  ///Agregar Li
  if(lObj.hasOwnProperty('matriculasMatriz')){
    
    for(i=0;i<lObj.matriculasMatriz.length;i++){
      newMma +='<li>'+lObj.matriculasMatriz[i]+'</li>';
    }
    
  }
  newMma += '                  </ul>';
  cadFinal = cadFinal.replace(repMma, newMma);
  
  
  //Reemplaza Matricula Derivada
  let repMde='                  <span class="span-titulo">Matr&iacute;cula(s) Derivada(s): </span> ';
  repMde+= '                  <ul>';
  repMde+= '                      <!-- ngRepeat: derivadas in datosDetalle.matriculasDerivadas -->';
  repMde+= '                  </ul>';
  let newMde   = '                  <span class="span-titulo">Matr&iacute;cula(s) Derivada(s): </span> ';
  newMde += '                  <ul>';
  
  ///Agregar Li
  if(lObj.hasOwnProperty('matriculasDerivadas')){
    
    for(i=0;i<lObj.matriculasDerivadas.length;i++){
      newMde +='<li>'+lObj.matriculasDerivadas[i]+'</li>';
    }
    
  }
  newMde += '                  </ul>';
  cadFinal = cadFinal.replace(repMde, newMde);
  
  //Reemplaza Tipo de Predio
  const repTpr = '<span class="span-titulo">Tipo de Predio: </span> U';
  let newTpr   = '<span class="span-titulo">Tipo de Predio: </span> '+lObj.tipoPredio;
  cadFinal = cadFinal.replace(repTpr, newTpr);
  
  
  //Reemplaza Alertas
  let repAle= '              <table class="table-condensed table table-striped table-bordered">';
  repAle+= '                  <thead>';
  repAle+= '                      <tr>';		
  repAle+= '                          <td>Alertas en protecci&oacute;n, restituci&oacute;n y formalizaci&oacute;n</td>';
  repAle+= '                      </tr>';
  repAle+= '                  </thead>';
  repAle+= '                  <tbody>';
  repAle+= '                      <!-- ngRepeat: registro in datosDetalle.medidasCautelares1 -->';
  repAle+= '                  </tbody>';
  repAle+= '              </table>';

  
  
  let newAle= '              <table class="table-condensed table table-striped table-bordered">';
  newAle+= '                  <thead>';
  newAle+= '                      <tr>';		
  newAle+= '                          <td>Alertas en protecci&oacute;n, restituci&oacute;n y formalizaci&oacute;n</td>';
  newAle+= '                      </tr>';
  newAle+= '                  </thead>';
  newAle+= '                  <tbody>';
  
  ///Agregar Li
  if(lObj.hasOwnProperty('medidasCautelares')){
    
    for(i=0;i<lObj.medidasCautelares.length;i++){
      newAle +='<tr><td class="alertas">'+lObj.medidasCautelares[i]+'</td></tr>';
    }
    
  }
  newAle+= '                  </tbody></table>';
  cadFinal = cadFinal.replace(repAle, newAle);
  
  //Reemplaza Propietarios
  let repPro= '                  <tbody>';
  repPro+= '                      <tr  class="ng-scope">';
  repPro+= '                          <td class="ng-binding">10936542</td>';
  repPro+= '                          <td class="ng-binding">C&eacute;DULA CIUDADAN&iacute;A</td>';
  repPro+= '                          <td class="ng-binding">HELIO MANUEL DIAZ NEGRETE </td>';
  repPro+= '                          <td class="ng-binding"></td>';
  repPro+= '                      </tr><tr pagination-id="datosPropietarios"  class="ng-scope">';
  repPro+= '                          <td class="ng-binding">26135855</td>';
  repPro+= '                          <td class="ng-binding">C&eacute;DULA CIUDADAN&iacute;A</td>';
  repPro+= '                          <td class="ng-binding">IDALIDES CASTELLAR RACINE </td>';
  repPro+= '                          <td class="ng-binding"></td>';
  repPro+= '                      </tr>';
  repPro+= '                  </tbody>';

  
  
  let newPro= '                  <tbody>';
  
  ///Agregar Li
  if(lObj.hasOwnProperty('propietarios')){
    
    for(i=0;i<lObj.propietarios.length;i++){
      newPro+= '                      <tr  class="ng-scope">';
      
      let nDoc = lObj.propietarios[i].numeroDocumento == undefined ? "":estandariza(lObj.propietarios[i].numeroDocumento);
      newPro +='<td class="ng-binding">'+nDoc+'</td>';
      
      
      let tipoDoc = lObj.propietarios[i].tipoDocumento == undefined ? "":lObj.propietarios[i].tipoDocumento;
      newPro +='<td class="ng-binding">';
      if(tipoDoc.hasOwnProperty('nombre')){
        newPro +=estandariza(tipoDoc.nombre);
      }
      newPro +='</td>';
      
      let nom = lObj.propietarios[i].nombre == undefined ? "":estandariza(lObj.propietarios[i].nombre);
      newPro +='<td class="ng-binding">'+nom+'</td>';
      
      newPro +='<td class="ng-binding"></td>';
      
      newPro+= '                      </tr>';
    }
    
  }
  newPro+= '                  </tbody>';
  cadFinal = cadFinal.replace(repPro, newPro);
  
  
  //Reemplaza Complementaciones
  let comp = lObj.complementaciones == undefined ? "":lObj.complementaciones;
  const repCom =  'COMPLEMENTACION DE LA TRADICION INSTITUTO DE CREDITO TERRITORIAL HUBO POR DACION EN PAGO A SOCIEDAD ESTUDIOS Y CONSTRUCCIONES LTDA EN ESCRITURA 6535 DEL 23-12-76 NOTARIA 5 MEDELL IN, REGISTRADA EL 08-01-77. SOCIEDAD ESTUDIOS Y CONSTRUCCIONES LTDA HUBO POR COMPRA A POSADA FERNANDEZ, RAFAEL EN ESCRITURA 3890 DEL 24-12-65 NOTARIA 5 MEDELLIN, REGISTRADA EL 24-03-66.';
  let newCom   = comp;
  cadFinal = cadFinal.replace(repCom, newCom);
  
  //Reemplaza Linderos
  let lind = lObj.linderos == undefined ? "":lObj.linderos;
  const repLin ='                  143, 10 M2. ### POR EL NOROESTE, EN UNA LONGITUD DE 17,95 MTS. CON EL LOTE # 7; POR EL SURESTE: EN UNA LONGITUD DE 7, 95 MTS. CON LA CALLE #8; POR EL NOROESTE: EN UNA LONGITUD DE 7,95 MTS. CON EL LOTE # 22; Y POR EL SUROESTE: EN UNA LONGITUD DE 17,95 MTS. CON EL LOTE # 9 DE LA MISMA MANZANA ##.';
  let newLin   = lind;
  cadFinal = cadFinal.replace(repLin, newLin);
  
  //Reemplaza Salvedades
  let repSal= '              <table class="table-condensed table table-striped table-bordered">';
  repSal+= '                  <thead>';
  repSal+= '                      <tr>';					
  repSal+= '                          <td>N&Uacute;MERO DE ANOTACI&Oacute;N</td>';
  repSal+= '                          <td>N&Uacute;MERO DE CORRECCI&Oacute;N</td>';
  repSal+= '                          <td>RADICACI&Oacute;N DE ANOTACI&Oacute;N</td>';
  repSal+= '                          <td>FECHA DE SALVEDAD</td>';
  repSal+= '                          <td>RADICACI&Oacute;N DE SALVEDAD</td>';
  repSal+= '                          <td>DESCRIPCI&Oacute;N SALVEDAD FOLIO</td>';
  repSal+= '                          <td>COMENTARIO SALVEDAD FOLIO</td>';
  repSal+= '                      </tr>';
  repSal+= '                  </thead>';
  repSal+= '                  <tbody>';                
  repSal+= '                  </tbody>';
  repSal+= '              </table>';

  
  
  let newSal= '              <table class="table-condensed table table-striped table-bordered">';
  newSal+= '                  <thead>';
  newSal+= '                      <tr>';					
  newSal+= '                          <td>N&Uacute;MERO DE ANOTACI&Oacute;N</td>';
  newSal+= '                          <td>N&Uacute;MERO DE CORRECCI&Oacute;N</td>';
  newSal+= '                          <td>RADICACI&Oacute;N DE ANOTACI&Oacute;N</td>';
  newSal+= '                          <td>FECHA DE SALVEDAD</td>';
  newSal+= '                          <td>RADICACI&Oacute;N DE SALVEDAD</td>';
  newSal+= '                          <td>DESCRIPCI&Oacute;N SALVEDAD FOLIO</td>';
  newSal+= '                          <td>COMENTARIO SALVEDAD FOLIO</td>';
  newSal+= '                      </tr>';
  newSal+= '                  </thead>';
  newSal+= '                  <tbody>';                
  
  
  ///Agregar Li
  if(lObj.hasOwnProperty('salvedades')){
    
    for(i=0;i<lObj.salvedades.length;i++){
      newSal+= '                      <tr  class="ng-scope">';
      
      let nAno = lObj.salvedades[i].numeroAnotacion == undefined ? "":estandariza(lObj.salvedades[i].numeroAnotacion);
      newSal +='<td class="ng-binding">'+nAno+'</td>';
      
      let nCor = lObj.salvedades[i].numeroCorreccion == undefined ? "":estandariza(lObj.salvedades[i].numeroCorreccion);
      newSal +='<td class="ng-binding">'+nCor+'</td>';
      
      let rAno = lObj.salvedades[i].radicacionAnotacion == undefined ? "":estandariza(lObj.salvedades[i].radicacionAnotacion);
      newSal +='<td class="ng-binding">'+rAno+'</td>';
      
      let fSal = lObj.salvedades[i].fechaSalvedad == undefined ? "":estandariza(lObj.salvedades[i].fechaSalvedad);
      newSal +='<td class="ng-binding">'+fSal+'</td>';
      
      let dSal = lObj.salvedades[i].descripcion == undefined ? "":estandariza(lObj.salvedades[i].descripcion);
      newSal +='<td class="ng-binding">'+dSal+'</td>';
      
      let dCom = lObj.salvedades[i].comentario == undefined ? "":estandariza(lObj.salvedades[i].comentario);
      newSal +='<td class="ng-binding">'+dCom+'</td>';
      
      newSal +='<td class="ng-binding"></td>';
      
      newSal+= '                      </tr>';
    }
    
  }
  newSal+= '                  </tbody>';
  newSal+= '              </table>';
  cadFinal = cadFinal.replace(repSal, newSal);
  
  
  //Descargar html VUR DB
  download(cadFinal,fmi+"DB.html","text/html");
  
  
  //agregar json

  //Replaza json
  //
  //
  
  let jsonCadena= '	<div id="json"> </div>';  
  
  let newJson   = '<div id="json">'+ "<br>"+JSON.stringify(obj) +'</div>';
  cadFinal = cadFinal.replace(jsonCadena, newJson);
  //console.log(cadFinal);
  download(cadFinal,fmi+"DB_FULLDATA.html","text/html");
  //htmlToPdf(cadFinal, fmi, "EJ");
      
  
  
  
  return true;
}

function estandariza(cadena){
  let str = cadena;
  
  return str.replace("á","&aacute;").replace("é","&eacute;").replace("í","&iacute;").replace("ó","&oacute;").replace("ú","&uacute;").replace("Á","&Aacute;").replace("É","&Eacute;").replace("Í","&Iacute;").replace("Ó","&Oacute;").replace("Ú","&Uacute;").replace("°","&deg;");
  
  
}

function  htmlTextDB(){
  
  cadena= '<html xmlns="http://www.w3.org/1999/xhtml"><head>';
  cadena+= '      <title>-VUR';
  cadena+= '      </title>';
  cadena+= '      <meta http-equiv="Content-Type" content="text/html;charset=iso-8859-1"> ';
  cadena+= '      <!-- Latest compiled and minified CSS -->';
  cadena+= '      <!-- <link rel="stylesheet" href="/portal/css/bootstrap.min.css"> -->';
  cadena+= '		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';

        
  cadena+= '      <link rel="stylesheet" href="https://www.vur.gov.co/portal/css/bootstrap-theme.min.css">';
  cadena+= '      <link rel="stylesheet" href="https://www.vur.gov.co/portal/css/vur.css">';
		
  cadena+= '		<link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/libraries/bootstrap.min.css">';
  cadena+= '      <link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/libraries/font-awesome.min.css">';
  cadena+= '      <link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/libraries/abn_tree.css">';
  cadena+= '      <link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/main.css">';
  cadena+= '      <link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/print.css" media="print">';

       
  cadena+= '      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>';
  cadena+= '      <!-- Latest compiled JavaScript -->';
  cadena+= '      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>';

  cadena+= '      <script src="https://www.vur.gov.co/portal/js/vur.js"></script>';
  cadena+= '		<link type="text/css" rel="stylesheet" href="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/blueSky/skinning.css">';
  cadena+= '		<script type="text/javascript" src="https://www.vur.gov.co/portal/javax.faces.resource/jsf.js.jsf?ln=javax.faces"></script>';
  cadena+= '		<script type="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/jquery.js"></script>';
  cadena+= '		<script type="text/javascript" src="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/packed/packed.js"></script>';
  cadena+= '		<link type="text/css" rel="stylesheet" href="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/blueSky/packed/packed.css">';
  
  //cadena+= '<style>';
  //cadena+= '@media print {';
  //cadena+= 'a[href]:after {';
  //cadena+= 'content: none !important;';
  //cadena+= '}';
  //cadena+= '}';
  //cadena+= '</style>';
		
  cadena+= '		</head><body><span id="loadingStatus"><span style="display:none" class="rf-st-start"></span><span class="rf-st-stop"></span>';
		
  cadena+= '		</span><div id="loadingPanel" style="visibility: hidden;"><div class="rf-pp-shade" id="loadingPanel_shade" style="z-index:100;"><button class="rf-pp-btn" id="loadingPanelFirstHref" name="loadingPanelfirstHref"></button></div><div class="rf-pp-cntr " id="loadingPanel_container" style="position: fixed; z-index:100; "><div class="rf-pp-shdw" id="loadingPanel_shadow" style="opacity: 0.1;"></div><div class="rf-pp-cnt-scrlr" id="loadingPanel_content_scroller"><div class="rf-pp-cnt" id="loadingPanel_content">';
  cadena+= '		<div style="padding-top: 10px; padding-bottom: 10px; text-align: center; font-size: 12px; font-weight: bold;">Procesando informaci&oacute;n...';
  cadena+= '		</div>';
  cadena+= '		<div style="padding-bottom: 10px; text-align: center;"><img src="/portal/resources/images/loading.gif">';
  cadena+= '		</div></div></div></div>';
  cadena+= '		</div>';
  cadena+= '       <div id="container">';
  cadena+= '  <div id="header">';
  cadena+= '      <div class="row" style="margin-left: 15px; margin-right: 15px;">';
  cadena+= '          <div class="col-lg-6"><img src="https://www.vur.gov.co/portal/resources/images/image_header_vur.png" style="height: 80px; padding-left: 15px;">';
  cadena+= '          </div>';
  cadena+= '          <div class="col-lg-6">';
  cadena+= '              <div class="row pull-right"><img src="https://www.vur.gov.co/portal/resources/images/LogoSNR.png" style="height: 80px; padding-left: 15px;"><img src="https://www.vur.gov.co/portal/resources/images/LogoMinJusticia.png" style="height: 80px; padding-left: 15px;"><img src="https://www.vur.gov.co/portal/resources/images/LogoNuevoPais.png" style="height: 80px; padding-left: 15px;">';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '  <div id="menu">';
  cadena+= '      <nav class="navbar navbar-default" role="navigation">';
  cadena+= '          <!-- El logotipo y el icono que despliega el men&uacute; se agrupan';
  cadena+= '               para mostrarlos mejor en los dispositivos m&oacute;viles -->';
  cadena+= '          <div class="navbar-header">';
  cadena+= '          </div>';

  cadena+= '          <div class="collapse navbar-collapse navbar-ex1-collapse">';
  cadena+= '              <ul class="nav navbar-nav" id="menu-navegacion"><li>';
  cadena+= '<a target="_blank" href="/portal/pages/vur/inicio.jsf">Noticias</a></li><li>';
  cadena+= '<a href="#" >Gestion de Usuario</a></li><li class="dropdown">';
  cadena+= '<a href="%23" class="dropdown-toggle" data-toggle="dropdown">Consultas<b class="caret"></b></a><ul class="dropdown-menu">';
  cadena+= '<li class="dropdown-submenu"><a target="_blank" href="#">Consultas Jur&iacute;dicas</a><ul class="dropdown-menu"><li><a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2F%3Ftipo%3DdatosBasicosTierras">Datos b&aacute;sicos del inmueble</a></li><li><a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2F%3Ftipo%3DestadoJuridicoTierras">Estado jur&iacute;dico del Inmueble</a></li></ul></li></ul></li><li>';
  cadena+= '<a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2FestadoTramite">Estado del Tr&aacute;mite</a></li><li>';
  cadena+= '<a href="/portal/logout">Salir</a></li></ul>';

  cadena+= '              <ul class="nav navbar-nav navbar-right">';
  cadena+= '                  <li>';
  cadena+= '                      <div class="small">';
  cadena+= '                          <div class="col-sm-2"><span style="font-weight: bold;">Bienvenido:</span></div>';
  cadena+= '                          <div class="col-sm-10"><span id="menu-nombre" style="font-weight: bold;">Diego  Alejandro  Romero Suarez</span><br>';
  cadena+= '                              <span id="menu-ciudad"></span><br>';
  cadena+= '                              <span id="menu-entidad"></span><br>';
  cadena+= '                              IP: <span id="menu-ip">181.57.231.29, 192.168.76.102</span> / Fecha: <span id="menu-fecha">17/10/2019 09:20:56 AM</span></div>';
  cadena+= '                      </div>    ';
  cadena+= '                 </li>';
  cadena+= '              </ul>';
  cadena+= '          </div>';
  cadena+= '      </nav> ';
  
            
  cadena+= '			<div id="content">';
  cadena+= '              <div id="page-content" style="padding: 0px;">';
  cadena+= '          <div id="page" name="page"  style="height: 5000px">';
			
			
  cadena+= '			<!-- AQUI COMENZA EL CUERPO -->';


  cadena+= '  <div class="panel panel-primary datos-basicos" ng-show="pantallaDatosBasicos">';
  cadena+= '      <div class="panel-heading" style="color:white;">Datos B&aacute;sicos - Certificado de Tradici&oacute;n y Libertad</div>';
  cadena+= '      <div class="panel-body">';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Fecha: </span>17/10/2019';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Hora: </span>09:21 AM';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">No. Consulta: </span>165364626';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">N&deg; Matr&iacute;cula Inmobiliar&iacute;a: </span>008-150';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-8 col-lg-8 ng-binding">';
  cadena+= '                  <span class="span-titulo">Referencia Catastral: </span>123456';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Departamento: </span>ANTIOQUIA';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-8 col-lg-8 ng-binding">';
  cadena+= '                  <span class="span-titulo">Referencia Catastral Anterior: </span>789321';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                 <span class="span-titulo">Municipio: </span>CHIGORODO';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-8 col-lg-8 ng-binding">';
  cadena+= '                  <span class="span-titulo">C&eacute;dula Catastral: </span>147852';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-md-4 col-lg-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Vereda: </span>CHIGORODO';
  cadena+= '              </div>';
  cadena+= '              <div class="col-md-4 col-lg-4"></div>';
  cadena+= '              <div class="col-md-4 col-lg-4"></div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  
    cadena+= '			</div>';
  
  cadena+= '  <div class="panel panel-primary datos-basicos" ng-show="pantallaDatosBasicos">';
  cadena+= '      <div class="panel-body">';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12 ng-binding">';
  cadena+= '                  <span class="span-titulo">Direcci&oacute;n Actual del Inmueble: </span> URBANIZACION CASABLANCA - MANZANA I LOTE 8';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12">';
  cadena+= '                  <span class="span-titulo">Direcciones Anteriores: </span>CALLE FALSA 123';
  cadena+= '                  <ul>';
  cadena+= '                      <!-- ngRepeat: dir in datosDetalle.direccionesAnteriores -->';
  cadena+= '                  </ul>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="col-lg-4 col-md-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Fecha de Apertura del Folio: </span> 15/05/1979';
  cadena+= '              </div>';
  cadena+= '              <div class="col-lg-4 col-md-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Tipo de Instrumento: </span> SIN INFORMACION';
  cadena+= '              </div>';
  cadena+= '              <div class="col-lg-4 col-md-4 ng-binding">';
  cadena+= '                  <span class="span-titulo">Fecha de Instrumento: </span> 15/05/1979';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12 ng-binding">';
  cadena+= '                  <span class="span-titulo">Estado Folio: </span> ACTIVO';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12">';
  cadena+= '                  <span class="span-titulo">Matr&iacute;cula(s) Matriz: </span> ';
  cadena+= '                  <ul>';
  cadena+= '                      <!-- ngRepeat: matriz in datosDetalle.matriculasMatriz -->';
  cadena+= '                  </ul>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12">';
  cadena+= '                  <span class="span-titulo">Matr&iacute;cula(s) Derivada(s): </span> ';
  cadena+= '                  <ul>';
  cadena+= '                      <!-- ngRepeat: derivadas in datosDetalle.matriculasDerivadas -->';
  cadena+= '                  </ul>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <div class="col-lg-12 col-md-12 ng-binding">';
  cadena+= '                  <span class="span-titulo">Tipo de Predio: </span> U';
  cadena+= '              </div>';
  cadena+= '          </div>';
  
  
  
  cadena+= '          <div class="row" ng-show="tierras">';
  cadena+= '              <h3>Alertas en protecci&oacute;n, restituci&oacute;n y formalizaci&oacute;n</h3>';
  cadena+= '              <hr>';
  cadena+= '              <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                  <thead>';
  cadena+= '                      <tr>';		
  cadena+= '                          <td>Alertas en protecci&oacute;n, restituci&oacute;n y formalizaci&oacute;n</td>';
  cadena+= '                      </tr>';
  cadena+= '                  </thead>';
  cadena+= '                  <tbody>';
  cadena+= '                      <!-- ngRepeat: registro in datosDetalle.medidasCautelares1 -->';
  cadena+= '                  </tbody>';
  cadena+= '              </table>';
  cadena+= '          </div>';
  cadena+= '          <div class="row" ng-show="tierras">';
  cadena+= '              <h3>Alertas comunicaciones, suspensiones y acumulaciones procesales</h3>';
  cadena+= '              <hr>';
  cadena+= '              <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                  <thead>';
  cadena+= '                      <tr>';		
  cadena+= '                          <td>ORIGEN</td>';
  cadena+= '                          <td>DESCRIPCI&Oacute;N</td>';
  cadena+= '                          <td>FECHA</td>';
  cadena+= '                          <td>DOCUMENTO</td>';
  cadena+= '                      </tr>';
  cadena+= '                  </thead>';
  cadena+= '                  <tbody>';
                        
  cadena+= '                 </tbody>';
  cadena+= '              </table>';
  cadena+= '          </div>';
  
  
 cadena+= '          <div class="row single-child">';
  cadena+= '              <h3>Propietarios</h3>';
  cadena+= '              <hr>';
  cadena+= '              <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                  <thead>';
  cadena+= '                      <tr>';		
  cadena+= '                          <td>N&Uacute;MERO DOCUMENTO</td>';
  cadena+= '                          <td>TIPO IDENTIFICACI&Oacute;N</td>';
  cadena+= '                          <td>NOMBRES-APELLIDOS (RAZ&Oacute;N SOCIAL)</td>';
  cadena+= '                          <td>PARTICIPACI&Oacute;N</td>';
  cadena+= '                      </tr>';
  cadena+= '                  </thead>';
  cadena+= '                  <tbody>';
  cadena+= '                      <tr  class="ng-scope">';
  cadena+= '                          <td class="ng-binding">10936542</td>';
  cadena+= '                          <td class="ng-binding">C&eacute;DULA CIUDADAN&iacute;A</td>';
  cadena+= '                          <td class="ng-binding">HELIO MANUEL DIAZ NEGRETE </td>';
  cadena+= '                          <td class="ng-binding"></td>';
  cadena+= '                      </tr><tr pagination-id="datosPropietarios"  class="ng-scope">';
  cadena+= '                          <td class="ng-binding">26135855</td>';
  cadena+= '                          <td class="ng-binding">C&eacute;DULA CIUDADAN&iacute;A</td>';
  cadena+= '                          <td class="ng-binding">IDALIDES CASTELLAR RACINE </td>';
  cadena+= '                          <td class="ng-binding"></td>';
  cadena+= '                      </tr>';
  cadena+= '                  </tbody>';
  cadena+= '              </table>';
  cadena+= '              <dir-pagination-controls max-size="5" direction-links="true" boundary-links="true" pagination-id="datosPropietarios" class="ng-isolate-scope"></dir-pagination-controls>';
  cadena+= '          </div>';

  cadena+= '          <div class="row single-child">';
  cadena+= '              <h3>Complementaciones</h3>';
  cadena+= '              <hr>';
  cadena+= '              <div class="col-lg-11 col-md-11 pull-right ng-binding">';
  cadena+= '                  COMPLEMENTACION DE LA TRADICION INSTITUTO DE CREDITO TERRITORIAL HUBO POR DACION EN PAGO A SOCIEDAD ESTUDIOS Y CONSTRUCCIONES LTDA EN ESCRITURA 6535 DEL 23-12-76 NOTARIA 5 MEDELL IN, REGISTRADA EL 08-01-77. SOCIEDAD ESTUDIOS Y CONSTRUCCIONES LTDA HUBO POR COMPRA A POSADA FERNANDEZ, RAFAEL EN ESCRITURA 3890 DEL 24-12-65 NOTARIA 5 MEDELLIN, REGISTRADA EL 24-03-66.';
  cadena+= '              </div>';
  cadena+= '          </div>';

  cadena+= '          <div class="row single-child">';
  cadena+= '              <h3>Cabidad y Linderos</h3>';
  cadena+= '              <hr>';
  cadena+= '              <div class="col-lg-11 col-md-11 pull-right ng-binding">';
  cadena+= '                  143, 10 M2. ### POR EL NOROESTE, EN UNA LONGITUD DE 17,95 MTS. CON EL LOTE # 7; POR EL SURESTE: EN UNA LONGITUD DE 7, 95 MTS. CON LA CALLE #8; POR EL NOROESTE: EN UNA LONGITUD DE 7,95 MTS. CON EL LOTE # 22; Y POR EL SUROESTE: EN UNA LONGITUD DE 17,95 MTS. CON EL LOTE # 9 DE LA MISMA MANZANA ##.';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <h3>Salvedades</h3>';
  cadena+= '              <hr>';
  cadena+= '              <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                  <thead>';
  cadena+= '                      <tr>';					
  cadena+= '                          <td>N&Uacute;MERO DE ANOTACI&Oacute;N</td>';
  cadena+= '                          <td>N&Uacute;MERO DE CORRECCI&Oacute;N</td>';
  cadena+= '                          <td>RADICACI&Oacute;N DE ANOTACI&Oacute;N</td>';
  cadena+= '                          <td>FECHA DE SALVEDAD</td>';
  cadena+= '                          <td>RADICACI&Oacute;N DE SALVEDAD</td>';
  cadena+= '                          <td>DESCRIPCI&Oacute;N SALVEDAD FOLIO</td>';
  cadena+= '                          <td>COMENTARIO SALVEDAD FOLIO</td>';
  cadena+= '                      </tr>';
  cadena+= '                  </thead>';
  cadena+= '                  <tbody>';
                        
  cadena+= '                  </tbody>';
  cadena+= '              </table>';
  cadena+= '          </div>';
  cadena+= '          <div class="row single-child">';
  cadena+= '              <h3>Tr&aacute;mites en Curso</h3>';
  cadena+= '              <hr>';
  cadena+= '              <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                  <thead>';
  cadena+= '                      <tr>';
  cadena+= '                          <td>RADICADO</td>';
  cadena+= '                          <td>TIPO</td>';
  cadena+= '                          <td>FECHA</td>';
  cadena+= '                          <td>ENTIDAD ORIGEN</td>';
  cadena+= '                          <td>CIUDAD</td>';
  cadena+= '                      </tr>';
  cadena+= '                  </thead>';
  cadena+= '                  <tbody>';
                        
						
  cadena+= '                  </tbody>';
  cadena+= '              </table>';
  cadena+= '          </div>';
  cadena+= '          <div class="panel panel-primary single-child" id="aclaracion">';
  cadena+= '              <div class="panel-body">';
  cadena+= '                  <h3>IMPORTANTE</h3>';
  cadena+= '                  Tenga en cuenta que si usted est&aacute; consultando un predio que ha sido objeto de venta(s) parciales y tiene m&uacute;ltiples propietarios, el resultado de la consulta reflejar&aacute; &uacute;nicamente el propietario o los propietarios que intervinieron en la &uacute;ltima venta parcial.';
  cadena+= '                  <br>';
  cadena+= '                  En caso de constituci&oacute;n de usufructo el sistema reflejar&aacute; como propietario a los beneficiarios de dicho acto.';
  cadena+= '	<div id="json"> </div>';  
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  

  cadena+= '  <div id="propietariosModal" class="modal fade" tabindex="-1" role="dialog">';
  cadena+= '      <div class="modal-dialog">';
  cadena+= '          <div class="modal-content">';
  cadena+= '              <div class="modal-header">';
  cadena+= '                  <button type="button" class="close" data-dismiss="modal">×</button>';
  cadena+= '                  <h4 class="modal-title">Propietarios</h4>';
  cadena+= '             </div>';
  cadena+= '              <div class="modal-body">';
  cadena+= '                  <div class="row">';
  cadena+= '                      <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                          <thead>';
  cadena+= '                              <tr>	';	
  cadena+= '                                  <td>N&uacute;MERO DOCUMENTO</td>';
  cadena+= '                                  <td>TIPO IDENTIFICACI&Oacute;N</td>';
  cadena+= '                                  <td>PROPIETARIO</td>';
  cadena+= '                              </tr>';
  cadena+= '                          </thead>';
  cadena+= '                          <tbody>';
                               
  cadena+= '                          </tbody>';
  cadena+= '                      </table>';
  cadena+= '                      <dir-pagination-controls max-size="8" direction-links="true" boundary-links="true" pagination-id="indicePropietarios" class="ng-isolate-scope"><';
  cadena+= '					</dir-pagination-controls>';
  cadena+= '                  </div>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '  <div class="panel panel-primary panel-botones" ng-hide="pantallaFiltros">';
  cadena+= '      <div class="panel-body">';
  cadena+= '          <div class="row">';
  cadena+= '              <div class="btn-group pull-right">';
                    
  cadena+= '                  <button class="btn btn-danger" ng-click="reiniciar()">Buscar Inmueble</button>';
  cadena+= '              </div>';
  cadena+= '          </div> ';
  cadena+= '      </div>';
  
  cadena+= '  </div>';
  
  cadena+= '</div></div>';
  
     
  
  cadena+= '      <div id="esperaModal" class="modal fade" style="display: none;">';
  cadena+= '          <div class="modal-dialog">';
  cadena+= '              <div class="modal-content">';
  cadena+= '                  <div class="modal-body">';
  cadena+= '                      <div class="row">';
  cadena+= '                          <div class="col-lg-4 col-md-4 col-sm-6"><img src="img/loading_spinner.gif" style="width: 70px"></div>';
  cadena+= '                          <div class="col-lg-8 col-md-8 col-sm-6">Por favor espere mientras consultamos su informaci&oacute;n</div>';
  cadena+= '                      </div>';
  cadena+= '                  </div>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
        
  cadena+= '      <script type="text/javascript" src="./js/main.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/controllers/mainCtrl.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/routes.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/vendor/abn_tree_directive.js"></script>';
			
  cadena+= '			<!-- AQUI TERMINA EL CUERPO -->';
		
			

  cadena+= '              </div>';
  cadena+= '          </div>';
			
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '</body></html>';
  return cadena;
  
}

function htmlTextEJ(){
  
  cadena= '<html xmlns="http://www.w3.org/1999/xhtml"><head>';
  cadena+= '     <title>-VUR';
  cadena+= '      </title>';
  cadena+= '      <meta http-equiv="Content-Type" content="text/html;charset=iso-8859-1"> ';
  cadena+= '      <!-- Latest compiled and minified CSS -->';
  cadena+= '      <link rel="stylesheet" href="https://www.vur.gov.co/portal/css/bootstrap.min.css">';

  cadena+= '      <!-- Optional theme -->';
  cadena+= '      <link rel="stylesheet" href="https://www.vur.gov.co/portal/css/bootstrap-theme.min.css">';
  cadena+= '      <link rel="stylesheet" href="https://www.vur.gov.co/portal/css/vur.css">';
		
  cadena+= '	<link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/libraries/font-awesome.min.css">';
  cadena+= '		<link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/libraries/abn_tree.css">';
  cadena+= '	<link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/main.css">';
  cadena+= '		<link rel="stylesheet" type="text/css" href="https://www.vur.gov.co/portal/PantallasVUR/css/print.css" media="print">';

  cadena+= '      <!-- Latest compiled and minified JavaScript -->';
  cadena+= '      <script src="https://www.vur.gov.co/portal/js/jquery-3.1.0.min.js"></script>';
  cadena+= '      <script src="https://www.vur.gov.co/portal/js/bootstrap.min.js"></script>';

  cadena+= '      <script src="https://www.vur.gov.co/portal/js/bootstrap.min.js"></script>';
  cadena+= '		<link type="text/css" rel="stylesheet" href="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/blueSky/skinning.css">';
  cadena+= '		<script type="text/javascript" src="https://www.vur.gov.co/portal/javax.faces.resource/jsf.js.jsf?ln=javax.faces"></script>';
  cadena+= '		<script type="text/javascript" src="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/jquery.js"></script>';
  cadena+= '		<script type="text/javascript" src="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/packed/packed.js"></script>';
  cadena+= '		<link type="text/css" rel="stylesheet" href="https://www.vur.gov.co/portal/org.richfaces.resources/javax.faces.resource/org.richfaces.staticResource/4.3.7.Final/PackedCompressed/blueSky/packed/packed.css">';
		
  cadena+= '		</head>';
  cadena+= '		<body><span id="loadingStatus"><span style="display:none" class="rf-st-start"></span>';
  cadena+= '		<span class="rf-st-stop"></span>';
		
  cadena+= '		</span><div id="loadingPanel" style="visibility: hidden;"><div class="rf-pp-shade" id="loadingPanel_shade" style="z-index:100;"><button class="rf-pp-btn" id="loadingPanelFirstHref" name="loadingPanelfirstHref"></button></div><div class="rf-pp-cntr " id="loadingPanel_container" style="position: fixed; z-index:100; "><div class="rf-pp-shdw" id="loadingPanel_shadow" style="opacity: 0.1;"></div><div class="rf-pp-cnt-scrlr" id="loadingPanel_content_scroller"><div class="rf-pp-cnt" id="loadingPanel_content">';
  cadena+= '		<div style="padding-top: 10px; padding-bottom: 10px; text-align: center; font-size: 12px; font-weight: bold;">Procesando información...';
  cadena+= '		</div>';
  cadena+= '		<div style="padding-bottom: 10px; text-align: center;"><img src="/portal/resources/images/loading.gif">';
  cadena+= '		</div></div></div></div><script type="text/javascript"></script></div>';
  cadena+= '      <div id="container">';
  cadena+= '  <div id="header">';
  cadena+= '      <div class="row" style="margin-left: 15px; margin-right: 15px;">';
  cadena+= '          <div class="col-lg-6"><img src="https://www.vur.gov.co/portal/resources/images/image_header_vur.png" style="height: 80px; padding-left: 15px;">';
  cadena+= '          </div>';
  cadena+= '          <div class="col-lg-6">';
  cadena+= '              <div class="row pull-right"><img src="https://www.vur.gov.co/portal/resources/images/LogoSNR.png" style="height: 80px; padding-left: 15px;"><img src="https://www.vur.gov.co/portal/resources/images/LogoMinJusticia.png" style="height: 80px; padding-left: 15px;"><img src="https://www.vur.gov.co/portal/resources/images/LogoNuevoPais.png" style="height: 80px; padding-left: 15px;">';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '  <div id="menu">';
  cadena+= '      <nav class="navbar navbar-default" role="navigation">';
  cadena+= '          <!-- El logotipo y el icono que despliega el men&uacute; se agrupan';
  cadena+= '               para mostrarlos mejor en los dispositivos m&oacute;viles -->';
  cadena+= '          <div class="navbar-header">';
  cadena+= '          </div>';

  cadena+= '          <div class="collapse navbar-collapse navbar-ex1-collapse">';
  cadena+= '              <ul class="nav navbar-nav" id="menu-navegacion"><li>';
  cadena+= '<a target="_blank" href="/portal/pages/vur/inicio.jsf">Noticias</a></li><li>';
  cadena+= '<a href="#" ); return false;">Gestion de Usuario</a></li><li class="dropdown">';
  cadena+= '<a href="%23" class="dropdown-toggle" data-toggle="dropdown">Consultas<b class="caret"></b></a><ul class="dropdown-menu"><li class="dropdown-submenu"><a target="_blank" href="#">Consultas Jur&iacute;dicas</a><ul class="dropdown-menu"><li><a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2F%3Ftipo%3DdatosBasicosTierras">Datos b&aacute;sicos del inmueble</a></li><li><a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2F%3Ftipo%3DestadoJuridicoTierras">Estado jur&iacute;dico del Inmueble</a></li></ul></li></ul></li><li>';
  cadena+= '<a href="/portal/pages/vur/inicio.jsf?url=%2Fportal%2FPantallasVUR%2F%23%2FestadoTramite">Estado del Tr&aacute;mite</a></li><li>';
  cadena+= '<a href="/portal/logout">Salir</a></li></ul>';

  cadena+= '              <ul class="nav navbar-nav navbar-right">';
  cadena+= '                  <li>';
  cadena+= '                      <div class="small">';
  cadena+= '                          <div class="col-sm-2"><span style="font-weight: bold;">Bienvenido:</span></div>';
  cadena+= '                          <div class="col-sm-10"><span id="menu-nombre" style="font-weight: bold;">Diego  Alejandro  Romero Suarez</span><br>';
  cadena+= '                              <span id="menu-ciudad"></span><br>';
  cadena+= '                              <span id="menu-entidad"></span><br>';
  cadena+= '                              IP: <span id="menu-ip">181.57.231.29, 192.168.76.102</span> / Fecha: <span id="menu-fecha">17/10/2019 12:31:48 PM</span></div>';
  cadena+= '                       </div>';    
  cadena+= '                  </li>';
  cadena+= '              </ul>';
  cadena+= '          </div>';
  cadena+= '      </nav> ';
  cadena+= '  </div>';
  cadena+= '          <div id="content">';
  cadena+= '              <div id="page-content" style="padding: 0px;">';
  cadena+= '            <div id="page" name="page" style="height: 5000px">';
			
  cadena+= '	   <!-- ngView:  --><div ng-view="" class="wrapper ng-scope"><div class="ng-scope">';
  cadena+= '       </div>';
  cadena+= '  <div class="panel panel-primary" ng-show="pantallaDatosJuridicos">';
  cadena+= '      <div class="panel-heading" style="color:white;">Estado Jur&iacute;dico del Inmueble</div>';
  cadena+= '      <div class="panel-body">';
  cadena+= '          <div class="col-md-4 ng-binding">';
  cadena+= '              <b>Fecha:</b> 17/10/2019';
  cadena+= '          </div>';
  cadena+= '          <div class="col-md-4 ng-binding">';
  cadena+= '              <b>Hora:</b> 12:32 PM';
  cadena+= '          </div>';
  cadena+= '          <div class="col-md-4 ng-binding">';
  cadena+= '              <b>No. Consulta: </b> 165428805';
  cadena+= '          </div> ';
  cadena+= '          <div class="col-md-4 ng-binding">';
  cadena+= '              <b>No. Matricula Inmobiliaria: </b> 008-8020';
  cadena+= '          </div>';
  cadena+= '          <div class="col-md-8 ng-binding">';
  cadena+= '              <b>Referencia Catastral: </b> 123456';
  cadena+= '          </div>';

  cadena+= '      </div>';
  cadena+= ' </div>';
  
  cadena+= '  <div id="json">';
  cadena+= ' </div>';
  
  cadena+= '  <div class="panel panel-primary" ng-show="pantallaDatosJuridicos">';
        

  cadena+= '          <div class="tabbable ng-isolate-scope"><ul class="nav nav-tabs"><!-- ngRepeat: pane in panes --><li ng-repeat="pane in panes" ng-class="{active:pane.selected}" class="ng-scope"><a href="" ng-click="select(pane)" class="ng-binding">Arbol</a></li><!-- end ngRepeat: pane in panes --><li ng-repeat="pane in panes" ng-class="{active:pane.selected}" class="ng-scope active"><a href="" ng-click="select(pane)" class="ng-binding">Lista</a></li><!-- end ngRepeat: pane in panes --></ul><div class="tab-content" ng-transclude="">';
  cadena+= '              <div class="tab-pane ng-scope ng-isolate-scope" ng-class="{active: selected}" ng-transclude="" title="Arbol">';
  cadena+= '                  <div class="row ng-scope">';
  cadena+= '                      <ul class="nav nav-list nav-pills nav-stacked abn-tree ng-isolate-scope" tree-data="datosJuridicos.arbolAnotaciones" expand-level="0">';
  cadena+= '<!-- ngRepeat: row in tree_rows | filter:{visible:true} track by row.branch.uid --><li ng-repeat="row in tree_rows | filter:{visible:true} track by row.branch.uid" ng-animate="\'abn-tree-animate\'" ng-class="\'level-\' + 1 + (row.branch.selected ? \' active\':\'\') + \' \' +row.classes.join(\' \')" class="abn-tree-row ng-scope level-1"><a ng-click="user_clicks_branch(row.branch)"><i ng-class="row.tree_icon" ng-click="row.branch.expanded = !row.branch.expanded" class="indented tree-icon icon-plus glyphicon glyphicon-plus fa fa-plus"> </i><span class="indented tree-label ng-binding">LOTEO </span></a></li><!-- end ngRepeat: row in tree_rows | filter:{visible:true} track by row.branch.uid --><li ng-repeat="row in tree_rows | filter:{visible:true} track by row.branch.uid" ng-animate="\'abn-tree-animate\'" ng-class="\'level-\' + 1 + (row.branch.selected ? \' active\':\'\') + \' \' +row.classes.join(\' \')" class="abn-tree-row ng-scope level-1"><a ng-click="user_clicks_branch(row.branch)"><i ng-class="row.tree_icon" ng-click="row.branch.expanded = !row.branch.expanded" class="indented tree-icon icon-plus glyphicon glyphicon-plus fa fa-plus"> </i><span class="indented tree-label ng-binding">COMPRAVENTA </span></a></li><!-- end ngRepeat: row in tree_rows | filter:{visible:true} track by row.branch.uid --><li ng-repeat="row in tree_rows | filter:{visible:true} track by row.branch.uid" ng-animate="\'abn-tree-animate\'" ng-class="\'level-\' + 1 + (row.branch.selected ? \' active\':\'\') + \' \' +row.classes.join(\' \')" class="abn-tree-row ng-scope level-1"><a ng-click="user_clicks_branch(row.branch)"><i ng-class="row.tree_icon" ng-click="row.branch.expanded = !row.branch.expanded" class="indented tree-icon icon-plus glyphicon glyphicon-plus fa fa-plus"> </i><span class="indented tree-label ng-binding">OTROS </span></a></li><!-- end ngRepeat: row in tree_rows | filter:{visible:true} track by row.branch.uid -->';
  cadena+= '</ul>';
  cadena+= '                  </div>';
  cadena+= '              </div>';
  cadena+= '              <div class="tab-pane ng-scope ng-isolate-scope active" ng-class="{active: selected}" ng-transclude="" title="Lista">';
  cadena+= '                    <!-- ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  cadena+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 1 Fecha: 16-10-1998 Radicación: 1363<br>Doc: ESCRITURA 1066 DEL 1997-12-30 00:00:00  NOTARIA UNICA DE CHIGORODO          VALOR ACTO: $<br>ESPECIFICACION: 911 LOTEO';

  cadena+= '(OTRO)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>A: RAMIREZ PEREZ LUIS GERARDO    X   </span>';
  cadena+= '                      <hr>';
  cadena+= '                  </div><!-- end ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  cadena+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 2 Fecha: 02-05-2001 Radicación: 562<br>Doc: RESOLUCION 007 DEL 2001-02-12 00:00:00  ALCALDIA DE CHIGORODO          VALOR ACTO: $<br>ESPECIFICACION: 915 PERMISO DE VENTA  (OTRO)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>A: RAMIREZ PEREZ LUIS GERARDO    X   </span>';
  cadena+= '                      <hr>';
  cadena+= '                  </div><!-- end ngRepeat: anotacion in datosJuridicos.textoAnotaciones1 --><div class="row anotacion ng-scope" ng-repeat="anotacion in datosJuridicos.textoAnotaciones1">';
  cadena+= '                      <span ng-bind-html="anotacion" class="ng-binding">ANOTACION: Nro 3 Fecha: 08-11-2006 Radicación: 2311<br>Doc: ESCRITURA S/N DEL 2006-10-31 00:00:00  NOTARIA UNICA DE CHIGORODO          VALOR ACTO: $3.230.000<br>ESPECIFICACION: 0125 COMPRAVENTA  (MODO DE ADQUISICION)<br>PERSONAS QUE INTERVIENEN EN EL ACTO (X-Titular de derecho real de dominio,I-Titular de dominio incompleto)<br>DE: RAMIREZ PEREZ LUIS GERARDO             <br>A: MARTINEZ MARQUEZ RUDIT MARIA   CC 32286649 X   </span>';
  cadena+= '                     <hr>';
  cadena+= '                  </div>';
  cadena+= '              </div>';
  cadena+= '            </div></div>';
  cadena+= '      </div>';
  cadena+= '   </div>';

  cadena+= '  <div id="propietariosModal" class="modal fade" tabindex="-1" role="dialog">';
  cadena+= '      <div class="modal-dialog">';
  cadena+= '          <div class="modal-content">';
  cadena+= '              <div class="modal-header">';
  cadena+= '                  <button type="button" class="close" data-dismiss="modal">×</button>';
  cadena+= '                  <h4 class="modal-title">Propietarios</h4>';
  cadena+= '              </div>';
  cadena+= '              <div class="modal-body">';
  cadena+= '                  <div class="row">';
  cadena+= '                      <table class="table-condensed table table-striped table-bordered">';
  cadena+= '                          <thead>';
  cadena+= '                              <tr>		';
  cadena+= '                                  <td>NÚMERO DOCUMENTO</td>';
  cadena+= '                                  <td>TIPO IDENTIFICACIÓN</td>';
  cadena+= '                                  <td>PROPIETARIO</td>';
  cadena+= '                              </tr>';
  cadena+= '                          </thead>';
  cadena+= '                          <tbody>';
                                
  cadena+= '                          </tbody>';
  cadena+= '                      </table>';
  cadena+= '                      <dir-pagination-controls max-size="8" direction-links="true" boundary-links="true" pagination-id="indicePropietarios" class="ng-isolate-scope"></dir-pagination-controls>';
  cadena+= '                  </div>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '  <div class="panel panel-primary panel-botones" ng-hide="pantallaFiltros">';
  cadena+= '      <div class="panel-body">';
  cadena+= '          <div class="row">';
  cadena+= '             <div class="btn-group pull-right">';
  cadena+= '                  <button class="btn btn-danger ng-hide" ng-show="pantallaSDH &amp;&amp; sdh" ng-click="imprimir()">Imprimir</button>';
  cadena+= '                  <button class="btn btn-danger ng-hide" ng-show="pantallaSDH &amp;&amp; !sdh" ng-click="consultarSDH()">Confirmar</button>';
  cadena+= '                  <button class="btn btn-danger" ng-click="reiniciar()">Buscar Inmueble</button>';
  cadena+= '              </div>';
  cadena+= '          </div> ';
  cadena+= '      </div>';
  cadena+= '  </div>';
  cadena+= '</div></div>';
    
  cadena+= '      <script type="text/javascript" src="./js/main.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/controllers/mainCtrl.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/routes.js"></script>';
  cadena+= '      <script type="text/javascript" src="./js/vendor/abn_tree_directive.js"></script>';
    	
  cadena+= '			</div>';
  cadena+= '              </div>';
  cadena+= '          </div>';
  cadena+= '      </div>';
  cadena+= '</body></html>';
  
  return cadena;
}

function nowDateTime(opt){
    var today = new Date();
    var date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    
    let opcion = Number(opt);
  
    switch (opcion) {
    case 1:
      return date;
      break;
    case 2:
      return time;
      break;

    case 3:
      return dateTime;
      break;
    default:
      return dateTime;
      break;
  }

}



