const selectElement = document.createElement("select");
const villaSelect = document.createElement("select");
selectElement.id = "typeFilter";
villaSelect.id = "villaFilter";
selectElement.innerHTML = `
  <option value="Villa Sales Bill">Villa Sales Bill</option>
  <option value="Villa Purchase Bill">Villa Purchase Bill</option>
`;
villaSelect.innerHTML = `
  <option value="All" selected>All</option>
`;
const commonStyles = {
  border: "1px solid #d1d8dd",
  borderRadius: "4px",
  backgroundColor: "#fff",
  color: "#333",
  fontSize: "14px",
  height: "27px",
  minWidth: "100px",
  outline: "none",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  marginLeft: "10px",
};
Object.assign(selectElement.style, commonStyles);
Object.assign(villaSelect.style, commonStyles);

selectElement.addEventListener("mouseover", () => {
  selectElement.style.boxShadow = "0px 4px 8px rgba(158, 158, 158, 0.5)";
});
selectElement.addEventListener("mouseout", () => {
  selectElement.style.boxShadow = "0px 2px 4px rgba(209, 216, 221, 0.5)";
});
villaSelect.addEventListener("mouseover", () => {
  villaSelect.style.boxShadow = "0px 4px 8px rgba(158, 158, 158, 0.5)";
});
villaSelect.addEventListener("mouseout", () => {
  villaSelect.style.boxShadow = "0px 2px 4px rgba(209, 216, 221, 0.5)";
});

frappe.call({
  method: "sereneescapes.villa_management.py.itemCalendar.getItems",
  callback: (r) => {
    const items = r.message;
    for (let i = 0; i < items.length; i++) {
      const option = document.createElement("option");
      option.value = items[i].item_code;
      option.text = items[i].item_code;
      villaSelect.appendChild(option);
    }
  },
});

const customActions = document.getElementsByClassName("page-actions");
setTimeout(() => {
  if (window.location.pathname === "/app/item/view/calendar/default") {
    if (customActions[0]) {
      customActions[0].appendChild(selectElement);
      customActions[0].appendChild(villaSelect);
    }
  }
}, 100);

let currentTypeFilter = "Villa Sales Bill";
let currentVillaName = "All";
selectElement.addEventListener("change", () => {
  currentTypeFilter = selectElement.value;
  const calendar = frappe.views.calendar["Item"];
  if (calendar && calendar.get_events_method) {
    frappe.call({
      method: calendar.get_events_method,
      args: {
        start: moment().startOf("month").format(),
        end: moment().endOf("month").format(),
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
});

villaSelect.addEventListener("change", () => {
  currentVillaName = villaSelect.value;
  const calendar = frappe.views.calendar["Item"];
  if (calendar && calendar.get_events_method) {
    frappe.call({
      method: calendar.get_events_method,
      args: {
        start: moment().startOf("month").format(),
        end: moment().endOf("month").format(),
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
});

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
        villa_name: currentVillaName
      },
    };
  },
};
