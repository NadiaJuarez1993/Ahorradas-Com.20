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

//Fecha del dia en curso
const getCurrentDate = () => {
  //Se crea un nuevo objeto Date que representa la fecha y hora actuales.
  const today = new Date();
  //Se obtiene el año actual
  const year = today.getFullYear();
  // Se obtiene el mes actual. getMonth() devuelve un valor entre 0 y 11 (donde 0 es enero y 11 es diciembre),se suma 1 para obtener el número del mes correcto.  se convierte a string y se asegura que tenga 2 dígitos, con padStart(2, "0"). Esto añade un "0" al principio si el número del mes tiene solo un dígito.
  const month = String(today.getMonth() + 1).padStart(2, "0");
  // Se define el primer día del mes como "01".
  const firstDay = "01";
  //Se retorna la fecha en formato "YYYY-MM-DD", utilizando template literals.
  return `${year}-${month}-${firstDay}`;
};

//setea fecha en curso
const setFilterDate = () => {
  // // Llama a la función getCurrentDate() para obtener la fecha actual en formato "YYYY-MM-DD".
  const currentDate = getCurrentDate();
  //selecciona el elemento con el id "filter-date" y establece su valor a la fecha actual.
  $("#filter-date").value = currentDate;
  //selecciona el elemento con el id "amount-input" y establece su valor a la fecha actual.
  $("#amount-input").value = currentDate;
};

//TRAE INFO DEL LOCAL STORAGE
const getData = (key) => JSON.parse(localStorage.getItem(key));

//SETEAR INFO
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
  // Obtiene el valor del input de descripción y elimina los espacios en blanco al inicio y al final
  const description = $("#description-input").value.trim(); //.trim() quita los espacios qeu puedadn haber en el iput, al principio y al final, no los del medio
  const amount = $("#amount-input").valueAsNumber; //Obtiene el valor numérico del input de cantidad

  const amountRegex = /^-?\d+([.,]\d{1,2})?$/; //Expresión regular para validar la cantidad, permitiendo números negativos, decimales con punto o coma y hasta dos decimales

  if (description === "") {
    showElement(["#invalid-description"]); //// Muestra un mensaje de error
    $("#description-input").classList.add("border-red-500");
  } else {
    hideElement(["#invalid-description"]); // Oculta el mensaje de error
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
  const categoryFilter = $("#filter-category").value;
  const dateFilter = $("#filter-date").value;
  const orderFilter = $("#filter-order").value;

  let filteredOperations = operations;
  //Si typeFilter no es "Todos", se filtran las operaciones que tengan el tipo coincidente con typeFilter

  if (typeFilter !== "Todos") {
    filteredOperations = filteredOperations.filter((operation) => {
      return operation.type.toLowerCase() === typeFilter.toLowerCase();
    });
  }

  //Si categoryFilter no es "Todas las categorias", se filtran las operaciones basadas en la categoría seleccionada por el usuario
  if (categoryFilter !== "Todas las categorias") {
    filteredOperations = filteredOperations.filter((operation) => {
      const category = allCategories.find(
        (cat) => cat.id === operation.category
      );
      return category && category.id === categoryFilter;
    });
  }
  //Si dateFilter tiene algún valor, se filtran las operaciones basadas en la fecha seleccionada por el usuario.
  if (dateFilter) {
    filteredOperations = filteredOperations.filter(
      (operation) => new Date(operation.date) >= new Date(dateFilter)
    );
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

  //Renderizado y manejo de elementos visuales
  //se está evaluando si el arreglo filteredOperations tiene algún elemento, es decir, si filteredOperations.length es mayor que 0
  if (filteredOperations.length) {
    renderOperations(filteredOperations);
  } else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
    updateBalance(filteredOperations);
  }
};

/*Balance*/

