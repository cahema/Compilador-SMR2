/////////////////
//   OBJETOS   //
/////////////////

//El objeto ProcSMR2 contiene toda la información relativa a el procesador
let ProcSMR2 = {

	propiedades : {

		numRegistros : 8,
		tamMemoria : 4096,

	},

	diccionarios : {	//Diccionarios que se usan para convertir de texto a binario el código

		instrucciones : {

			imprime  : { codigoBinario : "00000", codigoTexto : "imprime"  , usaRegistro : true , usaDatos : false},
			imprimec : { codigoBinario : "00001", codigoTexto : "imprimec" , usaRegistro : true , usaDatos : false},
			valor    : { codigoBinario : "00010", codigoTexto : "valor"    , usaRegistro : true , usaDatos : true },
			borra    : { codigoBinario : "00011", codigoTexto : "borra"    , usaRegistro : true , usaDatos : false},
			suma     : { codigoBinario : "00100", codigoTexto : "suma"     , usaRegistro : true , usaDatos : true },
			resta    : { codigoBinario : "00101", codigoTexto : "resta"    , usaRegistro : true , usaDatos : true },
			salta    : { codigoBinario : "00110", codigoTexto : "salta"    , usaRegistro : false, usaDatos : true },
			saltasi0 : { codigoBinario : "00111", codigoTexto : "saltasi0" , usaRegistro : true , usaDatos : true },
			negativos: { codigoBinario : "01000", codigoTexto : "negativos", usaRegistro : false, usaDatos : false},
			positivos: { codigoBinario : "01001", codigoTexto : "positivos", usaRegistro : false, usaDatos : false},

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

	memoria : {		//Objeto donde se guarda el programa que se ejectua así como lo registros y el puntero de linea

		registros : [0, 0, 0, 0, 0, 0, 0, 0],
		programa : [],
		linea : 0,
		etiquetas : {},

	},

	operaciones : {		//Objeto donde se guardan todas las operaciones posibles y su ejecución

		"00000" : function() { //imprime
			return ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()];
    },

		"00001" : function() { //imprimec
			return String.fromCharCode(ProcSMR2.memoria.registros[ProcSMR2.auxiliares.registroActual()]);
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

		"01000" : function() { //negativos
			ProcSMR2.banderas.usaNegativos = true;
    },

		"01001" : function() { //positivos
			ProcSMR2.banderas.usaNegativos = false;
    },

  },

	banderas : {	//Objeto donde se guardan varias banderas de control

		instruccionIlegal : false,
		registroIlegal : false,
		numeroIlegal : false,
		etiquetaIlegal : false,
		usaNegativos : false,

	},

  auxiliares : {		//Objeto donde se guardan varias funciones auxiliares que ayudan a hacer el código más legible

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

		limpiarBanderas : function() {
			let arrayBanderas = Object.keys(ProcSMR2.banderas);
			for (let bandera of arrayBanderas) {
				ProcSMR2.banderas[bandera] = false;
			}
		},

		limpiarMemoria : function() {
			for (let i = 0; i < ProcSMR2.memoria.registros.length; i++) {
				ProcSMR2.memoria.registros[i] = 0;
			}
			ProcSMR2.memoria.programa = [];
			ProcSMR2.memoria.linea = 0;
			ProcSMR2.memoria.etiquetas = {};
		},

  },

  debug : {

  	habilitado : false,

  	tiempo1 : 0,
  	tiempo2 : 0,

  	medirTiempoEjecucion : function(funcion, inicio, fin) {
  		return ProcSMR2.debug.tiempo1 - ProcSMR2.debug.tiempo2;
  	},

  	imprimePrograma : function() {
  		console.log("Registros")
  		console.table(ProcSMR2.memoria.registros);

  		console.log("Programa")
  		console.table(ProcSMR2.memoria.programa);
  	},

  },

}

///////////////////
//   VARIABLES   //
///////////////////

//Cual es el procesador actual
procActual = ProcSMR2;

///////////////////
//   FUNCIONES   //
///////////////////

/*
* Generar
*
*	Esta función convierte el código introducido en el textarea de código
*	en una serie de números binarios y además comprueba la validez del código introducido
*
*/

function generar() {

	//Esta funcion hace comprobaciones de que las banderas de errores no han sido activadas

	function comprobarErrores() {
		if (procActual.banderas.instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido una instrucción ilegal en la línea " + lineaError;
			return;
		}

		else if (procActual.banderas.registroIlegal) { //Si hay un registro ilegal, muestra un error y la línea error
			divErrorCodigo.innerHTML = "Error: ha introducido un registro ilegal en la línea " + lineaError;
			return;
		}

		else if (procActual.banderas.numeroIlegal) { //Si hay un número ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido un número ilegal en la línea " + lineaError;
			return;
		}
		else if (procActual.banderas.etiquetaIlegal) {
			divErrorCodigo.innerHTML = "Error: ha introducido una etiqueta no declarada en la linea " + lineaError;
			return;
		}

		return "Correcto";
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
	let lineaError = 0; //Contador para saber en que linea se produce el error
	procActual.auxiliares.limpiarBanderas();
	procActual.memoria.etiquetas = {};

	while (contador < arrCodigo.length) {

		if(comprobarErrores() != "Correcto") {
			return;
		}
		lineaError++;
		let instruccionActual = procActual.diccionarios.instrucciones[arrCodigo[contador]]; //Se guarda el objeto de la instruccion actual

		if (arrCodigo[contador].match(/:$/)) {
			let etiquetaSinPuntos = arrCodigo[contador].replace(":", "");
			procActual.memoria.etiquetas[etiquetaSinPuntos] = lineaError-1;
			contador++;
			continue;
		}

		if (instruccionActual == undefined) { procActual.banderas.instruccionIlegal = true; continue; } //Si la instruccion no existe, es undefined y activa la bandera de instruccionIlegal
		else { strBinario += instruccionActual["codigoBinario"]; contador++; } //Si no, añade la propiedad codigoBinario a el string binario

		if (instruccionActual["usaRegistro"]) { //Si la instruccion usa algún registro, añadelo al binario
			if (procActual.diccionarios.registros[arrCodigo[contador]] == undefined) { procActual.banderas.registroIlegal = true; continue; } //Si el registro no es válido activa la bandera de registroIlegal
			else { strBinario += procActual.diccionarios.registros[arrCodigo[contador]]; contador++; } //Si no, añade el valor de el registro en binario a el string binario
		}
		else { strBinario += "000";} //Si no usa un registro, añade tres ceros para rellenar

		if (instruccionActual["usaDatos"]) {
			if (procActual.memoria.etiquetas[arrCodigo[contador]] != undefined) {
				arrCodigo[contador] = procActual.memoria.etiquetas[arrCodigo[contador]];
			}
			else if (isNaN(arrCodigo[contador]) && procActual.memoria.etiquetas[arrCodigo[contador]] == undefined) {
				procActual.banderas.etiquetaIlegal = true; continue;
			}


			if (isNaN(arrCodigo[contador]) || arrCodigo[contador] < 0 || arrCodigo[contador] > 255) { //Si el dato no es un número, es menor que 0 o mayor que 255 activa la bandera de numeroIlegal
				procActual.banderas.numeroIlegal = true; continue;
			}
			else { //Si no, convierte el número a binario y añade ceros al principio hasta que mida 8 caracteres de largo
				let numTemporal = Number(arrCodigo[contador]).toString(2);
				while (numTemporal.length < 8) {
					numTemporal = "0" + numTemporal;
				}
				strBinario += numTemporal;
				contador++;
			}
		}

		else { strBinario += "00000000";} //Si no usa un dato, añade ocho ceros para rellenar
	}

	if (strBinario.length > procActual.propiedades.tamMemoria) { //Si el programa supera los 512 bytes, muestra un error
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
	divOutput.innerHTML = "";

	if (txtBinario.length > procActual.propiedades.tamMemoria) { //Si el programa es más de 512 bytes de largo, muestra un error
		divErrorBinario.innerHTML = "Error: el programa supera la longitud de 512 bytes";
		return;
	}

	else if (txtBinario == "") { //Si está vacío, muestra un error
		divErrorBinario.innerHTML = "Error: introduzca código binario válido para ejecutarlo";
		return;
	}

	else if (txtBinario.length % 16 != 0) { //Si no se puede dividir perfectamente entre 16 no es válido
		divErrorBinario.innerHTML = "Error, el programa tiene una longitud inválida";
		return;
	}

	else { //Si no hay errores, vacía el div del output y el de errores
		divOutput.innerHTML = "";
		divErrorBinario.innerHTML = "";
	}

	txtBinario = txtBinario.match(/.{1,16}/g); //Convierte el string en binario a un array con elementos que son 16 bits de largo

	for (let contador = 0; contador < txtBinario.length; contador++) {

		procActual.memoria.programa[contador] = []

		procActual.memoria.programa[contador]["operacion"] = txtBinario[contador].slice(0, 5); //Carga la instrucción, 5 bits de largo

		procActual.memoria.programa[contador]["registro"]  = txtBinario[contador].slice(5, 8); //Carga el registro, 3 bits de largo

		procActual.memoria.programa[contador]["dato"]      = txtBinario[contador].slice(8, 16); //Carga el dato, 8 bits de largo

	}

	//Se resetean algunas variables de control
	procActual.memoria.linea = 0;
	procActual.auxiliares.limpiarBanderas();

	let strOutput = "";
	strOutput = "<pre>"; //Se usa <pre> para que el texto pueda usar caracteres especiales como nuevas lineas

	//Se repite el bucle hasta que llegue al final del programa o a la linea 255
	while (procActual.memoria.linea < procActual.memoria.programa.length && procActual.memoria.linea <= 255) {

		if (procActual.banderas.instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error
			divErrorBinario.innerHTML = "Error: el código binario que ha introducido no es válido";
			return;
		}

		if (procActual.auxiliares.operacionActual() == undefined) { //Si la operacion en la linea actual es undefined activa la bandera de instruccion ilegal y pasa a la siguiente iteracion
			procActual.banderas.instruccionIlegal = true; continue;
		}
		else { //Si no, guarda el resultado de ejecutar la operacion en una variable y si el return no es undefined, añadelo a el output
			let resultadoOperacion = procActual.operaciones[procActual.auxiliares.operacionActual()]();
			if (resultadoOperacion != undefined) {
				if (typeof resultadoOperacion == "number" && ProcSMR2.banderas.usaNegativos) { strOutput += resultadoOperacion-127; }
				else { strOutput += resultadoOperacion; }
			}
		}
		procActual.memoria.linea++;
	}

	strOutput += "</pre>";
	divOutput.innerHTML = strOutput;
	divErrorBinario.innerHTML = "";

}

////////////////////
//      MAIN      //
////////////////////

document.querySelector("#btnGenerar").addEventListener("click", generar);
document.querySelector("#btnEjecutar").addEventListener("click", ejecutar);
