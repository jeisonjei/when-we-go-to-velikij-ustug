
      var actions = {
        add: {
          name: "add",
          fn: "handleAddButtonClick",
        },
        check: {
          name: "check",
          fn: "handleCheckboxSelect",
        },
        delete: {
          name: "delete",
          fn: "handleDeleteClick",
        },
      };

      document.addEventListener('my:add', (event)=>{
        var id = event.detail.wrapperId;
        addToLocalStorage(id, JSON.stringify(event.detail));
        var order = getTaskOrder();
        order.push(id);
        saveTaskOrder(order);
      });

      document.addEventListener('my:delete', (event)=>{
        var id = event.detail.wrapperId;
        deleteFromLocalStorage(id);
        var order = getTaskOrder().filter(function(item){ return item !== id; });
        saveTaskOrder(order);
      });

      document.addEventListener('my:check', (event)=>{
        var id = event.detail.wrapperId;
        updateInLocalStorage(id, JSON.stringify(event.detail));
      });

      window.addEventListener('load', fillTasksFromLocalStorage);


      var headerTimeEl = document.querySelector(".header-time");
      var remainingTimeHoursElement = document.querySelector(
        ".header-time .hours",
      );
      var remainingTimeMinutesElement = document.querySelector(
        ".header-time .minutes",
      );
      var remainingTimeSecondsElement = document.querySelector(
        ".header-time .seconds",
      );
      var departureTime = new Date();
      departureTime.setFullYear(2026, 6, 31);
      departureTime.setHours(17, 0, 0, 0);
      var subtitleElement = document.querySelector(".subtitle");
      var dateToGoElement = document.createElement("div");

      dateToGoElement.innerHTML = `<p>${departureTime.toLocaleDateString()} в ${departureTime.toLocaleTimeString()}</p>`;
      subtitleElement.append(dateToGoElement);

      var diff = 0;

      setInterval(() => {
        diff = diff + 1000;
        var remaining = departureTime - Date.now();

        if (remaining < 0) {
          remaining = 0;
        }

        var h = Math.floor(remaining / 3600000);
        var m = Math.floor((remaining % 3600000) / 60000);
        var s = Math.floor((remaining % 60000) / 1000);

        remainingTimeHoursElement.innerHTML = `${h} часов`;
        remainingTimeMinutesElement.innerHTML = `${String(m).padStart(2, "0")} минут`;
        remainingTimeSecondsElement.innerHTML = `${String(s).padStart(2, "0")} секунд`;
      }, 1000);

      /*
        TASKS
      */

      var inputTaskField = document.querySelector("#add-task-field");
      var addButton = document.querySelector("#add-task");
      var tasksDiv = document.querySelector(".tasks");
      var taskId = 0;
      var currentTaskWrapperId;
      var currentTaskLabelId;

      registerInputEventListener(inputTaskField);
      addButton.addEventListener("click", handleAddButtonClick);

      function handleAddButtonClick() {
        taskId++;

        currentTaskWrapperId = `task-wrapper-${taskId}`;
        currentTaskCheckboxId = `task-checkbox-${taskId}`;
        currentTaskLabelId = `task-label-${taskId}`;
        currentTaskButtonId = `task-button-${taskId}`;

        let value = inputTaskField.value;

        let taskWrapperElement = createElement("div", {
          id: currentTaskWrapperId,
        });
        taskWrapperElement.classList.add("task-wrapper");

        let taskLabelElement = createElement("span", {
          id: currentTaskLabelId,
          textContent: value,
        });
        taskLabelElement.classList.add("task-label");

        let taskDeleteButton = createElement("button", {
          id: currentTaskButtonId,
          textContent: "Удалить",
        });
        for (const item of ["btn", "delete"]) {
          taskDeleteButton.classList.add(item);
        }

        let taskCheckboxElement = createElement("input", {
          id: currentTaskCheckboxId,
          type: "checkbox",
        });
        taskCheckboxElement.classList.add("task");

        registerCheckboxListener(taskCheckboxElement, currentTaskWrapperId);
        registerTaskDeleteEventListener(taskDeleteButton, currentTaskWrapperId);

        appendToParent(taskWrapperElement, [
          taskCheckboxElement,
          taskLabelElement,
          taskDeleteButton,
        ]);
        appendToParent(tasksDiv, [taskWrapperElement]);

        var event = new CustomEvent('my:add', {detail: {wrapperId: currentTaskWrapperId, value:value}});
        document.dispatchEvent(event);
      }

      function handleCheckboxSelect(taskWrapperId) {
        var checked;
        var wrapper = document.getElementById(taskWrapperId);
        var children = Array.from(wrapper.children);
        var label = children.find((element) => element.id.includes("label"));
        var labelValue = label.textContent;
        var labelTextDecoration = label.style.textDecorationLine;
        if (labelTextDecoration === "none" || labelTextDecoration === "") {
          label.style.textDecorationLine = "line-through";
          checked = true;
        } else {
          label.style.textDecorationLine = "none";
          checked = false;
        }

        var event = new CustomEvent('my:check', {detail: {wrapperId: taskWrapperId, value: labelValue, checked: checked}});
        document.dispatchEvent(event);
      }

      function handleDeleteClick(taskWrapperId) {
        let taskToDelete = document.getElementById(taskWrapperId);
        taskToDelete.remove();

        var event = new CustomEvent('my:delete', {detail: {wrapperId: taskWrapperId}});
        document.dispatchEvent(event);
      }

      function registerTaskDeleteEventListener(buttonElement, taskWrapperId) {
        buttonElement.addEventListener("click", () => {
          handleDeleteClick(taskWrapperId);
        });
      }

      function registerCheckboxListener(checkboxInputElement, taskWrapperId) {
        checkboxInputElement.addEventListener("click", (event) => {
          handleCheckboxSelect(taskWrapperId);
        });
      }

      function fillTasksFromLocalStorage(){
        var order = getTaskOrder();

        order.forEach(function(wrapperId){
          var taskData = JSON.parse(getFromLocalStorage(wrapperId));
          if(!taskData) return;
          var idNumber = parseInt(wrapperId.split("-").pop());
          if(idNumber > taskId){
            taskId = idNumber;
          }

          var checkboxId = "task-checkbox-" + idNumber;
          var labelId = "task-label-" + idNumber;
          var buttonId = "task-button-" + idNumber;

          var taskWrapperElement = createElement("div", { id: wrapperId });
          taskWrapperElement.classList.add("task-wrapper");

          var taskLabelElement = createElement("span", {
            id: labelId,
            textContent: taskData.value,
          });
          taskLabelElement.classList.add("task-label");

          if(taskData.checked){
            taskLabelElement.style.textDecorationLine = "line-through";
          }

          var taskDeleteButton = createElement("button", {
            id: buttonId,
            textContent: "Удалить",
          });
          for(var cls of ["btn", "delete"]){
            taskDeleteButton.classList.add(cls);
          }

          var taskCheckboxElement = createElement("input", {
            id: checkboxId,
            type: "checkbox",
          });
          taskCheckboxElement.classList.add("task");
          if(taskData.checked){
            taskCheckboxElement.checked = true;
          }

          registerCheckboxListener(taskCheckboxElement, wrapperId);
          registerTaskDeleteEventListener(taskDeleteButton, wrapperId);

          appendToParent(taskWrapperElement, [
            taskCheckboxElement,
            taskLabelElement,
            taskDeleteButton,
          ]);
          appendToParent(tasksDiv, [taskWrapperElement]);
        });
      }

      function registerInputEventListener(inputElement) {
        inputElement.addEventListener("keydown", (event) => {
          console.log(event);
          if (event.code === "Enter") {
            handleAddButtonClick();
          }
        });
      }

      function appendToParent(parent, children) {
        for (const child of children) {
          parent.appendChild(child);
        }
      }

      function createElement(tagName, options) {
        var element = document.createElement(tagName);
        if (options) {
          let keys = Object.keys(options);
          for (const key of keys) {
            element[key] = options[key];
          }
        }

        return element;
      }

      
    