//actualizacion de balance
const updateBalance = (operations) => {
  const allOperations = operations || getData("operations") || []; //Si operations es falsy (como null o undefined), obtiene los datos de "operations" desde json.Si aún así no se obtiene nada, se inicializa allOperations como un array vacío []
  let totalProfit = 0;
  let totalSpent = 0; //Se inicializan totalProfit y totalSpent en 0 para almacenar el total de ganancias y gastos respectivamente.
  for (const operation of allOperations) {
    // se recorre cada operación en allOperations. Si el tipo de operación (operation.type) es "Ganancia", se suma el monto (operation.amount) a totalProfit. Si es "Gasto", se suma el monto a totalSpent
    if (operation.type === "Ganancia") {
      totalProfit += operation.amount;
    } else if (operation.type === "Gasto") {
      totalSpent += operation.amount;
    }
  }
  const totalBalance = totalProfit - totalSpent;

  let balanceColor = "text-black"; //Se inicializa balanceColor como "text-black". Dependiendo del valor de totalBalance, se asigna un color diferente
  if (totalBalance > 0) {
    balanceColor = "text-green-400"; //Si totalBalance es mayor que 0, se asigna "text-green-400" (verde).
  } else if (totalBalance < 0) {
    balanceColor = "text-red-400"; //Si totalBalance es menor que 0, se asigna "text-red-400" (rojo).
  }
  $("#balance-total").classList.remove(
    "text-black",
    "text-green-400",
    "text-red-400"
  ); // Se actualiza el elemento con el id #balance-total en el DOM. Primero se eliminan las clases  (text-black, text-green-400, text-red-400).  se añade la clase correspondiente según balanceColor, que determina el color del texto basado en el balance total calculado.

  $("#balance-total").classList.add(balanceColor);

  $("#balance-profit").innerText = `+$${totalProfit.toFixed(2)}`; // Se actualiza el texto dentro de los elementos con los ids #balance-profit y #balance-spent en el DOM. Se muestra el total de ganancias (totalProfit) y el total de gastos (totalSpent), formateados como dinero con dos decimales.
  $("#balance-spent").innerText = `-$${totalSpent.toFixed(2)}`;
  $("#balance-total").innerText =
    totalBalance >= 0
      ? `+$${totalBalance.toFixed(2)}`
      : `-$${Math.abs(totalBalance).toFixed(2)}`; // Se actualiza el texto dentro del elemento con id #balance-total en el DOM, mostrando el balance total formateado como dinero con dos decimales. Si el balance es negativo, se muestra con un signo negativo.
  if (allOperations.length === 0) {
    $("#balance-profit").innerText = `+$0.00`;
    $("balance-spent").innerText = `-$0.00`;
    $("#balance-total").innerText = `$0.00`;
  }
};

/*REPORT*/

/*Category with the highest profit*/
const higherProfitCategory = () => { //(operations)?
  const allOperations = getData("operations") || [];
  //Se obtienen todas las operaciones y categorías almacenadas. Si no se encuentran datos, se inicializan como arreglos vacíos.
  const allCategories = getData("categories") || [];
  //Se recorren todas las operaciones para calcular las ganancias por categoría. Si la operación es de tipo "ganancia", se suma el monto a la categoría correspondiente.
  const profitByCategory = {};

  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      if (profitByCategory[operation.category]) {
        profitByCategory[operation.category] += operation.amount;
      } else {
        profitByCategory[operation.category] = operation.amount;
      }
    }
  }

  //Se recorren las ganancias por categoría para encontrar cuál tiene el monto más alto. Se busca el nombre de la categoría correspondiente usando su ID.
  let highestProfitCategory = "";
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

/*Render category with higher profit*/
const renderHigherProfitCategory = (getHigherProfitCategory) => {
  // Llama a la función getHigherProfitCategory y desestructura el objeto retornado para obtener highestProfitCategory y highestProfitAmount.
  const { highestProfitCategory, highestProfitAmount } =
    getHigherProfitCategory();

  $("#higher-profit-category").innerText = highestProfitCategory || "N/A"; // Actualiza el contenido del elemento con id "higher-profit-category" en el DOM, mostrando la categoría con mayor ganancia.Si no hay una categoría con mayor ganancia, muestra "N/A".
  $("#higher-profit-amount").innerText = `+$${highestProfitAmount.toFixed(2)}`; //Actualiza el contenido del elemento con id "higher-profit-amount" en el DOM, mostrando la cantidad de la mayor ganancia formateada como dinero con dos decimales.
};

/*Category with the highest spending*/
const higherSpendingCategory = () => {
  //(operations)?
  const allOperations = getData("operations") || [];
  const allCategories = getData("categories") || [];
  const spendingByCategory = {};

  for (const operation of allOperations) {
    //Si la operación es de tipo "gasto", se verifica si ya existe un gasto registrado para la categoría de la operación en expensesByCategory.
    //Si existe, se agrega el monto de la operación al gasto existente de esa categoría. Si no existe, se inicializa el gasto de esa categoría con el monto de la operación.
    if (operation.type === "gasto") {
      if (spendingByCategory[operation.category]) {
        spendingByCategory[operation.category] += operation.amount;
      } else {
        spendingByCategory[operation.category] = operation.amount;
      }
    }
  }

  let highestSpendingCategory = "";
  let highestSpendingAmount = 0;

  for (const categoryId in spendingByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryId
    )?.categoryName;

    if (spendingByCategory[categoryId] > highestExpenseAmount) {
      highestSpendingAmount = spendingByCategory[categoryId];
      highestSpendingCategory = categoryName;
    }
  }
  return { highestSpendingCategory, highestSpendingAmount };
};

