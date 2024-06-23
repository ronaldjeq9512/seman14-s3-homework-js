import axios from 'axios'
import './style.css'

const personNameElement = document.getElementById('namePerson')
const personLastNameElement = document.getElementById('lastNamePerson')
const personCountryElement = document.getElementById('countryPerson')
const taskFormElement = document.getElementById('formulario');
const containerListElement = document.getElementById('containerList')
const containerMessageElement = document.getElementById('message');

const clearInputStyle = () => {
  personNameElement.style.borderColor = 'black';
  personLastNameElement.style.borderColor = 'black';
  personCountryElement.style.borderColor = 'black';
}

const validateInfo = () => {
  return personNameElement.value.trim() !== '' && 
  personLastNameElement.value.trim() !== '' && 
  personCountryElement.value.trim() !== '';
}

loadContent();

function loadContent(){
  document.addEventListener('DOMContentLoaded', readPersons);
}

async function readPersons() {
  const data = await axios.get('http://localhost:3000/persons');
  localStorage.setItem('persons', JSON.stringify(data.data));
  renderPersonsList()
}

function renderPersonsList() {
  const persons = JSON.parse(localStorage.getItem('persons')) || [];
  containerListElement.innerHTML = '';
  if (persons.length === 0) {
      containerListElement.innerHTML = '<p>El listado de notas está vacío</p>';
  } else {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const header = `
        <tr>
          <th>Indice</th>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>País</th>
          <th>Acciones</th>
        </tr>
      `;
      thead.innerHTML = header;
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      persons.forEach((person, index) => {
          const tr = document.createElement('tr');
          tr.className = 'tableItem';
          tr.innerHTML = `<td>${index + 1}</td>
                          <td>${person.personName}</td>
                          <td>${person.personLastName}</td>
                          <td>${person.personCountry}</td>
                          <td><button class="deleteButton" data-id="${person.id}">Eliminar</button></td>`;
          tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      containerListElement.appendChild(table);
      syncHorizontalScroll(thead, tbody);
  }
}

async function createPerson(personToCreate) {
  const data = await axios.post('http://localhost:3000/persons', personToCreate)
  return data.data
}

const updateValues = async() => {
  const newPerson = {
      personName: personNameElement.value.trim(),
      personLastName: personLastNameElement.value.trim(),
      personCountry: personCountryElement.value.trim(),
  };
  const persons = JSON.parse(localStorage.getItem('persons')) || [];
  const newData = await createPerson(newPerson);
  persons.push(newData);
  localStorage.setItem('persons', JSON.stringify(persons));
  renderPersonsList();
}

async function deletePerson(iDelete) {
  const idToPersonDelete = iDelete
  await axios.delete(`http://localhost:3000/persons/${idToPersonDelete}`)
  await readPersons()
}

containerListElement.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteButton')) {
      const index = e.target.getAttribute('data-id');
      deletePerson(index);
  }
});

const sendErrorMessage = () => {
  if (personCountryElement.value.trim() === '') {
      personCountryElement.style.borderColor = 'red';
  }
  if (personLastNameElement.value.trim() === '') {
    personLastNameElement.style.borderColor = 'red';
  }
  if (personNameElement.value.trim() === '') {
    personNameElement.style.borderColor = 'red';
  }
  containerMessageElement.innerHTML = '<p>Debes llenar todas las casillas</p>';
}

const clearForm = () => {
  taskFormElement.reset();
  containerMessageElement.innerHTML = '';
  clearInputStyle();
}

const submitElements = (e) => {
  e.preventDefault();
  if (validateInfo()) {
      updateValues();
      clearForm();
  } else {
      sendErrorMessage();
  }
}

taskFormElement.addEventListener('submit', submitElements);

function syncHorizontalScroll(thead, tbody) {
  tbody.addEventListener('scroll', () => {
    thead.style.transform = `translateX(-${tbody.scrollLeft}px)`;
  });
}
