const selectElement = document.createElement("select");
selectElement.id = "typeFilter";
selectElement.innerHTML = `
  <option value="Sales Order">Sales Order</option>
  <option value="Purchase Order">Purchase Order</option>
`;
selectElement.style.padding = "3px 12px";
selectElement.style.border = "1px solid #d1d8dd";
selectElement.style.borderRadius = "4px";
selectElement.style.backgroundColor = "#fff";
selectElement.style.color = "#333";
selectElement.style.fontSize = "14px";
selectElement.style.height = "27px";
selectElement.style.minWidth = "100px";
selectElement.style.outline = "none";
selectElement.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
selectElement.style.cursor = "pointer";
selectElement.style.marginLeft = "10px";

selectElement.addEventListener("mouseover", () => {
  selectElement.style.borderColor = "#9e9e9e";
});
selectElement.addEventListener("mouseout", () => {
  selectElement.style.borderColor = "#d1d8dd";
});

const customActions = document.getElementsByClassName("page-actions");
setTimeout(() => {
  if (window.location.pathname === "/app/item/view/calendar/default") {
    if (customActions[0]) {
      customActions[0].appendChild(selectElement);
    }
  }
}, 1000);
let currentTypeFilter = "Sales Order";
selectElement.addEventListener("change", () => {
  currentTypeFilter = selectElement.value;
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
      },
    };
  },
};
