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
  cleanContainer("#operation-table-body");
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
        <tr class=" flex flex-wrap justify-between lg:flex-nowrap lg:items-center">
          <td class=" w-1/2 text-base mt-4">${operation.description}</td>
          <td class=" w-1/2 text-xs mt-4 text-right lg:text-center"> <span>${categorySelected.categoryName}</span></td>
          <td class=" hidden lg:flex lg:w-1/2 lg:text-center justify-center">${operation.date}</td>
          <td class=" w-1/2 text-base mt-4 lg:text-center font-bold ${amountType} ">${amountSign} ${operation.amount}</td>
          <td class=" w-1/2 text-right lg:text-center">
          <button class="rounded-none bg-inherit text-blue-600 hover:text-black" onclick="showFormEdit('${operation.id}')"> <a><img  class="w-7 h-7" src="Images/icons-editar.png" alt="image"/> </a> </button>  
          <button class="rounded-none bg-inherit" onclick="showDeleteModal('${operation.id}', '${operation.description}')"><a><img class="w-7 h-7" src="Images/icons-eliminar.png" alt="image" /></a></button>
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

const saveCategoryInfo = (categoryId) => {
  return {
    id: categoryId ? categoryId : randomId(),
    categoryName: $("#category-input").value,
  };
};

const addCategory = () => {
  const currentData = getData("categories");
  currentData.push(saveCategoryInfo());
  setData("categories", currentData);
  renderCategoryOptions(currentData);
  renderCategoriesTable(currentData);
};

const showEditCategory = (categoryId) => {
  showElement(["#edit-categoy"]);
  hideElement(["#category-view"]);
  $("#btn-confirm-edit-category").setAttribute("data-id", categoryId);
  const categorySelected = getData("categories").find(
    (category) => category.id === categoryId
  );
  $("#category-input").value = categorySelected.categoryName;
};

const editCategory = () => {
  const categoryId = $("#btn-confirm-edit-category").getAttribute("data-id");
  const currentData = getData("categories").map((category) => {
    if (category.id === categoryId) {
      return saveCategoryInfo(categoryId);
    }
    return category;
  });
  setData("categories", currentData);
  renderCategoriesTable(currentData);
};

const showDeleteCategoryModal = (categoryId, CategoryDelete) => {
  showElement(["#delete-category-modal"]);
  hideElement(["#category-view"]);
  $("#btn-delete-category").setAttribute("data-id", categoryId);
  $("#category-name").innerText = `${CategoryDelete}`;
  $("#btn-delete-category").addEventListener("click", () => {
    const categoryId = $("#btn-delete-category").getAttribute("data-id");
    deleteCategory(categoryId);
    window.location.reload();
  });
};

const deleteCategory = (categoryId) => {
  const currentData = getData("categories").filter(
    (category) => category.id != categoryId
  );
  setData("categories", currentData);
  window.location.reload();
};

/*VALIDATIONS*/
const validateOperation = () => {
  // const regDescriptionNewOperation = new RegExp(`[/^\s*.*\S.*\s*$/]`);
  const description = $("#description-input").value.trim(); //.trim() quita los espacios qeu puedadn haber en el iput, al principio y al final, no los del medio
  const amount = $("#amount-input").valueAsNumber;

  const amountRegex = /^-?\d+([.,]\d{1,2})?$/;

  if (description === "") {
    showElement(["#invalid-description"]);
    $("#description-input").classList.add("border-red-500");
  } else {
    hideElement(["#invalid-description"]);
    $("#description-input").classList.remove("border-red-500");
  }

  if (amount === "" || !amountRegex.test(amount) || parseFloat(amount) === 0) {
    showElement(["#invalid-amount"]);
    $("#amount-input").classList.add("border-red-500");
  } else {
    hideElement(["#invalid-amount"]);
    $("#amount-input").classList.remove("border-red-500");
  }

  const passesValidations =
    description !== "" && amountRegex.test(amount) && parseFloat(amount) !== 0;
  return passesValidations;
};

