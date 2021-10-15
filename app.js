// Use  IIFE (immediately invoked function expression) to create modules
// the iife method returns an object which is public for use by other modules in the file

// Budget Controller Module

let budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
  }
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  // Public
  return {
    addItem: (type, des, val) => {
      let newItem, ID;
      // ID = lastID + 1
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item based on inc or exp type

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },
    deleteItem: (type, id) => {
      let ids, index;
      //
      ids = data.allItems[type].map((current) => {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: () => {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: () => {
      data.allItems.exp.forEach((current) => {
        current.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: () => {
      let allPerc = data.allItems.exp.map((current) => {
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: () => {
      console.log(data);
    },
  };
})();

// UI Controller Module
let UIController = (() => {
  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  const formatNumber = (num, type) => {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3 && int.length < 7) {
      // 2,000
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  let nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  // Public
  return {
    getInput: () => {
      return {
        //  GET the  type , description, value
        type: document.querySelector(DOMstrings.inputType).value, // will be either "inc" or "exp"
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: (obj, type) => {
      let html, newHtml, element;
      // 1. Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // 2. Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // 3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: (selectorID) => {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      ); // returns a list

      // convert the list to an array
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((cur) => {
        cur.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: (obj) => {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: (percentages) => {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: () => {
      let now, year, month, months;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(
        DOMstrings.dateLabel
      ).textContent = `${months[month]} ${year}`;
    },
    changeType: () => {
      let fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      nodeListForEach(fields, (current) => {
        current.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
    getDOMStrings: () => {
      return DOMstrings;
    },
  };
})();

// Global App Controller
let controller = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMStrings();
    // Add items event listener
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    // the keypress is attached on the document itself but no element
    document.addEventListener("keypress", (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    // Delete items event listener
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    // change event
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  const updateBudget = () => {
    // 1. Calculate Budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. read percentage from the budget controller
    let percentages = budgetCtrl.getPercentages();
    // 3. update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };
  const ctrlAddItem = () => {
    let input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();

    // Check if data fields were actually filled up i.e not empty
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //  3. Add the item to the UI controller
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear the fields
      UICtrl.clearFields();
      // 5. Calculate and Update Budget
      updateBudget();
      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = (event) => {
    let itemID, splitID, type, ID;
    // inc-0
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }
  };
  // Public
  return {
    init: () => {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
