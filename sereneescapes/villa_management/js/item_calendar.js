frappe.views.calendar["Item"] = {
    field_map: {
      start: "start",
      end: "end",
      id: "id",
      title: "title",
      color: "color",
      allDay: "allDay",
      progress: "progress",
    },
    get_events_method:
      "sereneescapes.villa_management.py.itemCalendar.get_calendar_events",
  };
  