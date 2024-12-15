import frappe
from datetime import datetime
from erpnext.buying.doctype.purchase_order.purchase_order import PurchaseOrder


class customPurchaseOrder(PurchaseOrder):
    def on_submit(self):
        existing_items = self.fetch_items()
        new_items = [
            {
                "item_code": item_data.get("item_code"),
                "name": self.name,
                "supplier": self.supplier,
                "from": datetime.strptime(item_data.get("custom_from"), "%Y-%m-%d").date(),
                "to": datetime.strptime(item_data.get("custom_to"), "%Y-%m-%d").date(),
            }
            for item_data in self.items
        ]
        for new_item in new_items:
            for existing_item in existing_items:
                if (
                    new_item["item_code"] == existing_item["item_code"]
                    and new_item["supplier"] == existing_item["supplier"]
                ):
                    if new_item["from"] <= existing_item["to"]:
                        frappe.throw(
                            (
                                f"The item '{new_item['item_code']}' has already been purchased, "
                                f"and the contract expires on {existing_item['to']}. "
                                f"Please choose a 'from' date later than {existing_item['to']}."
                            )
                        )
        self.insert_new_item(new_items)
        super().on_submit()
        
    def on_cancel(self):
       existing_items = self.fetch_items()
       for item in self.items:
              item_record = frappe.get_doc("Item", item.get("item_code"))
              item_record.custom_item_details = list(
              filter(
                     lambda detail: detail.get("ref_po_docname") != self.name,
                     item_record.custom_item_details,
              )
              )
              item_record.save()
       frappe.db.commit()
       super().on_cancel()

    def fetch_items(self):
        final_data = []
        item_data = frappe.get_list("Item", fields=["name"])
        for item in item_data:
            item_record = frappe.get_doc("Item", item.get("name"))
            if item_record.get("custom_item_details"):
                for item_history in item_record.get("custom_item_details"):
                    if item_history.get("type") == "Purchase Order":
                        final_data.append(
                            {
                                "item_code": item_record.get("name"),
                                "supplier": item_history.get("supplier"),
                                "from": item_history.get("from"),
                                "to": item_history.get("to"),
                            }
                        )
        return final_data

    def insert_new_item(self, new_items):
        for new_item in new_items:
            item_record = frappe.get_doc("Item", new_item.get("item_code"))
            item_record.append("custom_item_details", {
                "type": "Purchase Order",
                "supplier": new_item.get("supplier"),
                "ref_po_docname": new_item.get("name"),
                "from": new_item.get("from"),
                "to": new_item.get("to"),
            })
            item_record.save() 
        frappe.db.commit()  
