var leadpass = {
    formid:"", form:null, ff:null,
    requesting:false,
    url_exit:"",
    _params:{},

    init()
    {
        this.form = document.getElementById(this.formid);
        this.ff = this.form.elements;
        //cobros accesos
        this.cobro_acceso=document.getElementById("cobro_acceso");
        this.btn_table_add_row=document.getElementById("btn_table_add_row");
        this.btn_table_del_row=document.getElementById("btn_table_del_row");
        this.tbl_precios=document.getElementById("tbl_precios");
        this.container_table_precio=document.getElementById("container_table_precio");
        this.precio_user=document.getElementById("precio_user");

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
        if(btn_del_mini)btn_del_mini.addEventListener("click", (e) => this.DeleteThumbnail());
        if(btn_del_port)btn_del_port.addEventListener("click", (e) => this.DeleteCover());
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

        if(this.btn_table_add_row)this.btn_table_add_row.addEventListener("click",()=>
        {
            if(this.tbl_precios)this.tbl_precios.AddRow();
        });
        if(this.btn_table_del_row)this.btn_table_del_row.addEventListener("click",()=>
        {
            if(this.tbl_precios)
            {
                let index=this.tbl_precios.CurrentRowIndex();
                if(index<0)
                {
                    alert("Debe seleccionar un elemento de la tabla.");
                    return;
                }
                this.tbl_precios.DeleteCurrentRow();
            }
        });
        if(this.cobro_acceso)
        {
            this.cobro_acceso.addEventListener("change",()=>{this.DisableTable();});
            tools.trigger(this.cobro_acceso,"change");
        }
        this.setKeyboardShortcuts();

    },
    DisableTable()
    {
        if(!this.container_table_precio)return;

        if(!this.cobro_acceso.checked)
        {
            this.container_table_precio.classList.add("disabled-all");
            this.tbl_precios.DataArray=[];
            this.tbl_precios._printRows();
            this.precio_user.value=0;
        }
        else
        {
            this.container_table_precio.classList.remove("disabled-all");
        }
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

    submit()
    {
        if (this.requesting || !this.form) return;

        try 
        {
            this.requesting = true;
            var detalle={detalle:this.tbl_precios.DataArray.filter(r=> Number(r?.idsuscripcion??0) > 0)};
            
            InduxsoftCrudlModel.Submit(this.form,detalle);
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    },

    DeleteThumbnail()
    {
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la miniatura del evento?")) return;

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
                let endpoint = `/!/cntman/leadpass/${this._params?._entity_id}/?_act=delete-thumbnail`;
                
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
        if (this.requesting || !confirm("¿Esta seguro que desea eliminar la portada del evento?")) return;

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
                let endpoint = `/!/cntman/leadpass/${this._params?._entity_id}/?_act=delete-cover`;
                
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