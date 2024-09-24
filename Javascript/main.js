/* UTILITIES */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*Generate dynamic ID in each use */
const randomId = () => self.crypto.randomUUID();

/*Function to show and hide DOM element */
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

/*Date of the current day */
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

/*Set current date */
const setFilterDate = () => {
  // // Llama a la función getCurrentDate() para obtener la fecha actual en formato "YYYY-MM-DD".
  const currentDate = getCurrentDate();
  //selecciona el elemento con el id "filter-date" y establece su valor a la fecha actual.
  $("#filter-date").value = currentDate;
  //selecciona el elemento con el id "date-input" y establece su valor a la fecha actual.
  $("#date-input").value = currentDate;
};

/* Bring information from the local storage*/
const getData = (key) => JSON.parse(localStorage.getItem(key));

/*Setear info from local storage */
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/*Cleaning function */
const cleanContainer = (selector) => ($(selector).innerHTML = "");

/*OPERATIONS*/

const allOperations = getData("operations") || []; //logica para pintar tabla: PEDIMOS INFO AL LOCAL STORAGE, SI TRAE INFO SE GUARDA EN VARIABLE ALL USERS Y SI NO SE CUMPLE SE GUARDA EN EL ARRAY VACIO

/*Render operations on the table*/
const renderOperations = (operations) => {
  $("#operation-table-body").innerHTML = "";
  cleanContainer("#operation-table-body");

  if (operations.length) {
    // funcion para tabla de operaciones
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
          <td class=" w-1/2 text-xs mt-4 text-right lg:text-center"> <span class="my-1 rounded bg-green-100 mt-4">${
            categorySelected.categoryName
          }</span></td>
          <td class=" hidden lg:flex lg:w-1/2 lg:text-center justify-center">${new Date(
            operation.date
          ).toLocaleDateString("es-ES")}</td>
          <td class="w-1/2 text-base mt-4 lg:text-center font-bold ${amountType}">${amountSign}${
        operation.amount
      }</td>
          <td class="w-1/2 text-right lg:text-center">
          <button onclick="showFormEdit('${
            operation.id
          }')"><a><img  class="w-7 h-7" src="Images/icons-editar.png" alt="image"/></a></button>  
          <button onclick="showDeleteModal('${operation.id}', '${
        operation.description
      }')"><a><img class="w-7 h-7" src="Images/icons-eliminar.png" alt="image" /></a></button>
          </td>
        </tr>  
        `;
    }
  } else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
  }
  updateBalance();
};

/*Add operation*/
const addOperation = () => {
  const currentData = getData("operations"); // pido la info
  currentData.push(saveOperationsInfo()); // modifico la info
  setData("operations", currentData); // mando la data
  // renderOperations(currentData); // aca aparece la tabla pintada pero undifine
  renderOperations(getData("operations"));
};

/*Save operation*/
const saveOperationsInfo = (operationId) => {
  return {
    id: operationId ? operationId : randomId(), //tengo user id, entonces guardame ese id que paso por parametro y sino pasame un id nuevo
    description: $("#description-input").value,
    category: $("#category-input-select").value,
    date: $("#date-input").valueAsDate,
    amount: $("#amount-input").valueAsNumber,
    type: $("#type-input").value,
  };
};
//en el boton de editar le paso el ID por parametro onclick="showFormEdit('${operation.id}')" a la funciom, el id lo recibo en la funcion const showFormEdit = (operationsId) y asi definimos parametro

/*Show form edit operation */
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
  $("#category-input-select").value = operationSelected.category; //precargo el formulario con esa info
  $("#date-input").value = operationSelected.date; //precargo el formulario con esa info
};

/*Edit operation */
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

/*Show delete operation modal */
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

/*Delete operation */
const deleteOperation = (operationId) => {
  const currentData = getData("operations").filter(
    (operation) => operation.id != operationId
  );
  setData("operations", currentData);
  window.location.reload();
};

/*CATEGORIES*/

/*Default Categories*/
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

/*Render the categories in the form */
const renderCategoryOptions = (categories) => {
  for (const category of categories) {
    $("#category-input-select").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
    $("#filter-category").innerHTML += `
    <option value="${category.id}">${category.categoryName}</option>
    `;
  }
};

/*Render categories tables */
const renderCategoriesTable = (categories) => {
  cleanContainer("#table-category");
  const allCategories = getData("categories") || defaultCategories;
  for (const category of allCategories) {
    $("#table-category").innerHTML += `
     <tr class="flex flex-wrap justify-between lg:flex-nowrap lg:items-center>          
     <td class="w-1/2 text-base mt-4">${category.categoryName}
     </td>
        <td class="w-1/2 text-right lg:text-right">
           <button onclick="showEditCategory('${category.id}')" ><a><img class="w-7 h-7" src="Images/icons-editar.png" alt="image"/></a></button>
           <button onclick="showDeleteCategoryModal('${category.id}', '${category.categoryName}')"><a><img class="w-7 h-7" src="Images/icons-eliminar.png" alt="image"/></a></button>
         </td>
    </tr>
   `;
  }
};

/*Save categoriy info */
const saveCategoryInfo = (categoryId) => {
  return {
    id: categoryId ? categoryId : randomId(),
    categoryName: $("#category-input").value,
  };
};

/*Add categorie */
const addCategory = () => {
  const currentData = getData("categories");
  currentData.push(saveCategoryInfo());
  setData("categories", currentData);
  renderCategoryOptions(currentData);
  renderCategoriesTable(currentData);
};

/*Show edith category form */
const showEditCategory = (categoryId) => {
  showElement(["#edit-categoy"]);
  hideElement(["#category-view"]);
  $("#btn-confirm-edit-category").setAttribute("data-id", categoryId);
  const categorySelected = getData("categories").find(
    (category) => category.id === categoryId
  );
  $("#category-input").value = categorySelected.categoryName;
};

/*Edith category */
const editCategory = () => {
  const categoryId = $("#btn-confirm-edit-category").getAttribute("data-id");
  const currentData = getData("categories").map((category) => {
    if (category.id === categoryId) {
      return {
        id:categoryId,
        categoryName: $("#category-input").value,
      }
    }
    return category;
  });
  setData("categories", currentData);
  renderCategoriesTable(currentData);
};

/*Show delete category modal */
const showDeleteCategoryModal = (categoryId, CategoryDelete) => {
  showElement(["#delete-category-modal"]);
  hideElement(["#category-view"]);
  $("#btn-delete-category").setAttribute("data-id", categoryId);
  $("#category-name").innerText = `${CategoryDelete}`;
  $("#btn-delete-category").addEventListener("click", () => {
    const categoryId = $("#btn-delete-category").getAttribute("data-id");
    deleteCategory(categoryId);
  });
};

/*Delete category */
const deleteCategory = (categoryId) => {
const allCategories = getData("categories") || defaultCategories;

const currentCategories = allCategories.filter(
    (category) => category.id !== categoryId
  );

  setData("operations", currentData);
  renderCategoriesTable(currentCategories)
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

/*FILTERS*/
const filterOperations = (operations) => {
  const typeFilter = $("#filter-type").value;
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
    updateBalance(filteredOperations);
  } else {
    showElement(["#without-operations"]);
    hideElement(["#width-operations"]);
    updateBalance(filteredOperations);
  }
};

/*Balance*/
/*Update balance*/
const updateBalance = (operations) => {
  const allOperations = operations || getData("operations") || []; //Si operations es falsy (como null o undefined), obtiene los datos de "operations" desde json.Si aún así no se obtiene nada, se inicializa allOperations como un array vacío []
  let totalProfit = 0;
  let totalSpent = 0; //Se inicializan totalProfit y totalSpent en 0 para almacenar el total de ganancias y gastos respectivamente.

  for (const operation of allOperations) {
    // se recorre cada operación en allOperations. Si el tipo de operación (operation.type) es "Ganancia", se suma el monto (operation.amount) a totalProfit. Si es "Gasto", se suma el monto a totalSpent
    if (operation.type === "ganancia") {
      totalProfit += operation.amount;
    } else if (operation.type === "gasto") {
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

  $("#balance-profit").innerText = `+$${totalProfit.toFixed(2)}`;
  $("#balance-spent").innerText = `-$${totalSpent.toFixed(2)}`;
  $("#balance-total").innerText =
    totalBalance >= 0
      ? `+$${totalBalance.toFixed(2)}`
      : `-$${Math.abs(totalBalance).toFixed(2)}`;
  // Se actualiza el texto dentro del elemento con id #balance-total en el DOM, mostrando el balance total formateado como dinero con dos decimales. Si el balance es negativo, se muestra con un signo negativo.
  if (allOperations.length === 0) {
    $("#balance-profit").innerText = `+$0.00`;
    $("#balance-spent").innerText = `-$0.00`;
    $("#balance-total").innerText = `$0.00`;
  }
};

/*REPORT*/

/*Category with the highest profit*/
const higherProfitCategory = () => {
  //(operations)?
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

    if (spendingByCategory[categoryId] > highestSpendingAmount) {
      highestSpendingAmount = spendingByCategory[categoryId];
      highestSpendingCategory = categoryName;
    }
  }
  return { highestSpendingCategory, highestSpendingAmount };
};

/*Render higher spending category*/
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
  const [highestBalanceCategory, highestBalanceAmount] =
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
      const monthYear = `${
        operationDate.getMonth() + 1
      } -${operationDate.getFullYear()}`; //Se obtiene el mes y el año de la operación en formato "mes-año".

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
};

/*Render higher profit month*/
const renderHigherProfitMonth = (getHigherProfitMonth) => {
  const { highestProfitMonth, highestProfitAmount } = getHigherProfitMonth(); // Se tienen el mes con mayor ganancia y el monto de la mayor ganancia llamando a getHigherProfitMonth

  $("#higher-profit-month").innerText = highestProfitMonth || "N/A";
  $(
    "#higher-profit-month-amount"
  ).innerText = ` +$${highestProfitAmount.toFixed(2)}`;
};

/*Higher spending month*/
const higherSpendingMonth = () => {
  const allOperations = getData("operations") || [];
  const spendingByMonth = {};

  for (const operation of allOperations) {
    if (operation.type === "gasto") {
      const operationDate = new Date(operation.date);
      const monthYear = `${
        operationDate.getMonth() + 1
      }-${operationDate.getFullYear()}`;

      if (spendingByMonth[monthYear]) {
        spendingByMonth[monthYear] += operation.amount;
      } else {
        spendingByMonth[monthYear] = operation.amount;
      }
    }
  }

  let highestSpendingMonth = "";
  let highestSpendingAmount = 0;

  for (const monthYear in spendingByMonth) {
    const spendingAmount = spendingByMonth[monthYear];

    if (spendingAmount > highestSpendingAmount) {
      highestSpendingAmount = spendingAmount;
      highestSpendingMonth = monthYear;
    }
  }
  return { highestSpendingAmount, highestSpendingMonth };
};

/*Render highest spending month */
const renderHigherSpendingMonth = (getHigherSpendingMonth) => {
  const { highestSpendingAmount, highestSpendingMonth } =
    getHigherSpendingMonth();

  $("#higher-expenses-month").innerText = highestSpendingMonth;
  $(
    "#higher-expenses-month-amount"
  ).innerText = `-$${highestSpendingAmount.toFixed(2)} `;
};

/*Totals by category*/
const totalsByCategory = () => {
  const allOperations = getData("operations") || []; //busca todas las operaciones
  const allCategories = getData("categories") || []; // busca las categorias
  const totalsByCategory = {}; //objeto vacio para guardar totales

  for (const operation of allOperations) {
    //itera
    const { category, amount, type } = operation; // busca datos

    if (type === "ganancia" || type === "gasto") {
      //si la categ. ya existe actualiza el tota;
      if (totalsByCategory[category]) {
        totalsByCategory[category][type] += amount;
      } else {
        totalsByCategory[category] = {
          // si no existe crea la entrada de esa categoria inicilaizando los totales de ganacia o gasto
          ganancia: type === "ganancia" ? amount : 0,
          gasto: type === "gasto" ? amount : 0,
        };
      }
    }
  }

  const renderedData = []; //almacena los resultados finales
  for (const categoryId in totalsByCategory) {
    const categoryName = allCategories.find(
      (category) => category.id === categoryId
    )?.categoryName; //busca la categoria

    const { ganancia, gasto } = totalsByCategory[categoryId];
    const balance = ganancia - gasto; //calcula balace

    renderedData.push({
      categoryName: categoryName || "N/A",
      ganancia,
      gasto,
      balance,
    });
  } // actualiza todo

  return renderedData;
};

/*Render total by categories*/
const renderTotalsByCategories = (getTotalsByCategories) => {
  const calculateTotalByCategory = getTotalsByCategories(); //llama a get totalsbycategories para tener un array con los totales por categoria

  cleanContainer("#table-totals-categories");

  for (const data of calculateTotalByCategory) {
    const { categoryName, ganancia, gasto, balance } = data;

    $("#table-totals-categories").innerHTML += ` 
    <tr class="flex justify-items-end">
    <td class="w-1/4 mr-1 text-left"> ${categoryName}</td>
    <td class="w-1/4 mr-1 text-green-500 text-center"> +$${ganancia}</td>
    <td class="w-1/4 mr-1 text-red-500 text-center">-$${gasto}</td>
    <td class="w-1/4 mr-1 text-center">${
      balance >= 0 ? `+$${balance}` : `-$${balance}`
    }</td>
    </tr>
    `;
  }
};

/*Totals by month */
const totalsByMonth = () => {
  const allOperations = getData("operations") || [];
  const totalsByMonth = {};

  for (const operation of allOperations) {
    const { amount, type, date } = operation;

    if (type === "ganancia" || type === "gasto") {
      const operationDate = new Date(date);
      const monthYear = `${
        operationDate.getMonth() + 1
      }-${operationDate.getFullYear()}`;

      if (totalsByMonth[monthYear]) {
        totalsByMonth[monthYear][type] += amount;
      } else {
        totalsByMonth[monthYear] = {
          ganancia: type === "ganancia" ? amount : 0,
          gasto: type === "gasto" ? amount : 0,
        };
      }
    }
  }

  const totals = [];

  for (const monthYear in totalsByMonth) {
    const { ganancia, gasto } = totalsByMonth[monthYear];
    const balance = ganancia - gasto;

    totals.push({
      monthYear,
      ganancia,
      gasto,
      balance,
    });
  }
  return totals;
};

/*Render totals by month */
const renderTotalsByMonth = (getTotalsByMonth) => {
  const totalsByMonth = getTotalsByMonth();

  cleanContainer("#table-totals-month");

  for (const data of totalsByMonth) {
    const { monthYear, ganancia, gasto, balance } = data;

    $("#table-totals-month").innerHTML += `
    <tr class="flex justify-items-end">
    <td class="w-1/4 mr-1 text-left">${monthYear}</td>
    <td class="w-1/4 mr-1 text-green-500 text-center">+$${ganancia}</td>
    <td class="text-red-400 w-1/4 mr-1 text-center">-$${gasto}</td>
    <td class"w-1/4 mr-1 text-center">${
      balance >= 0 ? `+$${balance}` : `-$${balance}`
    }</td>
    </tr>
    `;
  }
};

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

/*Function initialize App */
const initializeApp = () => {
  setData("operations", allOperations);
  setData("categories", allCategories);
  setFilterDate();
  renderOperations(allOperations);
  renderCategoriesTable(allCategories);
  renderCategoryOptions(allCategories);
  updateBalance(allOperations);
  showReports(allOperations);
  renderHigherProfitCategory(higherProfitCategory);
  renderHigherSpendingCategory(higherSpendingCategory);
  renderHighestBalanceCategory(highestBalanceCategory);
  renderHigherProfitMonth(higherProfitMonth);
  renderHigherSpendingMonth(higherSpendingMonth);
  renderTotalsByCategories(totalsByCategory);
  renderTotalsByMonth(totalsByMonth);
};

/*EVENTS*/
//Boton agregar nueva operacion
$("#new-operation-btn").addEventListener("click", () => {
  showElement(["#new-oparation-form"]);
  hideElement(["#main-view"]);
});

//boton agregar operacion
$("#btn-add-operation").addEventListener("click", (e) => {
  e.preventDefault(); // no recargar el form
  if (validateOperation()) {
    addOperation();
    hideElement(["#new-oparation-form"]);
    showElement(["#main-view"]);
    $("#new-oparation-form").reset();
  }
});

//boton cancelar nueva operacion operacion
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

//boton confirmar editar operacion
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

window.addEventListener("load", initializeApp);
