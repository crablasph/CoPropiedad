// ==UserScript==
// @name IGAC
// @namespace IGAC
// @description This script will automagically blah blah blah
// @include *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require       https://unpkg.com/jspdf@latest/dist/jspdf.min.js
// ==/UserScript==
// 
var urlBase = "https://tramites.igac.gov.co/geltramitesyservicios/consultaInfoCatastral/consultaInfoCat.seam"

if(window.location.href.indexOf(urlBase) > -1) {
  alert("entreaqui");
  var urls =  [];
  var jsonList = [];
  
  var myObject2 = {
    'formBusqueda3': 'formBusqueda3',
    'formBusqueda3:j_id35': 'todos',
'formBusqueda3:j_id39': '',
'formBusqueda3:j_id43': '73',
'formBusqueda3:j_id47': '275',
'formBusqueda3:j_id54': '',
'formBusqueda3:j_id56': '',
'formBusqueda3:j_id58': '',
'formBusqueda3:j_id60': '',
'formBusqueda3:j_id64': '',
'formBusqueda3:j_id65': '0',
'formBusqueda3:j_id129': '73',
'formBusqueda3:j_id130': '275',
'formBusqueda3:j_id131': '00',
'formBusqueda3:j_id132': '01',
'formBusqueda3:j_id133': '0005',
'formBusqueda3:j_id134': '3130',
'formBusqueda3:j_id135': '000',
'formBusqueda3:j_id155': '',
    'formBusqueda3:j_id157':'pnlOpenedState:',
'formBusqueda3:j_id157': 'formBusqueda3:j_id157',
'autoScroll': '',
'formBusqueda3:j_id157':'_link_hidden_:',
'formBusqueda3:j_id157':'j_idcl:',
'javax.faces.ViewState': 'j_id7',
'formBusqueda3:j_id165': '',
'formBusqueda3:j_id169': 'Buscar',
'javax.faces.ViewState': 'j_id7'
    };
  console.log(myObject2);
  
  $.ajax({
    type: "POST",    
    url: urlBase,
    cache: false,
    crossDomain: true,
    dataType: 'html',
    data: myObject2,
    xhrFields: {
       withCredentials: true
    },
    success: function (data,par2, par3) {
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
        console.log("Data:","Request: "+urlBase,par2,par3);
        download(data, "IGAC"+date+"JsonList.html", 'text/html');
        
      }
    });

  var vectorLista = [];
  var codDep  =['73','73','73','73','73','73','73','73','73'];
  var codMun  =['275','275','275','275','275','275','275','275','275'];
  var codTA   =['00','00','00','00','00','00','00','00','00'];
  var codSE   =['01','01','01','01','01','01','01','01','01'];
  var codMAVE =['0005','0005','0005','0005','0005','0005','0005','0005','0005'];
  var codPRED =['3130','3137','3129','3133','3138','3134','3136','3128','3132'];
  var codMEJ = ['000','000','000','000','000','000','000','000','000'];

  var codDep = vectorLista.length;
  for (var i = 0; i < arrayLength; i++) {
      var cod = codDep[i]+codMun[i]+codTA[i]+codSE[i]+codMAVE[i]+codPRED[i]+codMEJ[i];
  
  }
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