/*****************************************
*	Gestion des fenêtres modales
*	Auteur 		: Dakin Quelia
*	Version 	: 1.0.0. 
*****************************************/
class Modal 
{
    /**
    *   Le constructeur
    **/
    constructor()
    {
        // Les variables globales
        this.focusableselector = 'button, a, input, textarea';
        this.previouslyfocused = null;
        this.modal = null;
        this.html = null;
        this.focusables = [];
    }

    /**
    *   Cette méthode initialise nos fenêtres
    **/
    Init()
    {
        try 
        {
            // On sélectionne tous les boutons/liens qui ont la classe .jsmodal
            document.querySelectorAll(".jsmodal").forEach(a => 
            {
                a.addEventListener('click', (event) => this.OpenModal(event));
            });
                    
            // On gère la gestion du clavier
            window.addEventListener('keydown', event =>
            {
                if (event.key === "Escape" || event.key === "Esc")
                {
                    this.CloseModal(event);
                }
                    
                if (event.key === "Tab" && this.modal !== null)
                {
                    this.FocusModal(event);
                }
            });
        } 
        catch (e) 
        {
            if (e instanceof ReferenceError) 
            {
                this.PrintError(e, true);
            }
            else 
            {
                this.PrintError(e, false);
            }
        }
    }

    /**
    *   Cette méthode permet d'ouvrir la fenêtre modale.
    *   @param {object} event
    **/
    async OpenModal(event)
    {
        event.preventDefault();

        const target = event.currentTarget.getAttribute('data-href');

        if (target.startsWith('#'))
        {
            this.modal = document.querySelector(target);
        }
        else
        {
            this.modal = await this.LoadModal(target);
        }

        this.focusables = Array.from(this.modal.querySelectorAll(this.focusableselector));
        this.previouslyfocused = document.querySelector(':focus');
        this.modal.style.display = null;
       
        // On vérifie l'existence du tableau Focusables
        if (typeof this.focusables !== "undefined")
        {
            this.focusables[0].focus();
        }   

        // On définit les attribus et clics de la fenêtre modale
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.setAttribute('aria-modal', 'true');    
        this.modal.querySelector('#close').addEventListener('click', () => this.CloseModal(event));
        this.modal.querySelector('#btnclose').addEventListener('click', () => this.CloseModal(event));
        this.modal.querySelector('#modalstop').addEventListener('click', () => this.StopPropagation(event));
    }

    /**
    *   Cette méthode permet d'ouvrir une fenêtre modale avec une URL ou une page. 
    *   @param {string} url
    **/
    async LoadModal(url)
    {
       const target = '#' + URL.split('#')[1];
       const existingmodal = document.querySelector(target);

       if (existingmodal !== null) 
       {
           return existingmodal;
       }

       const page = await fetch(URL).then(response => response.text());
       const element = document.createRange().createContextualFragment(page).querySelector(target);

       if (element === null)
       {
           throw `L'élément ${target} n'a pas été trouvé sur ${url}.`;
       }

       document.body.append(element);

       return element;
    }

    /**
    *   Créer une fenêtre modale
    *   @param {object} data
    **/
    Createmodal(data)
    {
        this.HTML = `
            <div id="${data.id}" class="modal" aria-hidden="true" role="dialog" aria-labelledby="titlemodal" style="display:none">
              <div class="modal-wrapper" id="modalstop">
                  <div class="modal-header">
                      <button class="modal-button close" id="close">&times;</button>
                      <h1 id="titlemodal">${data.title}</h1>
                  </div>
                  <div class="modal-content">
                      ${data.content}
                  </div>
                  <div class="modal-footer">
                      <div class="left">${data.footer}</div> 
                      <div class="right"><button class="modal-button" id="btnclose">Fermer</button></div> 
                  </div>
              </div>
            </div>
        `;

        document.body.appendChild(this.HTML);
    }

    /**
    *   Cette méthode permet de fermer la fenêtre modale. 
    *   @param {object} event
    **/
    CloseModal(event)
    {
        event.preventDefault();

        if (this.modal === null)
        {
            return;
        }
    
        if (typeof this.previouslyfocused !== "undefined" || this.previouslyfocused !== null)
        {
            this.previouslyfocused.focus();
        }

        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.removeAttribute('aria-modal');
        this.modal.querySelector('#close').removeEventListener('click', () => this.CloseModal(event));
        this.modal.querySelector('#btnclose').removeEventListener('click', () => this.CloseModal(event));
        this.modal.querySelector('#modalstop').removeEventListener('click', () => this.StopPropagation(event));
        this.modal.addEventListener('animationend', this.HideModal(this.modal));
    }

    /**
    *   Cette méthode permet de masquer la fenêtre modale.
    **/
    HideModal(modal) 
    {
        modal.style.display = "none";
        modal.removeEventListener('animationend', this.HideModal);
        modal = null;
    }

    /**
    *   Cette méthode permet d'arrêter la propagation.
    *   @param {object} event
    **/
    StopPropagation(event)
    {
        event.stopPropagation();
    }

    /** 
    *   Cette méthode permet de gérer le focus sur la fenêtre modale.
    *   @param {event} event 
    **/
    FocusModal(event)
    {
        event.preventDefault();

        let index = this.focusables.findIndex(f => f === this.modal.querySelector(':focus'));
    
        if (event.shiftKey === true)
        {
            index--;
        }
        else 
        {
            index++;
        }
    
        if (index >= this.focusables.length)
        {
            index = 0;
        }
    
        if (index < 0)
        {
            index = this.focusables.length - 1;
        }
    
        this.focusables[index].focus();
    }

    /**
    *   Afficher les erreurs en console
    *   @param {object} error 
    *   @param {string} explicit 
    **/
    PrintError (error, explicit) 
    {
       console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
    }
}

export default new Modal();