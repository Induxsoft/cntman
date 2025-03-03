var leadpass = {
    formid:"", form:null, ff:null,
    requesting:false,
    url_exit:"",
    _params:{},

    init()
    {
        this.form = document.getElementById(this.formid);
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

        try {
            this.requesting = true;
            InduxsoftCrudlModel.Submit(this.form);
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