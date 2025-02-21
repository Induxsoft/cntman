var cursoscap = {
    formid:"", form:null, ff:null,
    stackid:"", stack:null,
    requesting:false,
    url_exit:"",
    currindex: -1,
    curritem: null,

    init()
    {
        this.form = document.getElementById(this.formid);
        this.stack = document.getElementById(this.stackid);
        this.ff = this.form.elements;

        const btn_submit = document.getElementById("btn-submit");
        const btn_up = document.getElementById("btn-up");
        const btn_down = document.getElementById("btn-down");
        const btn_add = document.getElementById("btn-add");
        const btn_edt = document.getElementById("btn-edt");
        const btn_del = document.getElementById("btn-del");
        const btn_tema_1 = document.getElementById("btn-tema-1");
        const btn_tema_0 = document.getElementById("btn-tema-0");
        const mdl_tema = document.getElementById("modal-tema");

        btn_submit.addEventListener("click", (e) => this.submit());
        btn_edt.addEventListener("click", (e) => this.loadTopicModal());
        btn_tema_1.addEventListener("click", (e) => this.saveTopicModal());
        mdl_tema.addEventListener("hidden.bs.modal", (e) => { document.querySelector("#mdl-frm-tema").reset(); });
        this.stack.onElementClick = (item, index) => {
            this.currindex = index;
            this.curritem = item;
        };

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

    stackData(){ return this.stack?.getData() ?? [] },

    loadTopicModal()
    {
        if (this.currindex < 0 || !this.curritem) return;
        const form = document.querySelector("#mdl-frm-tema");
        let fields = form.elements;

        fields["id"].value = this.curritem?.sys_guid ?? "";
        fields["orden"].value = this.curritem.orden;
        fields["titulo"].value = this.curritem.titulo;
        fields["objetivo"].value = this.curritem.objetivo;
        fields["descripcion"].value = this.curritem.descripcion;
        fields["contenido"].value = this.curritem.contenido;
        fields["url_video"].value = this.curritem.url_video;
        fields["duracion"].value = this.curritem.duracion;

        tools.showModal("modal-tema");
    },

    saveTopicModal()
    {
        const form = document.querySelector("#mdl-frm-tema");
        let fields = form.elements;
        let isnew = (fields["id"].value == "");

        if (!form.reportValidity()) return;

        let data = this.stackData();
        let item = data.find(obj => obj.sys_guid == fields["id"].value) ?? {};
        Object.assign(item, {
            orden: (isnew ? data.length + 1 : Number(fields["orden"].value)),
            titulo: fields["titulo"].value,
            objetivo: fields["objetivo"].value,
            descripcion: fields["descripcion"].value,
            contenido: fields["contenido"].value,
            url_video: fields["url_video"].value,
            duracion: Number(fields["duracion"].value)
        });

        if (isnew) { data.push(item); }
        else
        {
            let index = data.indexOf(obj => obj.sys_guid == fields["id"].value);
            data[index] = item;
        }

        this.stack?.setData(data);

        tools.hideModal("modal-tema");
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

            InduxsoftCrudlModel.Submit(this.form, {_detalle:this.stackData()});
        }
        catch (error) { console.error(error) }
        finally { this.requesting = false; }
    },
}