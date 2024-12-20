function createDropdown(id, options, callback) {
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "dropdown-container";
  dropdownContainer.id = id;
  dropdownContainer.callback = callback;

  const selected = document.createElement("div");
  selected.className = "dropdown-selected";
  selected.textContent = options[0].label;
  dropdownContainer.appendChild(selected);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "dropdown-options";
  optionsContainer.style.display = "none";
  dropdownContainer.appendChild(optionsContainer);

  options.forEach((option) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "dropdown-option";
    optionDiv.textContent = option.label;
    optionDiv.dataset.value = option.value;

    optionDiv.addEventListener("click", () => {
      selected.textContent = option.label;
      optionsContainer.style.display = "none";
      callback(option.value);
    });

    optionsContainer.appendChild(optionDiv);
  });

  selected.addEventListener("click", () => {
    optionsContainer.style.display =
      optionsContainer.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", (event) => {
    if (!dropdownContainer.contains(event.target)) {
      optionsContainer.style.display = "none";
    }
  });

  return dropdownContainer;
}
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .dropdown-container {
    position: relative;
    width: 150px;
    margin-left: 10px;
    cursor: pointer;
  }
  .dropdown-selected {
    padding: 6px;
    border: 1px solid #d1d8dd;
    border-radius: 10px;
    background-color: #f3f3f3;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease-in-out;
  }
  .dropdown-selected:hover {
    box-shadow: 0px 4px 8px rgba(158, 158, 158, 0.5);
  }
  .dropdown-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    background-color: white;
    border: 1px solid #d1d8dd;
    border-radius: 4px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
  }
  .dropdown-option {
    padding: 10px;
    font-size: 14px;
    color: #333;
    background-color: #fff;
    min-width: 150px;
    transition: background-color 0.3s ease-in-out;
  }
  .dropdown-option:hover {
    background-color: #f0f0f0;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleTag);
const typeOptions = [
  { value: "Villa Sales", label: "Villa Sales" },
  { value: "Villa Purchase", label: "Villa Purchase" },
];
let villaOptions = [{ value: "All", label: "All" }];
const typeFilterDropdown = createDropdown(
  "typeFilter",
  typeOptions,
  (value) => {
    currentTypeFilter = value;
    refetchCalendar();
  }
);
const villaFilterDropdown = createDropdown(
  "villaFilter",
  villaOptions,
  (value) => {
    currentVillaName = value;
    refetchCalendar();
  }
);
const customActions = document.getElementsByClassName("page-actions");
const layoutContainer = document.getElementsByClassName("layout-main-section-wrapper");
setTimeout(() => {
  if (window.location.pathname === "/app/item/view/calendar/default") {
    if (customActions[0]) {
      layoutContainer[0].style.marginTop = "20px";
      customActions[0].appendChild(typeFilterDropdown);
      customActions[0].appendChild(villaFilterDropdown);
      $("span.sidebar-toggle-btn").hide();
      $(".col-lg-2.layout-side-section").hide();
    }
  }
}, 100);
frappe.call({
  method: "sereneescapes.villa_management.py.itemCalendar.getItems",
  callback: (r) => {
    const items = r.message;
    villaOptions.length = 0;
    villaOptions.push({ value: "All", label: "All" });  
    items.forEach((item) => {
      const option = { value: item.item_name, label: item.item_name };
      villaOptions.push(option);
    });
    updateDropdown(villaFilterDropdown, villaOptions);
  },
});

function updateDropdown(dropdown, options) {
  const optionsContainer = dropdown.querySelector('.dropdown-options');
  optionsContainer.innerHTML = '';
  options.forEach((option) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "dropdown-option";
    optionDiv.textContent = option.label;
    optionDiv.dataset.value = option.value;
    optionDiv.addEventListener("click", () => {
      const selected = dropdown.querySelector('.dropdown-selected');
      selected.textContent = option.label;
      optionsContainer.style.display = "none";
      dropdown.callback(option.value);
    });
    optionsContainer.appendChild(optionDiv);
  });
}
let currentTypeFilter = "Villa Sales";
let currentVillaName = "All";

function refetchCalendar() {
  const calendar = frappe.views.calendar["Item"];
  if (calendar && calendar.get_events_method) {
    frappe.call({
      method: calendar.get_events_method,
      args: {
        filters: {
          type: currentTypeFilter,
          villa_name: currentVillaName,
        },
      },
      callback: function (response) {
        cur_list.calendar.$cal.fullCalendar("refetchEvents");
      },
    });
  }
}

frappe.views.calendar["Item"] = {
  field_map: {
    start: "start",
    end: "end",
    id: "id",
    title: "title",
    color: "#000",
    allDay: "allDay",
    progress: "progress",
  },
  get_events_method:
    "sereneescapes.villa_management.py.itemCalendar.get_calendar_events",
  get_args: function (start, end) {
    return {
      start: start.format(),
      end: end.format(),
      filters: {
        type: currentTypeFilter,
        villa_name: currentVillaName,
      },
    };
  },
};
