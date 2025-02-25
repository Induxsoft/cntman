var cursoscap = {
    formid:"", form:null, ff:null,
    stackid:"", stack:null,
    tableid:"", table:null,
    requesting:false,
    url_exit:"",
    currindex: -1,
    curritem: null,
    _params:{},

    init()
    {
        this.form = document.getElementById(this.formid);
        this.stack = document.getElementById(this.stackid);
        this.table = document.getElementById(this.tableid);
        this.ff = this.form.elements;

        const btn_submit = document.getElementById("btn-submit");
        const btn_upl_mini = document.getElementById("btn-upl-mini");
        const btn_del_mini = document.getElementById("btn-del-mini");
        const btn_upl_port = document.getElementById("btn-upl-port");
        const btn_del_port = document.getElementById("btn-del-port");
        const miniatura = document.getElementById("-miniatura");
        const miniprev = document.getElementById("mini-prev");
        const minitext = document.getElementById("mini-caption");
        const portada = document.getElementById("-portada");
        const portprev = document.getElementById("port-prev");
        const porttext = document.getElementById("port-caption");
        const btn_up = document.getElementById("btn-up");
        const btn_down = document.getElementById("btn-down");
        const btn_add = document.getElementById("btn-add");
        const btn_edt = document.getElementById("btn-edt");
        const btn_del = document.getElementById("btn-del");
        const btn_tema_1 = document.getElementById("btn-tema-1");
        const btn_tema_0 = document.getElementById("btn-tema-0");
        const mdl_tema = document.getElementById("modal-tema");

        btn_submit.addEventListener("click", (e) => this.submit());
        btn_del_mini.addEventListener("click", (e) => this.DeleteThumbnail());
        btn_del_port.addEventListener("click", (e) => this.DeleteCover());
        miniatura.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                if (!reader.onload) reader.onload = function(e) {
                    miniprev.src = e.target.result;
                };
                reader.readAsDataURL(file);
                minitext.textContent = file.name;
                this.ff["miniatura"].value = file.name;
            }
            else {
                miniprev.src = "#";
                minitext.textContent = "";
                this.ff["miniatura"].value = "";
                this.ff["-miniatura"].value = "";
            }
        });
        portada.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                if (!reader.onload) reader.onload = function(e) {
                    portprev.src = e.target.result;
                };
                reader.readAsDataURL(file);
                porttext.textContent = file.name;
                this.ff["portada"].value = file.name;
            }
            else {
                portprev.src = "#";
                porttext.textContent = "";
                this.ff["portada"].value = "";
                this.ff["-portada"].value = "";
            }
        });
        btn_up.addEventListener("click", () => this.UpRow());
        btn_down.addEventListener("click", () => this.DownRow());
        btn_edt.addEventListener("click", () => this.loadTopicModal());
        btn_del.addEventListener("click", () => this.deletetemacap());
        btn_tema_1.addEventListener("click", () => this.saveTopicModal());
        // btn_tema_0.addEventListener("click", () => {});
        /* mdl_tema.addEventListener("show.bs.modal", (e) => {
            e.target.removeAttribute('aria-hidden');
            e.target.removeAttribute('inert');
        }); */
        mdl_tema.addEventListener("hide.bs.modal", (e) => {
            document.querySelector("#mdl-frm-tema").reset();
            // e.target.setAttribute('aria-hidden', 'true');
            // e.target.setAttribute('inert', '');
        });

        this.setKeyboardShortcuts();
        this.setTableEvents();
    },

    setKeyboardShortcuts()
    {
        document.addEventListener("keydown", (e) => {
            // console.log("key: "+ e.key + " | " + "code: " + e.code);
            if (e.key === "Escape") {
                e.preventDefault();
                (this.url_exit !== "")
                    ? window.location.href = this.url_exit
                    : window.location.href = "../";
            }
            if (e.key === "F5") {
                e.preventDefault();
                window.location.reload();
            }
        });
    },

    setStackEvents()
    {
        if (!this.stack) return;

        this.stack.onElementClick = (item, index) => {
            this.currindex = index;
            this.curritem = item;
        };
        // Establecer observador al 'stack' para controlar la adición, eliminación o movimiento de elementos hijos.
        /* const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    console.log('> Nodos eliminados');
                    mutation.removedNodes.forEach(node => {
                        console.log(node)
                    });
                    console.log('> Nuevos nodos');
                    mutation.addedNodes.forEach(node => {
                        console.log(node)
                    });
                }
            }
        });
        const config = { childList: true, subtree: true };
        observer.observe(this.stack._stackContainer, config); */
    },

    setTableEvents()
    {
        if (!this.table) return;
        const events = this.table.EdiTable.Const.Events;

        this.table.Events[events.RowChanged] = (e) => {
            this.currindex = e.index;
            this.curritem = this.table.DataArray[e.index];
        };
        this.table.Events[events.RowDeleted] = (e) => {
            this.currindex = -1;
            this.curritem = null;
            this.enumerar();
        };
        this.table.Events[events.RowAdded] = (e) => {
            let item = this.table.DataArray[e.rowIndex];
            // Agregamos un identificador si no lo tiene para el correcto funcionamiento de las funciones de arbol (agregar hijos, mover de posición, etc).
            if (item) this.table._resolveKey(item);
        };
        this.table.Events[events.RowMoved] = (e) => {
            this.enumerar();
        };
        this.table.Events[events.BeforeUpdateCell] = (e) => { this.validateRowCells(e) };
        this.table.Events[events.ConfirmEdition] = (e) => { this.confirmRowCells(e) };
    },

    stackData(){ return this.stack?.getData() ?? [] },
    tableData(){ return (this.table?.DataArray??[]).filter(row => Object.keys(row??{}).length >= this.table.Columns.length) },

    enumerar()
    {
        let array = this.tableData();
        for (let i = 0; i < array.length; i++) {
            const row = array[i];
            row.orden = (i+1);
        }
        this.table._printRows();
    },

    UpRow()
    {
        let column = this.table.CurrentColIndex();
        let curidx = this.table.CurrentRowIndex();
        let nvoidx = (curidx - 1);
        if (nvoidx < 0) return;

        let a = this.table.DataArray[nvoidx];
        let b = this.table.DataArray[curidx];
        
        a.orden = (a.orden + 1);
        b.orden = (b.orden - 1);
        
        this.table.DataArray[nvoidx] = b;
        this.table.UpdateRow(nvoidx);
        this.table.DataArray[curidx] = a;
        this.table.UpdateRow(curidx);
        // Evitar perder el foco para seguir manipulando la misma fila.
        this.table.NavTo(nvoidx,column);
    },

    DownRow()
    {
        let column = this.table.CurrentColIndex();
        let curidx = this.table.CurrentRowIndex();
        let nvoidx = (curidx + 1);
        if (nvoidx == this.tableData().length) return;

        let a = this.table.DataArray[curidx];
        let b = this.table.DataArray[nvoidx];
        
        a.orden = (a.orden + 1);
        b.orden = (b.orden - 1);
        
        this.table.DataArray[nvoidx] = a;
        this.table.UpdateRow(nvoidx);
        this.table.DataArray[curidx] = b;
        this.table.UpdateRow(curidx);
        // Evitar perder el foco para seguir manipulando la misma fila.
        this.table.NavTo(nvoidx,column);
    },

    validateRowCells(e)
    {
        let field = e.coldef.field;
        let index = e.sender.RowIndexOfTd(e.td);
        let item = this.table?.DataArray[index] ?? {};

        // if (Object.keys(item).length < 1) return false;
        // console.log(typeof e.text, e.text);

        if (field == "duracion" && Number(e.text) < 0) {
            alert("El valor para '"+field+"' debe ser mayor a 0.");
            // e.cancel = true; //comentado por bucle.
            e.text = item[field];
            return false;
        }

        return true;
    },

    confirmRowCells(e)
    {
        let field = e.coldef.field;
        let index = e.sender.RowIndexOfTd(e.td);
        let item = this.table?.DataArray[index] ?? {};

        if ((item?.[field]??"") == e.text) return;

        if (field == "titulo") {
            if (!item.sys_guid) {
                item.sys_guid = tools.uuid();
                item.orden = (this.tableData().length + 1);
            }
            item.titulo = e.text;
        }
        if (field == "duracion") {
            item.duracion = Number(e.text);
        }
        
        this.table.DataArray[index] = item;
        this.table.UpdateRow(index);
    },

    loadTopicModal()
    {
        if (this.currindex < 0 || !this.curritem) return;
        const form = document.querySelector("#mdl-frm-tema");
        let fields = form.elements;

        fields["id"].value = this.curritem?.sys_guid ?? "";
        fields["orden"].value = this.curritem?.orden ?? 0;
        fields["titulo"].value = this.curritem?.titulo ?? "";
        fields["objetivo"].value = this.curritem?.objetivo ?? "";
        fields["descripcion"].value = this.curritem?.descripcion ?? "";
        fields["contenido"].value = this.curritem?.contenido ?? "";
        fields["url_video"].value = this.curritem?.url_video ?? "";
        fields["duracion"].value = this.curritem?.duracion ?? 0;

        tools.showModal("modal-tema");
    },

    saveTopicModal()
    {
        const form = document.querySelector("#mdl-frm-tema");
        let fields = form.elements;

        if (!form.reportValidity()) return;

        let index = this.table.CurrentRowIndex();
        let array = this.table?.DataArray ?? [];
        let data = this.tableData();
        let item = data.find(obj => obj.sys_guid == fields["id"].value) ?? {};
        let isnew = (fields["id"].value == "");

        Object.assign(item, {
            titulo: fields["titulo"].value,
            objetivo: fields["objetivo"].value,
            descripcion: fields["descripcion"].value,
            contenido: fields["contenido"].value,
            url_video: fields["url_video"].value,
            duracion: Number(fields["duracion"].value),
            minutos: Number(fields["duracion"].value) + " min"
        });

        if (isnew) {
            if (array.length == data.length) this.table.AddRow();
            index = data.length;

            item.sys_guid = tools.uuid();
            item.orden = (data.length + 1);
        }

        array[index] = item;
        this.table.UpdateRow(index);
        this.table.NavTo(index,1);
        this.currindex = index;
        this.curritem = item;
        tools.hideModal("modal-tema");
    },

    deletetemacap()
    {
        if (this.currindex < 0 || !this.curritem) return;
        let data = this.tableData();
        if (data.length < 1 || !confirm("¿Esta seguro que desea remover el tema seleccionado?")) return;

        this.table.DeleteRow(this.currindex);
    },

    submit()
    {
        if (this.requesting || !this.form) return;

        try {
            this.requesting = true;

            const tags_container = document.getElementById("tags_container");
            const checked_tags = tags_container.querySelectorAll('input[type="checkbox"]:checked');
            const tags = document.getElementById("tags");
            
            let etiquetas = [];

            if (checked_tags.length < 1) {
                alert("Es necesario indicar al menos una etiqueta.");
                return
            }
            if (checked_tags.length > 5) {
                alert("Solo es posible seleccionar un máximo de 5 etiquetas.");
                return
            }

            checked_tags.forEach((chk) => { etiquetas.push(chk.value) });
            tags.value = JSON.stringify(etiquetas);

            InduxsoftCrudlModel.Submit(this.form, {_detalle:this.tableData()});
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    },

    DeleteThumbnail()
    {
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la miniatura del curso?")) return;

        const miniprev = document.getElementById("mini-prev");
        const minitext = document.getElementById("mini-caption");

        try {
            if (this._params?._entity_id == "_new")
            {
                miniprev.src = "#";
                minitext.textContent = "";
                this.ff["miniatura"].value = "";
                this.ff["-miniatura"].value = "";
            }
            else
            {
                this.requesting = true;
                let endpoint = `/!/cntman/cursoscap/${this._params?._entity_id}/?_act=delete-thumbnail`;
                
                InduxsoftCrudlModel.InvokeService(endpoint, null,
                    (data) => {
                        miniprev.src = "#";
                        minitext.textContent = "";
                        this.ff["miniatura"].value = "";
                        this.ff["-miniatura"].value = "";
                    },
                    (error) => { alert(error.message ?? JSON.stringify(error)); },
                "DELETE", false, false);
            }
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    },

    DeleteCover()
    {
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la portada del curso?")) return;

        const portprev = document.getElementById("port-prev");
        const porttext = document.getElementById("port-caption");

        try {
            if (this._params?._entity_id == "_new")
            {
                portprev.src = "#";
                porttext.textContent = "";
                this.ff["portada"].value = "";
                this.ff["-portada"].value = "";
            }
            else
            {
                this.requesting = true;
                let endpoint = `/!/cntman/cursoscap/${this._params?._entity_id}/?_act=delete-cover`;
                
                InduxsoftCrudlModel.InvokeService(endpoint, null,
                    (data) => {
                        portprev.src = "#";
                        porttext.textContent = "";
                        this.ff["portada"].value = "";
                        this.ff["-portada"].value = "";
                    },
                    (error) => { alert(error.message ?? JSON.stringify(error)); },
                "DELETE", false, false);
            }
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    }
}