document.addEventListener("DOMContentLoaded",()=>{post.init();});


var post=
{
    init()
    {
        this.btn_del_mini_post=document.getElementById("btn-del-mini-post");
        this.btn_del_port_post=document.getElementById("btn-del-port-post");
        
        if(this.btn_del_mini_post)this.btn_del_mini_post.addEventListener("click",()=>{this.DeleteThumbnail();});
        if(this.btn_del_port_post)this.btn_del_port_post.addEventListener("click",()=>{this.DeleteCover();});
    },
    DeleteCover()
    {
        if (!confirm("¿Esta seguro que desea eliminar la portada del evento?")) return;

        const portprev = document.getElementById("port-prev");
        const porttext = document.getElementById("port-caption");

        try {
            if (leadpass._params?._entity_id == "_new")
            {
                portprev.src = "#";
                porttext.textContent = "";
                leadpass.ff["portada"].value = "";
                leadpass.ff["-portada"].value = "";
            }
            else
            {
                leadpass.requesting = true;
                let endpoint = `/!/cntman/post/${leadpass._params?._entity_id}/?_act=delete-cover`;
                
                InduxsoftCrudlModel.InvokeService(endpoint, null,
                    (data) => 
                    {
                        portprev.src = "#";
                        porttext.textContent = "";
                        leadpass.ff["portada"].value = "";
                        leadpass.ff["-portada"].value = "";
                    },
                    (error) => { alert(error.message ?? JSON.stringify(error)); },
                "DELETE", false, false);
            }
        }
        catch (error) { console.error(error) }
        finally { leadpass.requesting = false; }
    },
    DeleteThumbnail()
    {
        if (leadpass.requesting || !confirm("¿Esta seguro que desea eliminar la miniatura del evento?")) return;

        const miniprev = document.getElementById("mini-prev");
        const minitext = document.getElementById("mini-caption");

        try 
        {
            if (leadpass._params?._entity_id == "_new")
            {
                miniprev.src = "#";
                minitext.textContent = "";
                leadpass.ff["miniatura"].value = "";
                leadpass.ff["-miniatura"].value = "";
            }
            else
            {
                leadpass.requesting = true;
                let endpoint = `/!/cntman/post/${leadpass._params?._entity_id}/?_act=delete-thumbnail`;
                
                InduxsoftCrudlModel.InvokeService(endpoint, null,
                    (data) => {
                        miniprev.src = "#";
                        minitext.textContent = "";
                        leadpass.ff["miniatura"].value = "";
                        leadpass.ff["-miniatura"].value = "";
                    },
                    (error) => { alert(error.message ?? JSON.stringify(error)); },
                "DELETE", false, false);
            }
        }
        catch (error) { console.error(error) }
        finally { leadpass.requesting = false; }
    },
}