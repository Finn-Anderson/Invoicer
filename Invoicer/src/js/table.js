import { loadDB, typeDB } from "./includes/db.js";
import { display, read } from "./includes/file.js";

const table = document.getElementById("table");
const popup = document.getElementById("popupfilter");
let name = "";

window.addEventListener("DOMContentLoaded", () => {
	let page = window.location.search.split("/?(.*)/s").pop();
	page = page.substring(1);

	name = page.charAt(0).toUpperCase() + page.slice(1);

	document.getElementById("tableH1").innerHTML = name;

	displayTable(name, "");
});

async function displayTable(name, conditions) {
	try {
		const db = await loadDB();

		let order = " ORDER BY invoiceNo DESC";
		if (name == "Advertisers")
			order = " ORDER BY id ASC";

		const result = await db.select("SELECT * FROM " + name + conditions + order);

		for (let i = table.children.length - 1; i > -1; i--) {
			let element = table.children[i];
			if (element.children[0].tagName == "TH")
				continue;

			table.removeChild(element);
		}

		let bGenerateHeaders = true;
		if (table.children.length > 0)
			bGenerateHeaders = false;

		const thr = document.createElement("tr");
		if (bGenerateHeaders)
			table.appendChild(thr);

		const parsedData = await read(display);

		for await (const element of result) {
			const tr = document.createElement("tr");

			for (let key in element) {
				const td = document.createElement("td");
				
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
				else if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("vat")) {
					header = header + " (" + parsedData[3] + ")";
					td.classList.add("tdCurrency");
				}
				else if (key.toLowerCase().includes("date") && value) {
					const date = new Date(value);
					value = date.toLocaleDateString();
				}

				if (bGenerateHeaders && result[0] == element) {
					const title = (header.charAt(0).toUpperCase() + header.slice(1)).replace(/([A-Z])/g, ' $1').trim();

					const th = document.createElement("th");
					th.innerHTML = title;
					thr.appendChild(th);

					const p = document.createElement("p");
					p.innerHTML = title;

					const input = document.createElement("input")
					input.name = key;
					input.addEventListener("change", submitFilter, false);
					
					if (header.toLowerCase().includes("date") || header.toLowerCase().includes(parsedData[3])) {
						if (header.toLowerCase().includes("date"))
							input.type = "date";
						else
							input.type = "currency";

						const p2 = p.cloneNode(true);
						const input2 = input.cloneNode(true);
						input2.addEventListener("change", submitFilter, false);

						let word1 = "From";
						let word2 = "To";
						if (header.toLowerCase().includes(parsedData[3])) {
							word1 = "Min";
							word2 = "Max";
						}
						
						p.innerHTML = word1 + " " + title;
						popup.appendChild(p);
						input.name = word1.toLowerCase() + "_" + key;
						popup.appendChild(input);
						
						p2.innerHTML = word2 + " " + title;
						popup.appendChild(p2);
						input2.name = word2.toLowerCase() + "_" + key;
						popup.appendChild(input2);
					}
					else {
						popup.appendChild(p);
						popup.appendChild(input);
					}
				}
				
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

			if (result[0] == element) {
				const th = document.createElement("th");
				th.innerHTML = "";
				thr.appendChild(th);
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
		console.log(error);
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

async function submitFilter() {
	try {
		const db = await loadDB();
		const inputs = popup.querySelectorAll("input");
		let where = " WHERE";
		let count = 0;

		for await (const element of inputs) {
			if (element.value.length == 0)
				continue;

			if (count > 0)
				where += " AND"

			let value = element.value;
			let field = element.name;

			if (element.name == "advertiserID") {
				let select = "$1";
				if (typeDB() == "mysql")
					select = "?";
				
				const data = await db.select("SELECT id FROM Advertisers WHERE name LIKE " + select, ["%" + value + "%"]);

				let list = "(";
				for await (const result of data)
					list += result.id + ",";
				list = list.substring(0, list.length - 1) + ")";

				where += " advertiserID IN " + list;
				count++;
			}
			else if (element.name.includes("_")) {
				const type = field.split("_")[0];
				field = field.split("_")[1];

				if (element.name.toLowerCase().includes("date"))
					value = "'" + value + "'";

				where += " " + field + (type == "from" || type == "min" ? " >= " : " <= ") + value;
				count++;
			}
			else {
				where += " " + field + " LIKE '%" + value + "%'";
				count++;
			}
		};

		if (where == " WHERE")
			where = "";

		displayTable(name, where);
	} catch(error) {
		console.log(error);
	}
}

document.querySelectorAll(".tableNavBtn").forEach(element => {
	element.onclick = () => {
		const popupElement = element.parentElement.querySelector(".tableNavPopup");

		if (element.classList.contains("active")) {
			element.classList.remove("active");

			popupElement.classList.remove("show");
			popupElement.classList.add("hide");
		}
		else {
			element.classList.add("active");

			popupElement.classList.remove("hide");
			popupElement.classList.add("show");
		}
	}
});

document.querySelectorAll(".tableNavPopup").forEach(element => {
	element.querySelector(".close").onclick = () => {
		element.parentElement.querySelector(".tableNavBtn").classList.remove("active");

		element.classList.remove("show");
		element.classList.add("hide");
	};
});