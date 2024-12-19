import frappe
import json


@frappe.whitelist()
def get_calendar_events(filters):
    type=json.loads(filters).get("type")
    villaName=json.loads(filters).get("villa_name")
    events = []
    if villaName == "All":
       item_list = frappe.get_list("Item", fields=["name"])
    else:
       item_list = frappe.get_list("Item", filters={"item_code": villaName, "disabled" : 0}, fields=["name"])
    for item_data in item_list:
        item = frappe.get_doc("Item", item_data.get("name"))
        if item.get("custom_item_details"):
            for data in item.get("custom_item_details"):
                if type == "Villa Sales" and data.get("type") == "Villa Sales":
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
                elif type == "Villa Purchase" and data.get("type") == "Villa Purchase":
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

@frappe.whitelist()
def getItems():
       return frappe.get_list("Item", filters={"disabled" : 0}, fields=["item_code"])