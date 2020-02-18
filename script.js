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
	let lineaError = 0; //Contador para saber en que linea se produce el error
	ProcSMR2.banderas.instruccionIlegal = false;
	ProcSMR2.banderas.registroIlegal = false;
	ProcSMR2.banderas.numeroIlegal = false;
	
	while (contador < arrCodigo.length) {
		
		comprobarErrores();
		lineaError++;
		let instruccionActual = ProcSMR2.diccionarios.instrucciones[arrCodigo[contador]]; //Se guarda el objeto con la instruccion actual
		
		if (instruccionActual == undefined) { ProcSMR2.banderas.instruccionIlegal = true; continue; } //Si es undefined activa la bandera de instruccionIlegal
		else { strBinario += instruccionActual["codigoBinario"]; contador++; } //Si no, añade la propiedad codigoBinario a el string binario
		
		if (instruccionActual["usaRegistro"]) { //Si la instruccion usa algún registro, añadelo al binario
			if (ProcSMR2.diccionarios.registros[arrCodigo[contador]] == undefined) { ProcSMR2.banderas.registroIlegal = true; continue; } //Si el registro no es válido activa la bandera de registroIlegal
			else { strBinario += ProcSMR2.diccionarios.registros[arrCodigo[contador]]; contador++; } //Si no, añade el valor de el registro en binario a el string binario
		}
		else { strBinario += "000";} //Si no usa un registro, añade tres ceros para rellenar
		
		if (instruccionActual["usaDatos"]) {
			if (isNaN(arrCodigo[contador]) || arrCodigo[contador] < 0 || arrCodigo[contador] > 255) { //Si el dato no es un número, es menor que 0 o mayor que 255 activa la bandera de numeroIlegal
				ProcSMR2.banderas.numeroIlegal = true; continue; }
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
	divOutput.innerHTML = "";
	
	if (txtBinario.length > 4096) { //Si el programa es más de 512 bytes de largo, muestra un error
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

		ProcSMR2.memoria.programa[contador] = []

		ProcSMR2.memoria.programa[contador]["operacion"] = txtBinario[contador].slice(0, 5); //Carga la instrucción, 5 bits de largo

		ProcSMR2.memoria.programa[contador]["registro"]  = txtBinario[contador].slice(5, 8); //Carga el registro, 3 bits de largo

		ProcSMR2.memoria.programa[contador]["dato"]      = txtBinario[contador].slice(8, 16); //Carga el dato, 8 bits de largo

	}

	//Se resetean algunas variables de control
	ProcSMR2.memoria.linea = 0;
	ProcSMR2.banderas.instruccionIlegal = false;
	ProcSMR2.banderas.registroIlegal    = false;
	ProcSMR2.banderas.numeroIlegal      = false;
	
	let strOutput = "";
	strOutput = "<pre>"; //Se usa <pre> para que el texto pueda usar caracteres especiales como nuevas lineas
	
	//Se repite el bucle hasta que llegue al final del programa o a la linea 255
	while (ProcSMR2.memoria.linea < ProcSMR2.memoria.programa.length && ProcSMR2.memoria.linea <= 255) {

		if (ProcSMR2.banderas.instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error
			divErrorBinario.innerHTML = "Error: el código binario que ha introducido no es válido";
			return;
		}

		if (ProcSMR2.auxiliares.operacionActual() == undefined) { //Si la operacion en la linea actual es undefined activa la bandera de instruccion ilegal y pasa a la siguiente iteracion
			ProcSMR2.banderas.instruccionIlegal = true; continue;
		}
		else { //Si no, guarda el resultado de ejecutar la operacion en una variable y si el return no es undefined, añadelo a el output
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

document.querySelector("#btnGenerar").addEventListener("click", generar);
document.querySelector("#btnEjecutar").addEventListener("click", ejecutar);

//El objeto ProcSMR2 contiene toda la información relativa a el procesador
let ProcSMR2 = {
	
	diccionarios : {	//Diccionarios que se usan para convertir de texto a binario el código
		
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
	
	memoria : {		//Objeto donde se guarda el programa que se ejectua así como lo registros y el puntero de linea
		
		registros : [0, 0, 0, 0, 0, 0, 0, 0],
		programa : [],
		linea : 0,
		
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
    },
	
	banderas : {	//Objeto donde se guardan varias banderas de control
		
		instruccionIlegal : false,
		registroIlegal : false,
		numeroIlegal : false,
		
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

    },
	
}