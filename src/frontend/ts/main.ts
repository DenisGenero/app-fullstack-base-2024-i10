class Main implements EventListenerObject {
    constructor() {
        // Cargar la lista de dispositivos que hay en la base de datos
        this.buscarDevices();
        // Recuperar botón para agregar dispositivo y asociar al listener
        let btn = this.recuperarElemento("btn_add");
        btn.addEventListener('click', this);
    }

    // Handler de los botones
    handleEvent(object: Event): void {
        let idDelElemento = (<HTMLElement>object.target).id;

        // Handler para agregar un dispositivo
        if (idDelElemento == 'btn_add'){
            let newDevForm = this.recuperarElemento("newDevForm");
            if(!newDevForm.hidden){
                newDevForm.hidden = true;
            } else {
                newDevForm.hidden = false;
            }
        }

        else if(idDelElemento == "btn_agregar"){
            let newDevForm = this.recuperarElemento("newDevForm");
            let inputName = newDevForm.querySelector<HTMLInputElement>("#devName");
            let inputDesc = newDevForm.querySelector<HTMLInputElement>("#descName")
            let inputType = newDevForm.querySelector<HTMLInputElement>("#newType")

            let nombre = String(inputName.value)
            let desc = String(inputDesc.value);
            let type = Number(inputType.value);

            // Control de campos vacíos:
            if(nombre == '' || desc == '') {
                alert("Complete todos los campos")
            }
            else {
                this.newDevice(nombre, desc, type);
                this.buscarDevices();
            }
        }

        else if (idDelElemento == "btn_cancelar"){
            let newDevForm = this.recuperarElemento("newDevForm");
            newDevForm.hidden = true;
        }

           // Handler para cambiar el estado del dispositivo
        else if(idDelElemento.startsWith("cb_")){
            let input = <HTMLInputElement>object.target;
            this.updateStateDevice(parseInt(input.getAttribute("idBd")), Number(input.checked));
        }

        // Handler para editar dispositivo
        else if (idDelElemento.startsWith('edit_') ){
            let idDelItem = (<HTMLElement>object.target).getAttribute("idItem");
            let editForm = this.recuperarElemento("deviceForm_" + idDelItem);
            // Mostrar u ocultar el formulario con la presión del botón
            if(!editForm.hidden){
                editForm.hidden = true;
            } else {
                editForm.hidden = false;
            }
        }

        // Handler para eliminar un dispositivo
        else if (idDelElemento.startsWith('delete_')){
            let idDelItem = (<HTMLElement>object.target).getAttribute("idItem");
            if(confirm("Esta seguro que desea eliminar el dispositivo?")){
                this.deleteDevice(parseInt(idDelItem));
                this.buscarDevices();
            }
        } 
        
        // Handler para aceptar cambios al editar un dispositivo
        else if (idDelElemento.startsWith('ok_') ){
            let idDelItem = parseInt((<HTMLElement>object.target).getAttribute("idItem"));
            let editForm = this.recuperarElemento("deviceForm_" + idDelItem);
            // Se recuperan parámetros del formulario
            let inputName = editForm.querySelector<HTMLInputElement>("#devName");
            let inputDesc = editForm.querySelector<HTMLInputElement>("#descName")
            let nombre = String(inputName.value)
            let desc = String(inputDesc.value);
            // Actualizar información en base de datos
            this.updateDeviceInfo(idDelItem, nombre, desc);
            // Actualizar página con los cambios
            this.buscarDevices();
        }

        // Handler para cancelar la edición de un dispositivo (botón cancelar)
        else if (idDelElemento.startsWith("cancel_")){
            let idDelItem = (<HTMLElement>object.target).getAttribute("idItem");
            let editForm = this.recuperarElemento("deviceForm_" + idDelItem);
            // Ocultar el formulario correspondiente
            editForm.hidden = true;
        }
        
        // Handler de evento desconocido
        else {
            alert("Ups... Ocurrió un problema...");
        }
    }

    // Método para buscar los dispositivos y ordenarlos en tarjetas.
    // Se agrega ademas un formulario oculto para agregar un dispositivos
    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();    
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let ul = this.recuperarElemento("list");
                    // Abrir la fila fuera del bucle
                    let listaDevices: string = `<div class="row">`;
                    // Lista de elementos
                    let lista: Array<Device> = JSON.parse(xmlHttp.responseText);
                    // Contador para acomodar tarjetas de a 3 por fila
                    let contador = 0;
                    for (let item of lista) {
                        listaDevices += `
                            <div class="col m3 l3 xl3">  <!-- Columna de 4 tarjetas por fila -->
                                <div class="card hoverable" style="background-color: lightblue; border-radius: 8px;">
                                    <div class="card-content">
                                        <img src="./static/images/lightbulb.png" left-align class="circle">
                                        <a href="#!" class="secondary-content">
                                            <div class="switch">
                                                <label>
                                                    Off`;
                                                    if (item.state) {
                                                        listaDevices += `<input idBd="${item.id}" id="cb_${item.id}" type="checkbox" checked>`;
                                                    } else {
                                                        listaDevices += `<input idBd="${item.id}"  name="chk" id="cb_${item.id}" type="checkbox">`;
                                                    }
                                                    listaDevices += `
                                                    <span class="lever"></span>
                                                    On
                                                </label>                             
                                            </div>
                                        </a><br>
                                        <span class="title">${item.name}</span>
                                        <p>${item.description}</p>
                                        <br>

                                        <!-- Botones para editar o cancelar la edición: un formulario oculto por tarjeta -->
                                        <button class="btn-floating btn-medium waves-effect waves-light blue">
                                            <i class="material-icons" id="edit_btn_${item.id}" idItem="${item.id}">create</i>
                                        </button>
                                        <button class="btn-floating btn-medium waves-effect waves-light red">
                                            <i class="material-icons" id="delete_btn_${item.id}" idItem='${item.id}'>delete_forever</i>
                                        </button>

                                        <!-- Formulario oculto -->
                                        <div class="input-field" id="deviceForm_${item.id}" hidden>
                                            <input value="${item.name}" itemName="${item.name}" id="devName" type="text">
                                            <input value="${item.description}"  id="descName" type="text">
                                            <button  class="btn-floating btn-small waves-effect waves-light green">
                                                <i class="material-icons" id="ok_${item.id}" idItem='${item.id}'>check</i>
                                            </button>
                                            <button  class="btn-floating btn-small waves-effect waves-light red">
                                                <i class="material-icons" id="cancel_${item.id}" idItem='${item.id}'>cancel</i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        
                        contador++;
                        // Señal para colocar el formulario para agregar dispositivo
                        if(contador == 3){
                            // Formulario para agregar dispositivo
                            listaDevices += `
                                <div class="col m3 l3 xl3" id="newDevForm" hidden>
                                    <h6> Agregar nuevo dispositivo</h6>
                                    <label for="devName">Nombre del dispositivo</label>
                                    <input placeholder="Lampara" id="devName" type="text" required>
                                    <label for="descName">Descripción</label>
                                    <input placeholder="Luz de la cocina" id="descName" type="text" required>
                                    <label>Tipo de dispositivo</label>
                                    <select class="browser-default" id="newType" required>
                                        <option value="" disabled>Elija una opción</option>
                                        <option value="1" selected>ON/OFF</option>
                                        <option value="2">Dimerizable (0 a 100%)</option>
                                        <option value="3">Climatizador (16 a 30°C)</option>
                                    </select>
                                    <br>
                                    <button class="btn waves-effect waves-light blue" id="btn_agregar">Agregar</button>
                                    <button class="btn waves-effect waves-light right red" id="btn_cancelar">Cancelar</button>

                                </div>`
                        }
                        // Cada 4 tarjetas se cierra la fila y se abre una nueva
                        if (contador % 3 == 0) {
                            listaDevices += `</div><div class="row">`;
                        }
                    }
                    // Se cierra la última fila
                    listaDevices += `</div>`; 
    
                    ul.innerHTML = listaDevices;
                    // Se generan los listeners para los botones
                    for (let item of lista) {
                        let cb = this.recuperarElemento("cb_" + item.id);
                        cb.addEventListener("click", this);
                        let btnEdit = this.recuperarElemento("edit_btn_" + item.id);
                        btnEdit.addEventListener('click', this);
                        let btnDelete = this.recuperarElemento("delete_btn_" + item.id);
                        btnDelete.addEventListener('click', this);
                        let btnOk = this.recuperarElemento("ok_" + item.id);
                        btnOk.addEventListener('click', this);
                        let btnCancel = this.recuperarElemento("cancel_" + item.id);
                        btnCancel.addEventListener('click', this);
                    }
                    let btnAgregar = this.recuperarElemento("btn_agregar");
                    btnAgregar.addEventListener('click', this);
                    let newCancelar = this.recuperarElemento("btn_cancelar");
                    newCancelar.addEventListener('click', this);
                } else {
                    alert("ERROR en la consulta");
                }
            }   
        };
        // Buscar dispositivos en la base de datos
        xmlHttp.open("GET", "http://localhost:8000/devices/", true);
        xmlHttp.send();
    }

    // Método para agregar un dispositivo
    private newDevice(nombre:string, desc: string, tipo: number): void {
        // Variable para armar el mensaje en formato JSON
        let messageJSON = { name:nombre,
                            description:desc,
                            type:tipo, };

        // Variable para realizar la petición
        let xmlHttpPost = new XMLHttpRequest();
        // Variable para el texto de respuesta
        let responseMetod = { html: 'Se ha actualizado el estado del dispositivo', classes: 'rounded waves-effect waves-light green' };
        // Se realiza la petición
        xmlHttpPost.open("POST", "http://localhost:8000/device/", true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify(messageJSON));

        // Se analiza el cambio de estado (Si tiene error se devuelve el mensaje de error)
        xmlHttpPost.onreadystatechange = () => {
            if (!(xmlHttpPost.status === 204)) {
                responseMetod = { html: 'Error al intentar actualizar el estado del dispositivo', classes: 'rounded waves-effect waves-light red' };
            }
        }
    }

    // Método para actualizar el estado de un dispositivo
    private updateStateDevice(idDevice: number, stateDevice: number): void {
        // Variable para armar el mensaje en formato JSON
        let messageJSON = { id: idDevice, state: stateDevice };

        // Variable para realizar la petición
        let xmlHttpPut = new XMLHttpRequest();

        // Variable para el texto de respuesta
        let responseMetod = { html: 'Se ha actualizado el estado del dispositivo', classes: 'rounded waves-effect waves-light green' };
        
        // Se realiza la petición
        xmlHttpPut.open("PUT", "http://localhost:8000/device/state/", true);
        xmlHttpPut.setRequestHeader("Content-Type", "application/json");
        xmlHttpPut.send(JSON.stringify(messageJSON));

        // Se analiza el cambio de estado (Si tiene error se devuelve el mensaje de error)
        xmlHttpPut.onreadystatechange = () => {
            if (!(xmlHttpPut.status === 204)) {
                responseMetod = { html: 'Error al intentar actualizar el estado del dispositivo', classes: 'rounded waves-effect waves-light red' };
            }
        }
    }

    // Método para actualizar nombre, descripción y/o tipo de dispositivo
    private updateDeviceInfo(idDevice: number, name: string, description: string){
        // Variable para armar el mensaje en formato JSON
        let messageJSON = { id: idDevice, name: name, description: description };

        // Variable para realizar la petición
        let xmlHttpPut = new XMLHttpRequest();

        // Variable para el texto de respuesta
        let responseMetod = { html: 'Se ha actualizado el estado del dispositivo', classes: 'rounded waves-effect waves-light green' };
        
        // Se realiza la petición
        xmlHttpPut.open("PUT", "http://localhost:8000/device/info/", true);
        xmlHttpPut.setRequestHeader("Content-Type", "application/json");
        xmlHttpPut.send(JSON.stringify(messageJSON));

        // Se analiza el cambio de estado (Si tiene error se devuelve el mensaje de error)
        xmlHttpPut.onreadystatechange = () => {
            if (!(xmlHttpPut.status === 204)) {
                responseMetod = { html: 'Error al intentar actualizar el estado del dispositivo', classes: 'rounded waves-effect waves-light red' };
            }
        }
    }

    private deleteDevice(idDevice: number): void {
        // Variable para realizar la petición
        let xmlHttpDelete = new XMLHttpRequest();
    
        // Variable para el texto de respuesta
        let responseMetod = { html: 'Se ha eliminado el dispositivo', classes: 'rounded waves-effect waves-light green' };
    
        // Se realiza la petición
        xmlHttpDelete.open("DELETE", `http://localhost:8000/device/${idDevice}`, true);
        xmlHttpDelete.setRequestHeader("Content-Type", "application/json");
        xmlHttpDelete.send();
    
        // Se analiza la respuesta (Si hay error se devuelve el mensaje de error)
        xmlHttpDelete.onreadystatechange = () => {
            if (xmlHttpDelete.readyState === XMLHttpRequest.DONE) {
                if (xmlHttpDelete.status === 200) {
                    responseMetod = { html: 'Dispositivo eliminado exitosamente', classes: 'rounded waves-effect waves-light green' };
                } else {
                    responseMetod = { html: 'Error al intentar eliminar el dispositivo', classes: 'rounded waves-effect waves-light red' };
                }
            }
        }
    }

    // Método para recuperar elementos del DOM
    private recuperarElemento(id: string):HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }
}

window.addEventListener('load', () => {
    
    let main: Main = new Main();
    
});

