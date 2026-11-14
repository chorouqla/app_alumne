let state = [
  { id: '101', title: 'Dissenyar base de dades', description: 'Crear esquema ERD', status: 'todo' },
  { id: '102', title: 'Configurar servidor Node', description: 'Express i CORS', status: 'in-progress' }
];

const board = document.getElementById('board');
const form = document.getElementById('new-task-form');
const template = document.getElementById('task-card-template');


const titleInput = document.getElementById('task-title-input');
const descInput = document.getElementById('task-desc-input');
const formStatus = document.getElementById('task-status-select');


document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderAllTasks();
  setupEventListeners();
  updateTaskCount();
}

// MÒDUL 1 & 2
function createTaskCard(task) {
  // TODO M1.1: Clonar el template (.content.cloneNode(true))
  const clone = template.content.cloneNode(true) //copia los elementos de tenmplate

  // TODO M2.1: Assignar l'ID a l'atribut data-task-id de la targeta
  const card = clone.querySelector('.task-card')
  card.dataset.taskId = task.id; //sets the HTML attribute data-task-id

  // TODO M1.2: Omplir el títol (.task-title) i descripció (.task-desc)
  clone.querySelector('.task-title').textContent = task.title;
  clone.querySelector('.task-desc').textContent = task.description;

  // TODO M2.2: Assignar el valor del select (.task-status-select) segons task.status
  const statusSelect = clone.querySelector('.task-status-select')
  statusSelect.value = task.status; // selects the correct option in the card's dropdown

  // TODO M2.3: Si task.status === 'done', afegir la classe 'completed'
  if (task.status === 'done') {
    card.classList.add('completed');
  }// card.classList.add('completed'), not task.class(...) porque la clase pertenece a html no js

  // TODO M1.3: Retornar el node clonat so another function can insert it into the page
  return clone
}

function renderAllTasks() {
  // TODO M1.4: Netejar els contenidors i renderitzar les tasques de 'state' al seu contenidor corresponent

  //vaciar las columnas
  document.getElementById('todo-list').innerHTML = '';
  document.getElementById('in-progress-list').innerHTML = '';
  document.getElementById('done-list').innerHTML = '';

  //recorrer task
  state.forEach(task => {
    //search segun estado
    const container = document.getElementById(`${task.status}-list`);

    //crear y insertar la tarjeta
    container.appendChild(createTaskCard(task))

  });


}

function setupEventListeners() {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO M2.4: Afegir nova tasca a 'state' i renderitzar-la al DOM
    //crear nuevo objeto task
    const newTask = {
      id: Date.now().toString(),
      title: titleInput.value,
      description: descInput.value,
      status: formStatus.value
    };

    // TODO M2.5: Escoltar l'esdeveniment 'change' al board per quan es canvia l'estat del select:
    // - Trobar la targeta amb closest('.task-card')

    state.push(newTask);

    //crear la tarjeta
    const newCard = createTaskCard(newTask);

    // buscar su lista
    const container = document.getElementById(`${newTask.status}-list`);

    // - Llegir el nou estat i moure la targeta al seu contenidor (#todo-list, #in-progress-list, #done-list) amb appendChild
    // insertar al container
    container.appendChild(newCard);

    // - Actualitzar l'estat a 'state' i la classe '.completed'
    //limpiar el formulario
    form.reset();

    //actualizar el contador
    updateTaskCount();

  });

  board.addEventListener('change', (e) => {
    //try id the elemento cambiado esta el select
    if (e.target.matches('.task-status-select')) {

      // Encontrar la tarjeta
      const card = e.target.closest('.task-card');

      // Obtener el ID y el nuevo estado
      const id = card.dataset.taskId;
      const newStatus = e.target.value;

      // Buscar la tarea dentro del array state
      const task = state.find(task => task.id === id);


      //actualizar su estado
      task.status = newStatus;

      //actualizar la clase completed 
      if (newStatus === 'done') {
        card.classList.add('completed')
      } else {
        card.classList.remove('completed')
      }

      //buscar la nueva columna
      const container = document.getElementById(`${newStatus}-list`);
      container.appendChild(card);
    }
  });

  board.addEventListener('click', (e) => {
    const target = e.target;

    // TODO M4: Acordió (closest + nextElementSibling + .collapsed)
    // Acordeón
    if (target.closest('.column-header')) {

      const header = target.closest('.column-header');

      // Obtener el contenido que está después de la cabecera
      const content = header.nextElementSibling;

      // Ocultar o mostrar el contenido
      content.classList.toggle('collapsed');

      // Buscar el icono
      const icon = header.querySelector('.toggle-icon');

      // Cambiar la flecha
      if (content.classList.contains('collapsed')) {// checks whether it has it 
        icon.textContent = '▲';
      } else {
        icon.textContent = '▼';
      }
      return;
    }
    // TODO M2: Botó eliminar (closest + dataset.taskId + .remove())
    if (target.closest('.btn-delete')) {
      const card = target.closest('.task-card')
      const id = card.dataset.taskId;

      //eliminar del array state
      //we keep all the tasks where their id isnt of the deleted task
      state = state.filter(task => task.id !== id);
      card.remove();
      updateTaskCount();
      return;
    }

    // TODO M3: Botons pujar/baixar (previousElementSibling / nextElementSibling + insertBefore)
    //boton up 
    if (target.closest('.btn-up')) {
      const card = target.closest('.task-card');
      const previousCard = card.previousElementSibling;

      if (previousCard) {
        card.parentElement.insertBefore(card, previousCard);
      }
      return;
    }

    //boton bajar
    if (target.closest('.btn-down')) {
      const card = target.closest('.task-card')
      const nextCard = card.nextElementSibling;
      if (nextCard) {
        card.parentElement.insertBefore(nextCard, card);
      }
      return;
    }
  });
}


// MÒDUL 5: WEB COMPONENT
class TaskBadge extends HTMLElement {
  constructor() {
    super();
    // TODO M5.1: Attach shadow root
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  static get observedAttributes() { return ['count']; }
  attributeChangedCallback(name, oldValue, newValue) { if (oldValue !== newValue) this.render(); }

  render() {
    // TODO M5.2: Renderització de l'etiqueta
    const val = this.getAttribute('count') || '0';

    this.shadowRoot.innerHTML = `
    <style>
      .badge {
        background-color: #2563eb;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
      }
    </style>

    <span class="badge">
      Total tasks: ${val}
    </span>
  `;
  }
}
//This tells the browser that whenever it encounters: <task-badge></task-badge>, it should use our TaskBadge class
customElements.define('task-badge', TaskBadge);

function updateTaskCount() {
  // TODO M5.3: Actualitzar l'atribut count de #global-badge
  const total = board.querySelectorAll('.task-card').length;

  const badge = document.getElementById('global-badge');

  badge.setAttribute('count', total);
}
