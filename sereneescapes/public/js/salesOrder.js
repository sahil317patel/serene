frappe.ui.form.on("Sales Order Item", {
  custom_to: function (frm, cdt, cdn) {
    let child = frappe.get_doc(cdt, cdn);
    if (child.custom_to) {
      let from_date = new Date(child.custom_to);
      frm.fields_dict["items"].grid.grid_rows_by_docname[
        cdn
      ].on_grid_fields_dict.delivery_date.datepicker.update({
        minDate: from_date,
      });
    }
  },
});
