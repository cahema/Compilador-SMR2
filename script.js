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
	
	///////////////////
	// Función en si //
	///////////////////
	
	let txtCodigo = document.querySelector("#txtCodigo").value; //Recuperamos el texto en el textarea de código
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
		
		lineaError++;
		let instruccionActual = ProcSMR2.diccionarios.instrucciones[arrCodigo[contador]];
		console.log(instruccionActual);
		
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

	/*
	* binarioADecimal
	*
	*	Esta función recibe un número en binario y devuelve el valor
	*	decimal de ese número
	*
	*/


	function binarioADecimal (numeroBinario) { //Función para convertir de binario a decimal

		let suma = 0;
		let x = 0;

		for (let i = numeroBinario.length-1; i >= 0; i--) {

			suma += Number(numeroBinario[x])*2**i; //2 elevado a la posición i del número - 1
			x++;
		}

		if (suma > 255 || suma < 0) {
			numeroIlegal = true;
			return;
		}

		return suma;
	}

	/*
	* ejecutarInstruccion
	*
	*	Esta función recibe un número en binario como parámetro, lo compara con las instrucciones
	*	válidas y ejectua las acciones necesarias
	*
	*/


	function ejecutarInstruccion (instruccion) {

		if (instruccion == "00000") { //imprime

			strOutput += registros[binarioADecimal(memoria[linea][1])];
		}

		else if (instruccion == "00001") { //imprimec

			strOutput += caracteresASCII[registros[binarioADecimal(memoria[linea][1])]];
		}

		else if (instruccion == "00010") { //valor

			registros[binarioADecimal(memoria[linea][1])] = binarioADecimal(memoria[linea][2]);
		}

		else if (instruccion == "00011") { //borra

			registros[binarioADecimal(memoria[linea][1])] = 0;
		}

		else if (instruccion == "00100") { //suma

			registros[binarioADecimal(memoria[linea][1])] += binarioADecimal(memoria[linea][2]);
		}

		else if (instruccion == "00101") { //resta

			registros[binarioADecimal(memoria[linea][1])] -= binarioADecimal(memoria[linea][2]);
		}

		else if (instruccion == "00110") { //salta

			linea = binarioADecimal(memoria[linea][2])-1;
		}

		else if (instruccion == "00111") { //saltasi0

			if (registros[binarioADecimal(memoria[linea][1])] == 0) {

				linea = binarioADecimal(memoria[linea][2])-1;
			}
		}

		else {
			instruccionIlegal = true;
		}

	}

	let txtBinario = document.querySelector("#txtBinario").value;
	let divErrorBinario = document.querySelector("#divErrorBinario");
	let divOutput = document.querySelector("#divOutput");

	if (txtBinario.length > 4096) { //Si el programa es más de 512 bytes de largo, muestra un error
		divErrorBinario.innerHTML = "Error: el programa supera la longitud de 512 bytes";
		return;
	}

	else if (txtBinario == "") { //Si está vacío, muestra un error
		divErrorBinario.innerHTML = "Error: introduzca código binario válido para ejecutarlo";
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
			ProcSMR2.memoria.programa[linea]["registro"] = "";
			ProcSMR2.memoria.programa[linea]["dato"] = "";
		}

		for (let i = 0; i < 16 ; i++) {

			if      (i < 5)  { ProcSMR2.memoria.programa[linea]["operacion"] += txtBinario[contador]; } //Carga la instrucción, 5 bits de largo

			else if (i < 8)  { ProcSMR2.memoria.programa[linea]["registro"] += txtBinario[contador]; } //Carga el registro, 3 bits de largo

			else if (i < 16) { ProcSMR2.memoria.programa[linea]["dato"] += txtBinario[contador]; } //Carga el dato, 8 bits de largo

			contador++;
		}
	}

	console.table(ProcSMR2.memoria.programa);
	ProcSMR2.memoria.linea = 0;
	
	divOutput.innerHTML = "";
	strOutput = "<pre>";
	let instruccionIlegal = false; //Bandera para señalar una instrucción ilegal
	let numeroIlegal = false; //Bandera para señalar un número ilegal

	//Se repite el bucle hasta que llegue al final del programa o a la linea 255
	while (ProcSMR2.memoria.linea < ProcSMR2.memoria.programa.length && ProcSMR2.memoria.linea <= 255) {

		if (instruccionIlegal || numeroIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorBinario.innerHTML = "Error: el código binario que ha introducido no es válido";
			return;
		}

		//Ejecuta la instrucción (la cuál siempre está en el primer elemento) de la linea actual
		ejecutarInstruccion(memoria[linea][0]);
		ProcSMR2.memoria.linea++;
	}

	strOutput += "</pre>";
	divOutput.innerHTML = strOutput;
	divErrorBinario.innerHTML = "";
	
}

////////////////////
//      MAIN      //
////////////////////

let strOutput = "";
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
			
			R0 : "000",
			R1 : "001",
			R2 : "010",
			R3 : "011",
			R4 : "100",
			R5 : "101",
			R6 : "110",
			R7 : "111",
			
		},
	
	},
	
	memoria : {
		
		registros : [0, 0, 0, 0, 0, 0, 0, 0],
		programa : [],
		linea : 0,
		
	},

	operaciones : {
		
		"00000" : function() { //imprime
        	strOutput += ProcSMR2.memoria.registros[parseInt(registroActual(), 2)];
    	},

    	"00001" : function() { //imprimec

    	},

    },
	
	banderas : {
		
		instruccionIlegal : false,
		registroIlegal : false,
		numeroIlegal : false,
		
	},
	
    auxiliares : {

    	registroActual : function() {
			let registroBin = ProcSMR2.memoria.programa[ProcSMR2.memoria.linea]["registro"]
    		return parseInt(registroBin, 2);
    	},

    	datoActual : function() {
    		let registroBin = ProcSMR2.memoria.programa[ProcSMR2.memoria.linea]["dato"]
    		return parseInt(registroBin, 2);
    	},

    },

	debug : {
		
	},
	
}