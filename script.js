///////////////////
//   FUNCIONES   //
///////////////////

/*
* Generar
*
*	Esta función convierte el código introducido en el textarea de código
*	en una serie de números binarios y además comprueba la validez del
*   código introducido
*
*/

function generar() {
	
	function comprobarErrores() {
		if (ProcSMR2.banderas.instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido una instrucción ilegal en la línea " + lineaError;
			return;
		}
		
		else if (ProcSMR2.banderas.registroIlegal) { //Si hay un registro ilegal, muestra un error y la línea error
			divErrorCodigo.innerHTML = "Error: ha introducido un registro ilegal en la línea " + lineaError;
			return;
		}
		
		else if (ProcSMR2.banderas.numeroIlegal) { //Si hay un número ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido un número ilegal en la línea " + lineaError;
			return;
		}
	}
	
	let txtCodigo = document.querySelector("#txtCodigo").value.toLowerCase(); //Recuperamos el texto en el textarea de código
	let divErrorCodigo = document.querySelector("#divErrorCodigo");

	if (txtCodigo == "") { //Si está vacío, muestra un error
		divErrorCodigo.innerHTML = "Error: introduzca código para generar el código binario";
		return;
	}

	let arrCodigo = txtCodigo.split(/\s+/); //Se usa una expresión regular para separar el texto en un array usando como separadores espacios y retornos de carro
	let strBinario = ""; //Una cadena para el binario
	let contador = 0;
	let lineaError = 0;
	ProcSMR2.banderas.instruccionIlegal = false;
	ProcSMR2.banderas.registroIlegal = false;
	ProcSMR2.banderas.numeroIlegal = false;
	
	while (contador < arrCodigo.length) {
		
		comprobarErrores();
		lineaError++;
		let instruccionActual = ProcSMR2.diccionarios.instrucciones[arrCodigo[contador]];
		
		if (instruccionActual == undefined) { ProcSMR2.banderas.instruccionIlegal = true; continue; }
		else { strBinario += instruccionActual["codigoBinario"]; contador++; }
		
		if (instruccionActual["usaRegistro"]) {
			if (ProcSMR2.diccionarios.registros[arrCodigo[contador]] == undefined) { ProcSMR2.banderas.registroIlegal = true; continue; }
			else { strBinario += ProcSMR2.diccionarios.registros[arrCodigo[contador]]; contador++; }
		}
		else { strBinario += "000";}
		
		if (instruccionActual["usaDatos"]) {
			if (isNaN(arrCodigo[contador]) || arrCodigo[contador] < 0 || arrCodigo[contador] > 255) {
				ProcSMR2.banderas.numeroIlegal = true; continue; }
			else {
				let numTemporal = Number(arrCodigo[contador]).toString(2);
				while (numTemporal.length < 8) {
					numTemporal = "0" + numTemporal;
				}
				strBinario += numTemporal;
				contador++;
			}
		}
		
		else { strBinario += "00000000";}
	}
	
	if (strBinario.length > 4096) { //Si el programa supera los 512 bytes, muestra un error
		divErrorCodigo.innerHTML = "Error: el programa introducido supera el límite de lineas";
		return;
	}
	document.querySelector("#txtBinario").value = strBinario; //Mostrar el valor en el textarea del código binario
	divErrorCodigo.innerHTML = "";
	divErrorBinario.innerHTML = "";
}

/*
* Ejecutar
*
*	Esta función interpreta y ejecuta la serie de números binarios en el
*	textarea de binario y muestra el output que generaría ese código
*
*/

