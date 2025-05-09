document.addEventListener("DOMContentLoaded",()=>{post.init();});

var post =
{
    init()
    {
        this.btn_del_mini_post=document.getElementById("btn-del-mini-post");
        this.btn_del_port_post=document.getElementById("btn-del-port-post");

        this.quill = new Quill("#editor", {
            modules: 
            {
                toolbar: {
                    container: [
                        [{ "header": [1,2,3,4,5,6,false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ "list": "ordered"}, { "list": "bullet" }, { "list": "check" }],
                        ["link", "image", "video"],
                        ["blockquote", "code-block"],
                        ["clean"] //remove formatting button
                    ],
                    handlers: {
                        "image": post.ImageHandler
                    }
                }
            },
            theme: "snow"
        });
        
        if(this.btn_del_mini_post)this.btn_del_mini_post.addEventListener("click",()=>{this.DeleteThumbnail();});
        if(this.btn_del_port_post)this.btn_del_port_post.addEventListener("click",()=>{this.DeleteCover();});
    },

    ImageHandler()
    {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    let id_blog =document.querySelector('input[name="blog"]').value;
                    let id_post = document.querySelector('input[name="sys_guid"]').value;
                    let endpoint = `/!/cntman/post/${leadpass._params?._entity_id}/?_act=upload-image`;
                    
                    const formData = new FormData();
                    formData.append('id_blog', id_blog);
                    formData.append('id_post', id_post);
                    formData.append('image', file);

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    const range = this.quill.getSelection();
                    
                    this.quill.insertEmbed(range.index, 'image', data.url);
                } catch (error) {
                    console.error("Error al cargar imagen", error);
                }
            }
        };
    },
    DeleteCover()
    {
        if (leadpass.requesting || !confirm("¿Esta seguro que desea eliminar la portada de la publicación?")) return;

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
        if (leadpass.requesting || !confirm("¿Esta seguro que desea eliminar la miniatura de la publicación?")) return;

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