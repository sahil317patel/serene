import frappe
from datetime import datetime
from erpnext.selling.doctype.sales_order.sales_order import SalesOrder


class customSalesOrder(SalesOrder):
    def on_submit(self):
        existing_items = self.fetch_items()
        new_items = [
            {
                "item_code": item_data.get("item_code"),
                "name": self.name,
                "customer": self.customer,
                "from": datetime.strptime(
                    item_data.get("custom_to"), "%Y-%m-%d"
                ).date(),
                "to": datetime.strptime(item_data.get("delivery_date"), "%Y-%m-%d").date(),
            }
            for item_data in self.items
        ]
        for new_item in new_items:
            for existing_item in existing_items:
                if (
                    new_item["item_code"] == existing_item["item_code"]
                    and new_item["customer"] == existing_item["customer"]
                ):
                    if new_item["from"] <= existing_item["to"]:
                        frappe.throw(
                            f"There is already an order from this date for the item <b>{new_item['item_code']}</b> . Please select a new date"
                        )
        self.insert_new_item(new_items)
        super().on_submit()

    def on_cancel(self):
        existing_items = self.fetch_items()
        for item in self.items:
            item_record = frappe.get_doc("Item", item.get("item_code"))
            item_record.custom_item_details = list(
                filter(
                    lambda detail: detail.get("ref_so_docname") != self.name,
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
                    if item_history.get("type") == "Villa Sales":
                        final_data.append(
                            {
                                "item_code": item_record.get("name"),
                                "name": item_history.get("ref_so_docname"),
                                "customer": item_history.get("customer"),
                                "from": item_history.get("from"),
                                "to": item_history.get("to"),
                            }
                        )
        return final_data

    def insert_new_item(self, new_items):
        for new_item in new_items:
            item_record = frappe.get_doc("Item", new_item.get("item_code"))
            item_record.append(
                "custom_item_details",
                {
                    "type": "Villa Sales",
                    "customer": new_item.get("customer"),
                    "ref_so_docname": new_item.get("name"),
                    "from": new_item.get("from"),
                    "to": new_item.get("to"),
                },
            )
            item_record.save()
        frappe.db.commit()
