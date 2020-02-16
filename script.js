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
	// Sub-Funciones //
	///////////////////
	
	/*
	* InstruccionABinario
	*
	*	Esta función recibe un parámetro llamado instrucción y lo compara con las
	*	instrucciones válidas y añade su valor en binario a una cadena que contiene
	*	el código en binario
	*
	*/


	function instruccionABinario(instruccion) {
		
		//Comprueba que instrucción es y añade su código a strBinario
		
		contador++;

		if (instruccion == "imprime")       {strBinario += "00000";}
		
		else if (instruccion == "imprimec") {strBinario += "00001";}
		
		else if (instruccion == "valor")    {strBinario += "00010"; tieneDatos = true;}
		
		else if (instruccion == "borra")    {strBinario += "00011";}
		
		else if (instruccion == "suma")     {strBinario += "00100"; tieneDatos = true;}
		
		else if (instruccion == "resta")    {strBinario += "00101"; tieneDatos = true;}
		
		else if (instruccion == "salta")    {strBinario += "00110000"; decimalABinario(arrCodigo[contador]); return;}
		
		else if (instruccion == "saltasi0") {strBinario += "00111"; tieneDatos = true;}
		
		//Si esa instrucción no existe, la bandera de instrucción ilegal se activa
		else {
			instruccionIlegal = true; 
			return;
		}
		
		registroABinario(arrCodigo[contador]); 
	}
	
	/*
	* registroABinario
	*
	*	Esta función recibe un parámetro llamado registro y lo compara con los
	*	registros válidos y añade su valor en binario a una cadena que contiene
	*	el código en binario
	*
	*/


	function registroABinario(registro) {
		
		//Comprueba que registro es y añade su código a strBinario
		
		contador++;

		if      (registro == "R0") {strBinario += "000";}
		
		else if (registro == "R1") {strBinario += "001";}
		
		else if (registro == "R2") {strBinario += "010";}
		
		else if (registro == "R3") {strBinario += "011";}
		
		else if (registro == "R4") {strBinario += "100";}
		
		else if (registro == "R5") {strBinario += "101";}
		
		else if (registro == "R6") {strBinario += "110";}
		
		else if (registro == "R7") {strBinario += "111";}
		
		else { //Si ese registro no existe, la bandera de registro ilegal se activa
			registroIlegal = true;
			return;
		}
		
		if (tieneDatos == true) { //Si usa algún dato, se convierte a binario, si no, se pone como ocho ceros
			decimalABinario(arrCodigo[contador]);
		}
		
		else {strBinario += "00000000";}
	}
	
	/*
	* decimalABinario
	*
	*	Esta función recibe un número en binario y lo convierte a decimal
	*	y añade su valor en binario a una cadena que contiene el código en binario
	*
	*/
	
	function decimalABinario(numeroDecimal) {
		
		if (numeroDecimal > 255) { //Si el número es superior a 255 la bandera de número ilegal se activa
			numeroIlegal = true;
			return;
		}
		
		let dividendo = numeroDecimal;
		let strTemporal = ""; //Una cadena temporal para construir la final
		
		for (let i=0; i < 8; i++) {
			strTemporal = dividendo%2 + strTemporal; //Se añade al principio de la cadena el módulo
			dividendo = Math.floor(dividendo/2); //Se divide entre dos y se redondea hacia abajo
		}

		strBinario += strTemporal;
		contador++;
	}
	
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
	let tieneDatos = false; //Bandera para determinar si la instrucción usa algún dato
	let contador = 0;
	let linea = 0;
	let instruccionIlegal = false; //Bandera para señalar una instrucción ilegal
	let registroIlegal = false; //Bandera para señalar un registro ilegal
	let numeroIlegal = false; //Bandera para señalar un número ilegal
	
	while (contador < arrCodigo.length) {
		
		if (instruccionIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido una instrucción ilegal en la línea " + linea;
			return;
		}
		
		else if (registroIlegal) { //Si hay un registro ilegal, muestra un error y la línea error
			divErrorCodigo.innerHTML = "Error: ha introducido un registro ilegal en la línea " + linea;
			return;
		}
		
		else if (numeroIlegal) { //Si hay un número ilegal, muestra un error y la línea del error
			divErrorCodigo.innerHTML = "Error: ha introducido un número ilegal en la línea " + linea;
			return;
		}
		
		instruccionABinario(arrCodigo[contador]);
		tieneDatos = false;
		linea++;
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
	let linea = 0;
	let registros = [0, 0, 0, 0, 0, 0, 0, 0]; //Array con los registros
	let memoria = []; //Array donde se carga el programa
	let caracteresASCII = ["\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\r","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~"]
	let strOutput = "";

	for (linea = 0; linea < txtBinario.length/16; linea++) {

		memoria[linea] = []

		//Carga el programa en un array llamado memoria por lineas
		//Cada linea contiene una instrucción, registro y dato
		if (memoria[linea][0] == undefined) { 
			memoria[linea][0] = "";
			memoria[linea][1] = "";
			memoria[linea][2] = "";
		}

		for (let i = 0; i < 16 ; i++) {

			if      (i < 5)  { memoria[linea][0] += txtBinario[contador]; } //Carga la instrucción, 5 bits de largo

			else if (i < 8)  { memoria[linea][1] += txtBinario[contador]; } //Carga el registro, 3 bits de largo

			else if (i < 16) { memoria[linea][2] += txtBinario[contador]; } //Carga el dato, 8 bits de largo

			contador++;
		}
	}

	console.table(memoria);

	linea = 0;
	contador = 0;
	divOutput.innerHTML = "";
	strOutput = "<pre>";
	let instruccionIlegal = false; //Bandera para señalar una instrucción ilegal
	let numeroIlegal = false; //Bandera para señalar un número ilegal

	//Se repite el bucle hasta que llegue al final del programa o a la linea 255
	while (linea < memoria.length && linea <= 255) {

		if (instruccionIlegal || numeroIlegal) { //Si hay una instrucción ilegal, muestra un error y la línea del error
			divErrorBinario.innerHTML = "Error: el código binario que ha introducido no es válido";
			return;
		}

		//Ejecuta la instrucción (la cuál siempre está en el primer elemento) de la linea actual
		ejecutarInstruccion(memoria[linea][0]);
		linea++;
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

let ProcSMR2 = {
	
	diccionarios : {
		
		instrucciones : {
			
			imprime : "00000",
			imprimec : "00001",
			valor : "00010",
			borra : "00011",
			suma : "00100",
			resta : "00101",
			salta : "00110",
			saltasi0 : "00111",
			
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
	
/* 	operaciones : {
		
	}, */
	
}