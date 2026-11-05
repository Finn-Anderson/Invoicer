import { loadDB, dbTableHeaders } from "./includes/db.js";
import { display, read } from "./includes/file.js";

const table = document.getElementById("table");
const popup = document.getElementById("popupfilter");
let name = "";

window.addEventListener("DOMContentLoaded", () => {
	let page = window.location.search.split("/?(.*)/s").pop();
	page = page.substring(1);

	name = page.charAt(0).toUpperCase() + page.slice(1);

	document.getElementById("tableH1").innerHTML = name;

	displayTable(name, "", "");
});

async function displayTable(name, conditions, having) {
	try {
		const db = await loadDB();

		let order = " ORDER BY invoiceNo DESC";
		if (name == "Advertisers")
			order = " ORDER BY id ASC";

		let result;

		if (name == "Invoices")
			result = await db.select("SELECT Invoices.*, SUM(Payments.amount) AS paid FROM Invoices LEFT JOIN Payments ON Payments.invoiceNo = Invoices.invoiceNo" + conditions + " GROUP BY Invoices.invoiceNo" + having + order);
		else
			result = await db.select("SELECT * FROM " + name + conditions + having + order);

		const parsedData = await read(display);

		for (let i = table.children.length - 1; i > -1; i--) {
			let element = table.children[i];
			if (element.children[0].tagName == "TH")
				continue;

			table.removeChild(element);
		}

		if (name == "Advertisers") {
			document.getElementById("tallyTotal").parentElement.remove();
			document.getElementById("rowTotal").parentElement.remove();
			document.getElementById("popupPrint").lastChild.previousElementSibling.remove();
		}

		if (table.children.length == 0) {
			const thr = document.createElement("tr");
			table.appendChild(thr);

			const headers = await dbTableHeaders(db, name);
			if (name == "Invoices")
				[headers[0], headers[1]] = [headers[1], headers[0]]

			if (name == "Payments") {
				const th = document.createElement("th");
				th.innerHTML = "Advertiser";
				thr.appendChild(th);
			}

			for (const header of headers) {
				let h = header.name;

				if (h == "advertiserID")
					h = "Advertiser";
				else if (h.toLowerCase().includes("amount") || h.toLowerCase().includes("vat"))
					h = h + " (" + parsedData[3] + ")";

				const title = (h.charAt(0).toUpperCase() + h.slice(1)).replace(/([A-Z])/g, ' $1').trim();

				const th = document.createElement("th");
				th.innerHTML = title;
				thr.appendChild(th);

				const p = document.createElement("p");
				p.innerHTML = title;

				const input = document.createElement("input")
				input.name = h;
				input.addEventListener("change", submitFilter, false);
				
				if (h.toLowerCase().includes("date") || h.includes(parsedData[3])) {
					if (h.toLowerCase().includes("date"))
						input.type = "date";
					else
						input.type = "currency";

					const p2 = p.cloneNode(true);
					const input2 = input.cloneNode(true);
					input2.addEventListener("change", submitFilter, false);

					let word1 = "From";
					let word2 = "To";
					if (h.includes(parsedData[3])) {
						word1 = "Min";
						word2 = "Max";
					}
					
					p.innerHTML = word1 + " " + title;
					popup.appendChild(p);
					input.name = word1.toLowerCase() + "_" + h;
					popup.appendChild(input);
					
					p2.innerHTML = word2 + " " + title;
					popup.appendChild(p2);
					input2.name = word2.toLowerCase() + "_" + h;
					popup.appendChild(input2);
				}
				else {
					popup.appendChild(p);
					popup.appendChild(input);
				}

				const columnContainer = document.getElementById("columns");
				const container = document.createElement("div");

				const icheckbox = document.createElement("input");
				icheckbox.type = "checkbox";
				icheckbox.id = header.name;
				icheckbox.name = title;
				const lcheckbox = document.createElement("label");
				lcheckbox.setAttribute("for", header.name);
				lcheckbox.innerHTML = title;

				container.appendChild(icheckbox);
				container.appendChild(lcheckbox);
				columnContainer.appendChild(container);
			}

			if (name == "Invoices") {
				const th = document.createElement("th");
				th.innerHTML = "Paid";
				thr.appendChild(th);

				const ppaid = document.createElement("p");
				ppaid.innerHTML = "Paid Status";
				popup.appendChild(ppaid);

				const paidselect = document.createElement("select");
				paidselect.name = "paid";
				const option1 = document.createElement("option");
				option1.value = "none";
				option1.innerHTML = "None";
				const option2 = document.createElement("option");
				option2.value = "unpaid";
				option2.innerHTML = "Unpaid";
				const option3 = document.createElement("option");
				option3.value = "unpaid + partial";
				option3.innerHTML = "Unpaid & Partial";
				const option4 = document.createElement("option");
				option4.value = "partial";
				option4.innerHTML = "Partial";
				const option5 = document.createElement("option");
				option5.value = "paid";
				option5.innerHTML = "Paid";
				paidselect.appendChild(option1);
				paidselect.appendChild(option2);
				paidselect.appendChild(option3);
				paidselect.appendChild(option4);
				paidselect.appendChild(option5);
				popup.appendChild(paidselect);

				paidselect.addEventListener("change", submitFilter, false);

				const columnContainer = document.getElementById("columns");
				const container = document.createElement("div");

				const icheckbox = document.createElement("input");
				icheckbox.type = "checkbox";
				icheckbox.id = "paid";
				icheckbox.name = "Paid";
				const lcheckbox = document.createElement("label");
				lcheckbox.setAttribute("for", "paid");
				lcheckbox.innerHTML = "Paid";

				container.appendChild(icheckbox);
				container.appendChild(lcheckbox);
				columnContainer.appendChild(container);
			}

			const th = document.createElement("th");
			th.innerHTML = "";
			thr.appendChild(th);
		}

		for await (let element of result) {
			const tr = document.createElement("tr");
			let e = {};
			if (name == "Invoices") {
				for (let key in element) {
					if (key == "advertiserID") {
						let e2 = {};
						e2[key] = element[key];
						Object.assign(e2, e);
						e = e2
					}
					else
						e[key] = element[key];
				}

				element = e;
			}

			for (let key in element) {
				const td = document.createElement("td");
				
				let value = element[key];

				if (key == "advertiserID") {
					const data = await db.select("SELECT name FROM Advertisers WHERE id = " + value);
					value = data[0].name;
				}
				else if (name == "Payments" && key == "invoiceNo") {
					const data = await db.select("SELECT advertiserID FROM Invoices WHERE invoiceNo = " + value);
					const data1 = await db.select("SELECT name FROM Advertisers WHERE id = " + data[0].advertiserID);

					const td1 = document.createElement("td");
					td1.dataset.name = "advertiser";
					td1.innerHTML = data1[0].name;
					tr.appendChild(td1);
				}
				else if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("vat"))
					td.classList.add("tdCurrency");
				else if (key.toLowerCase().includes("date") && value) {
					const date = new Date(value);
					value = date.toLocaleDateString();
				}
				else if (key == "paid") {
					const bPaid = value == element["amount"] + element["vat"];
					const bPartial = value > 0;
					
					td.title = parsedData[3] + (value != null ? value : 0);
					value = bPaid ? "&#10004" : bPartial ? "&#x25d4" : "&#10006";
					td.classList.add(bPaid ? "success" : bPartial ? "inconclusive" : "failure");
				}
				
				td.dataset.name = key;
				td.innerHTML = value;
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
	await db.execute("DELETE FROM " + table + " WHERE " + id);
	window.location.reload();
}

async function submitFilter() {
	try {
		const db = await loadDB();
		const inputs = popup.querySelectorAll("input");
		let where = " WHERE";
		let whereCount = 0;
		let having = " HAVING";
		let havingCount = 0;

		for await (const element of inputs) {
			if (element.value.length == 0)
				continue;

			if (whereCount > 0)
				where += " AND"

			let value = element.value;
			let field = element.name;

			if (element.name == "advertiserID") {
				const data = await db.select("SELECT id FROM Advertisers WHERE name LIKE '%" + value + "%'");

				let list = "(";
				for await (const result of data)
					list += result.id + ",";
				list = list.substring(0, list.length - 1) + ")";

				where += " advertiserID IN " + list;
			}
			else if (element.name.includes("_")) {
				const type = field.split("_")[0];
				field = field.split("_")[1];

				if (element.name.toLowerCase().includes("date"))
					value = "'" + value + "'";

				where += " " + field + (type == "from" || type == "min" ? " >= " : " <= ") + value;
			}
			else {
				where += " " + field + " LIKE '%" + value + "%'";
			}

			whereCount++;
		};

		const selects = popup.querySelectorAll("select");
		for (const select of selects) {
			if (havingCount > 0)
				having += " AND"

			let value = select.value;
			let field = select.name;

			console.log(select.name);

			if (field.includes("paid")) {
				if (value == "unpaid")
					having += " " + field + " IS NULL";
				else if (value == "unpaid + partial") {
					having += " " + field + " IS NULL OR (" + field + " > 0 AND " + field + " < SUM(Invoices.amount + Invoices.vat))";
				}
				else if (value == "partial")
					having += " " + field + " > 0 AND " + field + " < SUM(Invoices.amount + Invoices.vat)";
				else if (value == "paid")
					having += " " + field + " = SUM(Invoices.amount + Invoices.vat)";
				else
					continue;
			}
			else {
				having += " " + field + " = " + value;
			}

			havingCount++;
		}

		if (where == " WHERE")
			where = "";

		if (having == " HAVING")
			having = "";

		displayTable(name, where, having);
	} catch(error) {
		console.log(error);
	}
}

document.querySelectorAll(".tableNavBtn").forEach(element => {
	element.onclick = () => {
		const popupElement = element.parentElement.querySelector(".tableNavPopup");
		const popups = document.querySelectorAll(".tableNavPopup");

		for (const popup of popups) {
			if (popup == popupElement)
				continue;

			const btn = popup.parentElement.querySelector(".tableNavBtn");

			if (btn.classList.contains("active")) {
				btn.classList.remove("active");
				popup.classList.remove("show");
				popup.classList.add("hide");
			}
		}

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