function ejecutar() {

	let txtBinario      = document.querySelector("#txtBinario").value;
	let divErrorBinario = document.querySelector("#divErrorBinario");
	let divOutput       = document.querySelector("#divOutput");

	if (txtBinario.length > 4096) { //Si el programa es más de 512 bytes de largo, muestra un error
		divErrorBinario.innerHTML = "Error: el programa supera la longitud de 512 bytes";
		return;
	}

	else if (txtBinario == "") { //Si está vacío, muestra un error
		divErrorBinario.innerHTML = "Error: introduzca código binario válido para ejecutarlo";
		return;
	}

	else if (txtBinario.length % 16 != 0) {
		divErrorBinario.innerHTML = "Error, el programa tiene una longitud inválida";
		return;
	}
	
	else { //Si no hay errores, vacía el div del output y el de errores
		divOutput.innerHTML = "";
		divErrorBinario.innerHTML = "";
	}

	let contador = 0;

	for (linea = 0; linea < txtBinario.length/16; linea++) {

		ProcSMR2.memoria.programa[linea] = []

		//Carga el programa en un array llamado memoria por lineas
		//Cada linea contiene una instrucción, registro y dato
		if (ProcSMR2.memoria.programa[linea]["operacion"] == undefined) { 
			ProcSMR2.memoria.programa[linea]["operacion"] = "";
			ProcSMR2.memoria.programa[linea]["registro"]  = "";
			ProcSMR2.memoria.programa[linea]["dato"]      = "";
		}

		for (let i = 0; i < 16 ; i++) {

			if      (i < 5)  { ProcSMR2.memoria.programa[linea]["operacion"] += txtBinario[contador]; } //Carga la instrucción, 5 bits de largo

			else if (i < 8)  { ProcSMR2.memoria.programa[linea]["registro"]  += txtBinario[contador]; } //Carga el registro, 3 bits de largo

			else if (i < 16) { ProcSMR2.memoria.programa[linea]["dato"]      += txtBinario[contador]; } //Carga el dato, 8 bits de largo

			contador++;
		}
	}

	ProcSMR2.memoria.linea = 0;
	ProcSMR2.banderas.instruccionIlegal = false;
	ProcSMR2.banderas.registroIlegal    = false;
	ProcSMR2.banderas.numeroIlegal      = false;
	
	let strOutput = "";
	let instruccionIlegal = false; //Bandera para señalar una instrucción ilegal
	let numeroIlegal = false; //Bandera para señalar un número ilegal
	strOutput = "<pre>";
	divOutput.innerHTML = "";
	
	//Se repite el bucle hasta que llegue al final del programa o a la linea 255
	while (ProcSMR2.memoria.linea < ProcSMR2.memoria.programa.length && ProcSMR2.memoria.linea <= 255) {

		if (instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorBinario.innerHTML = "Error: el código binario que ha introducido no es válido";
			return;
		}

		//Ejecuta la instrucción (la cuál siempre está en el primer elemento) de la linea actual
		if (ProcSMR2.auxiliares.operacionActual() == undefined) {
			ProcSMR2.banderas.instruccionIlegal = true; continue;
		}
		else {
			let resultadoOperacion = ProcSMR2.operaciones[ProcSMR2.auxiliares.operacionActual()]();
			if (resultadoOperacion != undefined) {
				strOutput += resultadoOperacion;
			}
		}
		ProcSMR2.memoria.linea++;
	}

	strOutput += "</pre>";
	divOutput.innerHTML = strOutput;
	divErrorBinario.innerHTML = "";
	
}

////////////////////
//      MAIN      //
////////////////////

let caracteresASCII = ["\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\r","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~"];

document.querySelector("#btnGenerar").addEventListener("click", generar);
document.querySelector("#btnEjecutar").addEventListener("click", ejecutar);

let ProcSMR2 = {
	
	diccionarios : {
		
		instrucciones : {
			
			imprime  : {codigoBinario : "00000", usaRegistro : true,  usaDatos : false},
			imprimec : {codigoBinario : "00001", usaRegistro : true,  usaDatos : false},
			valor    : {codigoBinario : "00010", usaRegistro : true,  usaDatos : true },
			borra    : {codigoBinario : "00011", usaRegistro : true,  usaDatos : false},
			suma     : {codigoBinario : "00100", usaRegistro : true,  usaDatos : true },
			resta    : {codigoBinario : "00101", usaRegistro : true,  usaDatos : true },
			salta    : {codigoBinario : "00110", usaRegistro : false, usaDatos : true },
			saltasi0 : {codigoBinario : "00111", usaRegistro : true,  usaDatos : true },
			
		},
		
		registros : {
			
			r0 : "000",
			r1 : "001",
			r2 : "010",
			r3 : "011",
			r4 : "100",
			r5 : "101",
			r6 : "110",
			r7 : "111",
			
		},
	
	},
	
	memoria : {
		
		registros : [0, 0, 0, 0, 0, 0, 0, 0],
		programa : [],
		linea : 0,
		
	},

	operaciones : {
		
		"00000" : function() { //imprime
        	return ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()];
    	},

    	"00001" : function() { //imprimec
			return caracteresASCII[ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()]];
    	},
		
		"00010" : function() { //valor
			ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()] = ProcSMR2.auxiliares.datoActual();
    	},

		"00011" : function() { //borra
			ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()] = 0;
    	},
		
		"00100" : function() { //suma
			ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()] += ProcSMR2.auxiliares.datoActual();
    	},
		
		"00101" : function() { //resta
			ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()] -= ProcSMR2.auxiliares.datoActual();
    	},
		
		"00110" : function() { //salta
			ProcSMR2.memoria.linea = ProcSMR2.auxiliares.datoActual()-1;
    	},
		
		"00111" : function() { //saltasi0
			if (ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()] == 0) {
				ProcSMR2.memoria.linea = ProcSMR2.auxiliares.datoActual()-1;
			}
    	},
    },
	
	banderas : {
		
		instruccionIlegal : false,
		registroIlegal : false,
		numeroIlegal : false,
		
	},
	
    auxiliares : {

		operacionActual : function() {
			return ProcSMR2.memoria.programa[ProcSMR2.memoria.linea]["operacion"];
		},
	
    	registroActual : function() {
			let registroBin = ProcSMR2.memoria.programa[ProcSMR2.memoria.linea]["registro"];
    		return parseInt(registroBin, 2);
    	},

    	datoActual : function() {
    		let datoBin = ProcSMR2.memoria.programa[ProcSMR2.memoria.linea]["dato"];
    		return parseInt(datoBin, 2);
    	},

    },

	debug : {
		
	},
	
}