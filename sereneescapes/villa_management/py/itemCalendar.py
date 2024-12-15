import frappe
import json


@frappe.whitelist()
def get_calendar_events(type="Purchase Order"):
    events = []
    item_list = frappe.get_list("Item", fields=["name"])
    for item_data in item_list:
        item = frappe.get_doc("Item", item_data.get("name"))
        if item.get("custom_item_details"):
            for data in item.get("custom_item_details"):
                if type == "Sales Order" and data.get("type") == "Sales Order":
                    events.append(
                        {
                            "start": data.get("from"),
                            "end": data.get("to"),
                            "id": data.get("ref_so_docname"),
                            "title": f'{data.get("customer")} \n {item.get("name")}',
                            "color": "black",
                            "allDay": 0,
                            "progress": 50,
                        }
                    )
                elif type == "Purchase Order" and data.get("type") == "Purchase Order":
                    events.append(
                        {
                            "start": data.get("from"),
                            "end": data.get("to"),
                            "id": data.get("ref_po_docname"),
                            "title": f'{data.get("supplier")} \n {item.get("name")}',
                            "color": "black",
                            "allDay": 0,
                            "progress": 50,
                        }
                    )
    return events