/*Filters*/
const filterOperations = (operations) => {
  const typeFilter = $("#filter-type-select").value;
  const categoryFilter = $("#filter-category").value
  const dateFilter = $("#filter-date").value;
  const orderFilter = $("#filter-order").value;

  let filteredOperations = operations

  if (typeFilter !== "Todos"){
    filteredOperations = filteredOperations.filter ((operation) => {
      return operation.type.toLowerCase() === typeFilter.toLowerCase()
    })
  }

  if(categoryFilter !== "Todas") {
    filteredOperations = filteredOperations.filter((operation) => {
      const category = allCategories.find((cat) => cat.id === operation.category)
      return category && category.id === categoryFilter
    })
  }

  if (dateFilter){
    filteredOperations = filteredOperations.filter ((operation) => new Date(operation.date)>= new Date (dateFilter)
  )
  }

   switch (orderFilter) {
     case "mas-reciente":
       filteredOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
       break;
     case "menos-reciente":
       filteredOperations.sort((a, b) => new Date(a.date) - new Date(b.date));
       break;
     case "mayor-monto":
       filteredOperations.sort((a, b) => b.amount - a.amount);
       break;
     case "menor-monto":
       filteredOperations.sort((a, b) => a.amount - b.amount);
       break;
     case "a/z":
       filteredOperations.sort((a, b) =>
         a.description.localeCompare(b.description)
       );
       break;
     case "z/a":
       filteredOperations.sort((a, b) =>
         b.description.localeCompare(a.description)
       );
       break;
     default:
       break;
   }

   if(filteredOperations.length) {
    renderOperations(filterOperations)
    
   }else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
   }

}

/*REPORTES*/

/*Categoría con mayor ganancia*/

const highestProfitCategory = (operations) => {
  const allOperations = getData("operations") || [];
  //Se obtienen todas las operaciones y categorías almacenadas. Si no se encuentran datos, se inicializan como arreglos vacíos.
  const allCategories = getData("categories") || [];

  //Se recorren todas las operaciones para calcular las ganancias por categoría. Si la operación es de tipo "ganancia", se suma el monto a la categoría correspondiente.
  const profitByCategory = {};
  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      const category = String(operation.category);
      if (profitByCategory[operation.category]) {
        profitByCategory[operation.category] += operation.amount;
      } else {
        profitByCategory[operation.category] = operation.amount;
      }
    }
  }

  //Se recorren las ganancias por categoría para encontrar cuál tiene el monto más alto. Se busca el nombre de la categoría correspondiente usando su ID.
  let highestProfitCategory = " ";
  let highestProfitAmount = 0;
  for (const categoryId in profitByCategory) {
    const categoryName = allCategories.find(
      (category) => String(category.id) === categoryId
    )?.categoryName;

    if (profitByCategory[categoryId] > highestProfitAmount) {
      highestProfitAmount = profitByCategory[categoryId];
      highestProfitCategory = categoryName;
    }
  }

  //Se devuelve un objeto con el nombre de la categoría con mayores ganancias y el monto de estas.
  return { highestProfitCategory, highestProfitAmount };
};

/*Renderizar categoría con mayor ganancia*/
const renderHigherProfitCategory = (getHigherProfitCategory) => {
  const { highestProfitCategory, highestProfitAmount } =
    getHigherProfitCategory();

  $("#higher-profit-category").innerText = highestProfitCategory || "N/A";
  $("#higher-profit-amount").innerText = `+$${highestProfitAmount.toFixed(2)}`;
};

/*Category with the highest spending*/
const higherExpenseCategory = (operations) => {
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
  const expensesByCategory = {};

  for (const operation of allOperations) {
    //Si la operación es de tipo "gasto", se verifica si ya existe un gasto registrado para la categoría de la operación en expensesByCategory.
    //Si existe, se agrega el monto de la operación al gasto existente de esa categoría. Si no existe, se inicializa el gasto de esa categoría con el monto de la operación.
    if (operation.type === "gasto") {
      if (expensesByCategory[operation.category]) {
        expensesByCategory[operation.category] += operation.amount;
      } else {
        expensesByCategory[operation.category] = operation.amount;
      }
    }
  }

  let highestExpenseCategory = "";
  let highestExpenseAmount = 0;

  for (const categoryId in expensesByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryId
    )?.categoryName;

    if (expensesByCategory[categoryId] > highestExpenseAmount) {
      highestExpenseAmount = expensesByCategory[categoryId];
      highestExpenseCategory = categoryName;
    }
  }
  return { highestExpenseCategory, highestExpenseAmount };
};

/*Renderizar categoría con mayor gasto*/
const renderHigherExpenseCategory = (getHigherExpenseCategory) => {
  const { highestExpenseCategory, highestExpenseAmount } =
    getHigherExpenseCategory();
};