/*Renderizar categoría con mayor gasto*/
const renderHigherSpendingCategory = (getHigherSpendingCategory) => {
  // Llama a la función getHigherExpenseCategory y desestructura el objeto retornado para obtener highestExpenseCategory y highestExpenseAmount.
  const { highestSpendingCategory, highestSpendingAmount } =
    getHigherSpendingCategory();
  $("#higher-expenses-category").innerText = highestSpendingCategory; // Actualiza el contenido del elemento con id "higher-expenses-category" en el DOM, mostrando la categoría con mayor gasto.
  $("#higher-expenses-amount").innerText = `-$${highestSpendingAmount.toFixed(
    2
  )}`; //Actualiza el contenido del elemento con id "higher-expenses-amount" en el DOM, mostrando la cantidad del mayor gasto formateada como dinero con dos decimales.
};

/*Category with the higher balance*/
const highestBalanceCategory = () => {
  const allOperations = getData("operations") || []; //se obtienen todas las operaciones y categorías almacenadas. Si no hay datos, se inicializan como arrays vacíos.
  const allCategories = getData("categories") || []; //se obtienen todas las operaciones y categorías almacenadas. Si no hay datos, se inicializan como arrays vacíos.
  const balanceByCategory = {}; //Se crea un objeto vacío para almacenar los balances acumulados por categoría.

  for (const operation of allOperations) {
    const { category, amount, type } = operation; //Se recorre cada operación y se iteran sus propiedades category, amount y type.

    if (type === "ganancia" || type === "gasto") {
      if (balanceByCategory[category]) {
        balanceByCategory[category] += type === "ganancia" ? amount : -amount; //Si la categoría  existe en balanceByCategory, se suma o resta el amount  si es una ganancia o un gasto.
      } else {
        balanceByCategory[category] = type === "ganancia" ? amount : -amount; //Si la categoría no existe, se inicia con el amount (positivo para ganancia, negativo para gasto).
      }
    }
  }

  let highestBalanceCategory = "";
  let highestBalanceAmount = 0;

  for (const categoryId in balanceByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryId
    )?.categoryName; //Se recorre el objeto balanceByCategory para encontrar la categoría con el balance más alto.

    if (balanceByCategory[categoryId] > highestBalanceAmount) {
      highestBalanceAmount = balanceByCategory[categoryId];
      highestBalanceCategory = categoryName; //Si el balance de la categoría es mayor que  higherBalanceAmount, se actualizan  higherBalanceAmount y  higherBalanceCategory.
    }
  }

  return [highestBalanceCategory, highestBalanceAmount]; //se devuelve un array con el nombre de la categoría con el mayor balance y la cantidad del balance.
};

/*Render Highest Balance Category */ 
const renderHighestBalanceCategory = (getHigherBalanceCategory) => {
   const { highestBalanceCategory, highestBalanceAmount }  =
     getHigherBalanceCategory(); //devuelve un objeto con higherExpenseCategory (la categoría con mayor balance) higherBalanceAmount (el monto del balance).
  $("#higher-balance-category").innerText = highestBalanceCategory || "N/A";
  $("#higher-balance-amount").innerText = `$${highestBalanceAmount.toFixed(2)}`;
};

/*Higher profit month */
const higherProfitMonth = () => {
  const allOperations = getData("operations") || []; //Se buscan todas las operaciones almacenadas. Si no hay datos, se inicializa como un array vacío.
  const profitByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "ganancia") {
      //Se recorre cada operación y se verifica si es de tipo "ganancia".
      const operationDate = new Date(operation.date); //Se crea un objeto Date a partir de la fecha de la operación.
      const monthYear = `$(operationDate.getMonth() + 1)} -${operationDate.getFullYear()}`; //Se obtiene el mes y el año de la operación en formato "mes-año".

      if (profitByMonth[monthYear]) {
        profitByMonth[monthYear] += operation.amount; //Si ya existe un registro para el mes-año en profitByMonth, se suma el monto de la operación.
      } else {
        profitByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestProfitMonth = "";
  let highestProfitAmount = 0;

  for (const monthYear in profitByMonth) {
    const profitAmount = profitByMonth[monthYear];

    if (profitAmount > highestProfitAmount) {
      highestProfitAmount = profitAmount;
      highestProfitMonth = monthYear;
    } //Si la ganancia del mes actual es mayor que higherProfitAmount, se actualizan higherProfitAmount y higherProfitMonth.
  }
  return { highestProfitMonth, highestProfitAmount };
}

/*Render higher profit month*/
const renderHigherProfitMonth = (getHigherProfitMonth) => {
  const { highestProfitMonth, highestProfitAmount } = getHigherProfitMonth(); // Se tienen el mes con mayor ganancia y el monto de la mayor ganancia llamando a getHigherProfitMonth

  $("#higher-profit-month").innerText = highestProfitMonth || "N/A";
  $(
    "#higher-profit-month-amount"
  ).innerText = ` +$${highestProfitAmount.toFixed(2)}`;
}





















//Mostrar reporte
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

  setFilterDate();
  filterOperations(allOperations);

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
