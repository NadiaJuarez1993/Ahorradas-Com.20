/* UTILITIES */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

//GENERA id DINAMICO EN CADA USO
const randomId = () => self.crypto.randomUUID();

//FUNCION DE MOSTRAR Y OCULTAR ELEMENTOS DEL DOM
const showElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.remove("hidden");
  }
};
const hideElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.add("hidden");
  }
};

//SETEA Y TRAE INFO DEL LOCAL STORAGE
const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

//INICIALIZACION DE NUESTROS USUARIOS
const allOperations = getData("operations") || []; //logica para pintar tabla: PEDIMOS INFO AL LOCAL STORAGE, SI TRAE INFO SE GUARDA EN VARIABLE ALL USERS Y SI NO SE CUMPLE SE GUARDA EN EL ARRAY VACIO

//funcion de limpieza
const cleanContainer = (selector) => ($(selector).innerHTML = "");

/*OPERACIONES*/
const renderOperations = (operations) => {
  cleanContainer("#operation-table-body")
  // funcion para tabla de operaciones
  if (operations.length) {
    hideElement(["#without-operations"]);
    showElement(["#width-operations"]);
    for (const operation of operations) {
      const categorySelected = getData("categories").find(
        (category) => category.id === operation.category
      );
      const amountType =
        operation.type === "ganancia" ? "text-green-400" : "text-red-400";
      const amountSign = operation.type === "ganancia" ? "+$" : "-$";
      $("#operation-table-body").innerHTML += `
       <tr>
         <td class="py-4 font-semibold">${operation.description}></td>
         <td class="text-green-500 py-2"> <span>${categorySelected.categoryName}</span></td>
         <td class="py-4">${operation.date}</td>
         <td class="py-4  ${amountType} ">${amountSign} ${operation.amount}</td>
         <td class="py-4">
         <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showFormEdit('${operation.id}')"><a>Editar</a></button>  
         <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showDeleteModal('${operation.id}', '${operation.description}')"><a>Eliminar</a></button>
         </td>
       </tr>  
       `;
    }
  } else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
  }
};

//Agregar operaciones
const addOperation = () => {
  const currentData = getData("operations"); // pido la info
  currentData.push(saveOperationsInfo()); // modifico la info
  setData("operations", currentData); // mando la data
  renderOperations(currentData); // aca aparece la tabla pintada pero undifine
};

/*GUARDAR OPERACION*/
const saveOperationsInfo = (operationId) => {
  return {
    id: operationId ? operationId : randomId(), //tengo user id, entonces guardame ese id que paso por parametro y sino pasame un id nuevo
    description: $("#description-input").value,
    amount: $("#amount-input").value,
    type: $("#type-input").value,
    category: $("#category-input").value,
    date: $("#date-input").value,
  };
};
//en el boton de editar le paso el ID por parametro onclick="showFormEdit('${operation.id}')" a la funciom, el id lo recibo en la funcion const showFormEdit = (operationsId) y asi definimos parametro

const showFormEdit = (operationId) => {
  //CAMBIO DE PANTALLA
  hideElement(["#main-view", "#btn-add-operation", "#new-opration-title"]);
  showElement([
    "#new-oparation-form",
    "#btn-edit-operation",
    "#edit-opration-title",
  ]);
  //LE PASAMOS EL ID AL BOTON EDITAR DEL FORM
  $("#btn-edit-operation").setAttribute("data-id", operationId);
  // PEDIMOS Y ENCONTRAMOS EL USUARIOJ
  const operationSelected = getData("operations").find(
    (operation) => operation.id === operationId
  ); //pido la  info al local storage y ejecuto la funcion find y pregunto si el user.id (editar) y pregunto si operation.id quiero quedarme con el que  estricamente igual a  operationsId
  $("#description-input").value = operationSelected.description; //precargo el formulario con esa info
  $("#amount-input").valueAsNumber = operationSelected.amount; //precargo el formulario con esa info
  $("#type-input").value = operationSelected.type;
  $("#category-input").value = operationSelected.category; //precargo el formulario con esa info
  $("#date-input").value = operationSelected.date; //precargo el formulario con esa info
};

//editar operaciones
const editOperation = () => {
  const operationId = $("#btn-edit-operation").getAttribute("data-id"); //TTOMAMOS EL ID DEL BOTON
  const currentData = getData("operations").map((operation) => {
    if (operation.id === operationId) {
      return saveOperationsInfo(operationId); //TAREMOS LA OERACION MODIFICADOS
    }
    return operation;
  });
  setData("operations", currentData);
};

//mostrar ventana modal
const showDeleteModal = (operationId, operationDescription) => {
  showElement(["#delete-modal"]);
  hideElement(["#main-view", "#btn-add-operation", "#new-opration-title"]);
  $("#btn-delete").setAttribute("data-id", operationId); //paso de id  en ambos eliminar
  $("#operation-name").innerText = `${operationDescription}`;
  $("#btn-delete").addEventListener("click", () => {
    const operationId = $("#btn-delete").getAttribute("data-id"); //tomo el id de la operacion
    deleteOperation(operationId); //eliminacion
  });
};

//eliminar una operacion
const deleteOperation = (operationId) => {
  const currentData = getData("operations").filter(
    (operation) => operation.id != operationId
  );
  setData("operations", currentData);
  window.location.reload();
};

/*CATEGORIAS*/
/*categorias preestablecidas*/
const defaultCategories = [
  {
    id: randomId(), //genera id dinamico
    categoryName: "Comida",
  },
  {
    id: randomId(),
    categoryName: "Servicios",
  },
  {
    id: randomId(),
    categoryName: "Salidas",
  },
  {
    id: randomId(),
    categoryName: "Educacion",
  },
  {
    id: randomId(),
    categoryName: "Transporte",
  },
  {
    id: randomId(),
    categoryName: "Trabajo",
  },
];

const allCategories = getData("categories") || defaultCategories;

const renderCategoriesTable = (categories) => {
  cleanContainer("#table-category");
  for (const category of categories) {
    $("#table-category").innerHTML += `
     <tr>          
     <td class="text-green-500 w-3/6 my-5">${category.categoryName}
     </td>
        <td class="flex flex-row ">
           <button class="rounded-none bg-inherit text-blue-600 hover:text-black mr-3 w-3/6 my-5 pl-11" onclick="showEditCategory('${category.id}')" ><a>Editar</a></button>
            <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showDeleteCategoryModal('${category.id}', '${category.categoryName}')"><a>Eliminar</a></button>
         </td>
    </tr>
   `;
  }
};

const renderCategoryOptions = (categories) => {
  cleanContainer("#category-input");
  for (const category of categories) {
    $("#category-input").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
    $("#filter-category").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
  }
};