const showReports = (operations) => {
  const allOperations = operations || getData("operations") || [];

  const earnings = allOperations.filter(
    (operation) => operation.type === "ganancia"
  );
  const expenses = allOperations.filter(
    (operation) => operation.type === "gasto"
  );

  if (earnings.length >= 1 && expenses.length >= 1) {
    showElement(["#reports-results"]);
    hideElement(["#without-operations-report"]);
  } else {
    showElement(["#without-operations-report"]);
    hideElement(["#reports-results"]);
  }
};

/*EVENTS*/
const initializeApp = () => {
  setData("operations", allOperations);
  renderOperations(allOperations);

  setData("categories", allCategories);
  renderCategoriesTable(allCategories);
  renderCategoryOptions(allCategories);

  $("#new-operation-btn").addEventListener("click", () => {
    // cambio de pantalla para agregar nueva operacion
    showElement(["#new-oparation-form"]);
    hideElement(["#main-view"]);
  });

  $("#btn-add-operation").addEventListener("click", (e) => {
    e.preventDefault(); // no recargar el form
    if (validateOperation()) {
      addOperation();
      hideElement(["#new-oparation-form"]);
      showElement(["#main-view"]);
      $("#new-oparation-form").reset();
    }
  });

  $("#btn-cancel-operation").addEventListener("click", () => {
    hideElement(["#new-oparation-form"]);
    showElement(["#main-view"]);
  });

  //BOTON EDITAR OPERACION EN FORMULARIO
  $("#btn-edit-operation").addEventListener("click", (e) => {
    e.preventDefault();
    editOperation();
    window.location.reload(); // RECARGAMOS LA PAGINA
  });

  $("#btn-confirm-edit-category").addEventListener("click", (e) => {
    e.preventDefault();
    editCategory();
    window.location.reload(); // RECARGAMOS LA PAGINA
  });

  //boton de cerrar ventana modal
  $("#btn-close-modal").addEventListener("click", () => {
    hideElement(["#delete-modal"]);
    showElement(["#main-view"]);
  });

  $("#btn-cancel-modal").addEventListener("click", () => {
    hideElement(["#delete-modal"]);
    showElement(["#main-view"]);
  });

  $("#btn-category").addEventListener("click", () => {
    hideElement(["#main-view", "#report-view"]);
    showElement(["#category-view"]);
  });

  $("#btn-add-category").addEventListener("click", (e) => {
    addCategory();
    $("#category-input").value = "";
  });

  $("#btn-balance").addEventListener("click", () => {
    showElement(["#main-view"]);
    hideElement(["#category-view", "#new-oparation-form"]);
  });

  $("#btn-hamburguer-menu").addEventListener("click", () => {
    $("#menu-burguer").classList.remove("hidden");
    showElement(["#menu-burguer", "#nav-bar", "#btn-close-menu"]);
    hideElement(["#btn-hamburguer-menu"]);
    $([
      "#main-view",
      "category-view",
      "#report-view",
      "#new-oparation-view",
    ]).classList.add("mt-20");
  });

  $("#btn-close-menu").addEventListener("click", () => {
    showElement(["#btn-hamburguer-menu"]);
    hideElement(["#nav-bar", "#btn-close-menu"]);
    $([
      "#main-view",
      "category-view",
      "#report-view",
      "#new-oparation-view",
    ]).classList.remove("mt-20");
  });

  $("#btn-confirm-edit-category").addEventListener("click", () => {
    e.preventDefault();
    editCategory();
    window.location.reload();
  });

  $("#btn-cancel-edit-category").addEventListener("click", () => {
    showElement(["#category-view "]);
    hideElement(["#edit-categoy"]);
  });

  $("#btn-cancel-delete-category-modal").addEventListener("click", () => {
    showElement(["#category-view "]);
    hideElement(["#delete-category-modal"]);
  });

  $("#btn-close-delete-category-modal").addEventListener("click", () => {
    showElement(["#category-view "]);
    hideElement(["#delete-category-modal"]);
  });

  $("#filter-hidden").addEventListener("click", () => {
    hideElement(["#filter-form", "#filter-hidden"]);
    showElement(["#filter-show"]);
  });

  $("#filter-show").addEventListener("click", () => {
    hideElement(["#filter-show"]);
    showElement(["#filter-form", "#filter-hidden"]);
  });

  $("#filter-category").addEventListener("input", (e) => {
    const categoryId = e.target.value;
    const currentData = getData("operations");
    const filterOperations = currentData.filter(
      (operations) => operations.category === categoryId
    );
    renderOperations(filterOperations);
  });

  $("#btn-report").addEventListener("click", () => {
    hideElement(["#main-view", "#category-view"]);
    showElement(["#report-view"]);
  });
};

window.addEventListener("load", initializeApp);
