import { loadDB, typeDB } from "./includes/db.js";
import { display, read } from "./includes/file.js";

const table = document.getElementById("table");

window.addEventListener("DOMContentLoaded", () => {
	let page = window.location.search.split("/?(.*)/s").pop();
	page = page.substring(1);

	let name = page.charAt(0).toUpperCase() + page.slice(1);

	document.getElementById("tableH1").innerHTML = name;

	displayTable(name);
});

async function displayTable(name) {
	const db = await loadDB();
	try {
		let order = " ORDER BY invoiceNo DESC";
		if (name == "Advertisers")
			order = " ORDER BY id ASC";

		const result = await db.select("SELECT * FROM " + name + order);

		const thr = document.createElement("tr");
		table.appendChild(thr);

		const parsedData = await read(display);

		for await (const element of result) {
			const tr = document.createElement("tr");

			for (let key in element) {
				let value = element[key];
				let header = key;

				if (key == "advertiserID") {
					let select = "$1";
					if (typeDB() == "mysql")
						select = "?";

					const data = await db.select("SELECT * FROM Advertisers WHERE id = " + select, [value]);
					header = "Advertiser";
					value = data[0].name;
				}
				else if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("vat"))
					header = header + " (" + parsedData[3] + ")";
				else if (key.toLowerCase().includes("date") && value) {
					const date = new Date(value);
					value = date.toLocaleDateString();
				}

				if (result[0] == element) {
					const th = document.createElement("th");
					th.innerHTML = header.charAt(0).toUpperCase() + header.slice(1);
					thr.appendChild(th);
				}
				
				const td = document.createElement("td");
				td.dataset.name = key;
				td.innerHTML = value;
				tr.appendChild(td);
			}

			if (name == "Invoices") {
				if (result[0] == element) {
					const th = document.createElement("th");
					th.innerHTML = "Paid";
					thr.appendChild(th);
				}

				let select = "$1";
				if (typeDB() == "mysql")
					select = "?";

				const data = await db.select("SELECT amount FROM Payments WHERE invoiceNo = " + select, [element["invoiceNo"]]);

				let value = 0;
				for (let paid of data)
					value += paid.amount;

				const bPaid = value == element["amount"] + element["vat"];
				const bPartial = value > 0;

				const td = document.createElement("td");
				td.title = parsedData[3] + value;
				td.innerHTML = bPaid ? "&#10004" : bPartial ? "&#x25d4" : "&#10006";
				td.classList.add(bPaid ? "success" : bPartial ? "inconclusive" : "failure");
				tr.appendChild(td);
			}

			const td = document.createElement("td");
			const delBtn = document.createElement("button");
			delBtn.innerHTML = "x";
			delBtn.id = "delBtn";
			delBtn.onclick = async () => { await deleteRow(name, tr); };
			td.appendChild(delBtn);
			tr.appendChild(td);

			table.appendChild(tr);
		};
	} catch(error) {

	}
}

async function deleteRow(table, row) {
	if (!confirm("Are you sure you want to delete this row?"))
		return;

	let id = "";
	if (table == "Advertisers")
		id = "id = " + row.children[0].innerHTML;
	else if (table == "Invoices")
		id = "invoiceNo = " + row.children[0].innerHTML;
	else if (table == "Payments") {
		const values = row.children[2].innerHTML.split("/");
		const date = values[2] + "-" + values[1] + "-" + values[0];
		id = "invoiceNo = " + row.children[0].innerHTML + " AND date = '" + date + "'";
	}

	if (id == "")
		return;
	
	const db = await loadDB();
	const result = await db.execute("DELETE FROM " + table + " WHERE " + id);
	window.location.reload();
}