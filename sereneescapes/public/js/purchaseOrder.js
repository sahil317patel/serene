frappe.ui.form.on("Purchase Order Item", {
  custom_from: function (frm, cdt, cdn) {
    let child = frappe.get_doc(cdt, cdn); 
    if (child.custom_from) {
      let from_date = new Date(child.custom_from);
      frm.fields_dict["items"].grid.grid_rows_by_docname[cdn].on_grid_fields_dict.schedule_date.datepicker.update({
        minDate: from_date,
      });
    }
  },
});
