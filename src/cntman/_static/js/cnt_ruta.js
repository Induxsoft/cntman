var rutascap = {
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

    setTableEvents()
    {
        if (!this.table) return;
        const events = this.table.EdiTable.Const.Events;

        const ik_curso = document.getElementById("ik-curso");
        const btn_up = document.getElementById("btn-up");
        const btn_down = document.getElementById("btn-down");
        const btn_add = document.getElementById("btn-add");
        const btn_edt = document.getElementById("btn-edt");
        const btn_del = document.getElementById("btn-del");

        btn_up.addEventListener("click", () => this.UpRow());
        btn_down.addEventListener("click", () => this.DownRow());
        btn_add.addEventListener("click", () => ik_curso.searchText("",false));
        btn_del.addEventListener("click", () => this.deleteCurso());
        ik_curso.change_event = (data) => { this.agregarCurso(data) };

        this.table.setInputKey("id",ik_curso);
        this.table.setInputKey("titulo",ik_curso);

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

    deleteCurso()
    {
        if (this.currindex < 0 || !this.curritem) return;
        let data = this.tableData();
        if (data.length < 1 || !confirm("¿Esta seguro que desea remover el curso seleccionado?")) return;

        this.table.DeleteRow(this.currindex);
    },

    async agregarCurso(c)
    {
        if (!c) return;
        let array = this.table?.DataArray ?? [];
        let data = this.tableData();

        const iexists = await array.findIndex(o => o.id == c.id);
        if (iexists > -1) {
            alert("¡El curso que intenta agregar ya se encuentra en la cuadricula!");
            this.table.NavTo(iexists,0);
            return
        }

        let item = {
            orden: (data.length + 1),
            curso: c.sys_pk,
            id: c.id,
            titulo: c.titulo
        };

        let index = data.length;
        if (array.length == data.length) this.table.AddRow();

        array[index] = item;
        this.table.UpdateRow(index);
    },

    submit()
    {
        if (this.requesting || !this.form) return;

        try {
            this.requesting = true;
            InduxsoftCrudlModel.Submit(this.form, {_detalle:this.tableData()});
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    },

    DeleteThumbnail()
    {
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la miniatura de la ruta?")) return;

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
                let endpoint = `/!/cntman/rutascap/${this._params?._entity_id}/?_act=delete-thumbnail`;
                
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
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la portada de la ruta?")) return;

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
                let endpoint = `/!/cntman/rutascap/${this._params?._entity_id}/?_act=delete-cover`;
                
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