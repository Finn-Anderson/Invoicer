import { loadDB, setupValuesList } from "./includes/db.js";
import { display, read } from "./includes/file.js";

let page = window.location.search.split("/?(.*)/s").pop();
page = page.substring(1, page.length - 1);

const button = document.getElementById("addBtn");
button.addEventListener("click", displayMenu, false);

let popupmenu = document.getElementById("popupmenu");
let popupdata = document.getElementById("popupdata");
popupdata.addEventListener("submit", submitPopupData, false);

async function displayMenu() {
	const parsedData = await read(display);

	popupmenu.style.animation = "popup 0.2s forwards";

	popupdata.innerHTML = "";

	const closebtn = document.createElement("button");
	closebtn.type = "button";
	closebtn.classList.add("close");
	closebtn.innerHTML = "X";
	closebtn.onclick = hidePopupMenu;
	popupdata.appendChild(closebtn);

	const header = document.createElement("h2");
	header.innerHTML = page.charAt(0).toUpperCase() + page.slice(1);
	header.name = page;
	popupdata.appendChild(header);

	const message = document.createElement("p");
	message.id = "message";
	popupdata.appendChild(message);

	const div = document.createElement("div");

	if (page != "payment") {
		const padvertiser = document.createElement("p");
		padvertiser.innerHTML = "Advertiser";
		popupdata.appendChild(padvertiser);
		const iadvertiser = document.createElement("input");
		iadvertiser.name = "advertiser";
		iadvertiser.required = true;
		div.appendChild(iadvertiser);

		if (page == "invoice") {
			iadvertiser.addEventListener("keyup", search, false);
			iadvertiser.addEventListener("focusin", search, false);
			iadvertiser.addEventListener("focusout", hideSearch, false);

			const dropdown = document.createElement("div");
			dropdown.classList.add("dropdown");
			div.appendChild(dropdown);
		}

		popupdata.appendChild(div);
	}

	if (page == "invoice") {
		const pinvoiceno = document.createElement("p");
		pinvoiceno.innerHTML = "Invoice Number";
		popupdata.appendChild(pinvoiceno);
		const iinvoiceno = document.createElement("input");
		iinvoiceno.required = true;
		popupdata.appendChild(iinvoiceno);

		const pamount = document.createElement("p");
		pamount.innerHTML = "Amount (" + parsedData[3] + ")";
		popupdata.appendChild(pamount);
		const iamount = document.createElement("input");
		iamount.value = "0.00";
		iamount.type = "currency";
		iamount.step = "0.01";
		iamount.required = true;
		iamount.addEventListener("change", alterDecimals, false);
		popupdata.appendChild(iamount);

		const pvat = document.createElement("p");
		pvat.innerHTML = "VAT (" + parsedData[3] + ")";
		popupdata.appendChild(pvat);
		const ivat = document.createElement("input");
		ivat.value = "0.00";
		ivat.type = "currency";
		ivat.step = "0.01";
		ivat.required = true;
		ivat.addEventListener("change", alterDecimals, false);
		popupdata.appendChild(ivat);

		const pdate = document.createElement("p");
		pdate.innerHTML = "Invoice Date";
		popupdata.appendChild(pdate);
		const idate = document.createElement("input");
		idate.type = "date";
		idate.required = true;
		popupdata.appendChild(idate);

		const pduedate = document.createElement("p");
		pduedate.innerHTML = "Due Date";
		popupdata.appendChild(pduedate);
		const iduedate = document.createElement("input");
		iduedate.type = "date";
		iduedate.required = true;
		popupdata.appendChild(iduedate);
	}
	else if (page == "payment") {
		const pinvoiceno = document.createElement("p");
		pinvoiceno.innerHTML = "Invoice Number";
		popupdata.appendChild(pinvoiceno);
		const iinvoiceno = document.createElement("input");
		iinvoiceno.name = "invoiceNo";
		iinvoiceno.required = true;
		iinvoiceno.addEventListener("keyup", search, false);
		iinvoiceno.addEventListener("focusin", search, false);
		iinvoiceno.addEventListener("focusout", hideSearch, false);
		div.appendChild(iinvoiceno);

		const dropdown = document.createElement("div");
		dropdown.classList.add("dropdown");
		div.appendChild(dropdown);
		
		popupdata.appendChild(div);

		const ppaid = document.createElement("p");
		ppaid.innerHTML = "Paid (" + parsedData[3] + ")";
		popupdata.appendChild(ppaid);
		const ipaid = document.createElement("input");
		ipaid.value = "0.00";
		ipaid.type = "currency";
		ipaid.step = "0.01";
		ipaid.required = true;
		ipaid.addEventListener("change", alterDecimals, false);
		popupdata.appendChild(ipaid);

		const pdate = document.createElement("p");
		pdate.innerHTML = "Payment Date";
		popupdata.appendChild(pdate);
		const idate = document.createElement("input");
		idate.type = "date";
		idate.required = true;
		popupdata.appendChild(idate);
	}

	const button = document.createElement("input");
	button.type = "submit";
	button.innerHTML = "Submit";
	popupdata.appendChild(button);
}

function alterDecimals(event) {
	const value = Number(event.target.value).toFixed(2);
	event.target.value = value;
}

const MessageStatus = {
	Success: 0,
	Exists: 1,
	Advertiser: 2,
	Invoice: 3,
	Failed: 4
}

async function submitPopupData(event) {
	event.preventDefault();

	const inputs = popupdata.querySelectorAll("input");
	let message = document.getElementById("message");
	let success = MessageStatus.Success;

	if (bValidSearch) {
		inputs.forEach(element => {
			if (element.required && !element.value)
				success = MessageStatus.Failed;
		});
	}
	else
		success = MessageStatus.Empty;

	if (success == MessageStatus.Success) {
		const db = await loadDB();

		if (db) {
			if (event.target.children[1].name == "advertiser") {
				try {
					let list = setupValuesList(1);

					//await db.execute("DROP TABLE IF EXISTS Advertisers");
					await db.execute("CREATE TABLE IF NOT EXISTS Advertisers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, UNIQUE(name))");
					await db.execute("INSERT INTO Advertisers (name) VALUES " + list,
						[inputs[0].value]
					);
				} catch(error) {
					if (error.includes("UNIQUE"))
						success = MessageStatus.Exists;
					else
						success = MessageStatus.Failed;
				}
			}
			else if (event.target.children[1].name == "invoice") {
				try {
					const result = await db.select("SELECT id FROM Advertisers WHERE name = " + inputs[0].value);
					if (result.length == 0) throw "empty";

					//await db.execute("DROP TABLE IF EXISTS Invoices");
					//await db.execute("DROP TABLE IF EXISTS Payments");
					await db.execute("CREATE TABLE IF NOT EXISTS Invoices (invoiceNo INTEGER PRIMARY KEY, advertiserID INTEGER NOT NULL, amount DECIMAL NOT NULL, vat DECIMAL NOT NULL, date DATE NOT NULL, dueDate DATE NOT NULL, FOREIGN KEY (advertiserID) REFERENCES Advertisers(id))");
					await db.execute("CREATE TABLE IF NOT EXISTS Payments (invoiceNo INTEGER, amount INTEGER NOT NULL, date DATE NOT NULL, PRIMARY KEY (invoiceNo, date), FOREIGN KEY (invoiceNo) REFERENCES Invoices(invoiceNo))");

					let list = setupValuesList(6);

					await db.execute("INSERT INTO Invoices (invoiceNo, advertiserID, amount, vat, date, dueDate) VALUES " + list,
						[inputs[1].value, result[0].id, inputs[2].value, inputs[3].value, inputs[4].value, inputs[5].value]
					);
				} catch(error) {
					console.log(error);
					if (error.includes("UNIQUE"))
						success = MessageStatus.Exists;
					else if (error == "empty")
						success = MessageStatus.Advertiser;
					else
						success = MessageStatus.Failed;
				}
			}
			else {
				try {
					const result = await db.select("SELECT invoiceNo, amount, vat FROM Invoices WHERE invoiceNo = " + inputs[0].value);
					if (result.length == 0) throw "empty";

					let list = setupValuesList(3);

					await db.execute("INSERT INTO Payments (invoiceNo, amount, date) VALUES " + list,
						[inputs[0].value, inputs[1].value, inputs[2].value]
					);
				} catch(error) {
					console.log(error);
					if (error.includes("UNIQUE"))
						success = MessageStatus.Exists;
					else if (error == "empty")
						success = MessageStatus.Advertiser;
					else
						success = MessageStatus.Failed;
				}
			}
		}
		else {
			success = MessageStatus.Failed;
		}
	}

	if (success == MessageStatus.Success) {
		message.classList.add("success");
		message.innerHTML = "Saved";

		window.location.reload();
	}
	else {
		message.classList.add("failure");
		if (success == MessageStatus.Exists)
			message.innerHTML = "Entry already exists";
		else if (success == MessageStatus.Advertiser)
			message.innerHTML = "Advertiser does not exist";
		else if (success == MessageStatus.Invoice)
			message.innerHTML = "Invoice does not exist";
		else
			message.innerHTML = "Failed to save";
	}
}

function hidePopupMenu() {
	popupmenu.style.animation = "hide 0.2s forwards";
}

let bValidSearch = false;
async function search(event) {
	const dropdown = document.querySelector(".dropdown");

	console.log(event.target.value);

	try {
		if (event.target.value.length == 0)
			throw "bad";

		const db = await loadDB();
		let result = null;

		if (event.target.name == "advertiser")
			result = await db.select("SELECT name FROM Advertisers WHERE name LIKE '%" + event.target.value + "%' LIMIT 5");
		else
			result = await db.select("SELECT invoiceNo FROM Invoices WHERE invoiceNo LIKE '%" + event.target.value + "%' LIMIT 5");

		bValidSearch = result.length > 0;

		if (!bValidSearch)
			throw "bad";

		dropdown.innerHTML = "";

		for (const element of result) {
			for (const key in element) {
				if (element[key] != event.target.value)
					continue;

				return;
			}
		}

		result.forEach(element => {
			for (const key in element) {
				const value = element[key];

				const button = document.createElement("button");
				button.innerHTML = value;
				button.value = value;
				button.onclick = () => { setInputToSearchValue(dropdown, event.target, value) };
				dropdown.appendChild(button);
			}
		});

		if (!dropdown.classList.contains("show")) {
			dropdown.classList.remove("hide");
			dropdown.classList.add("show");
		}
	} catch (error) {

		bValidSearch = false;
	}
}

function hideSearch() {
	const dropdown = document.querySelector(".dropdown");

	if (!dropdown.classList.contains("hide")) {
		dropdown.classList.remove("show");
		dropdown.classList.add("hide");
	}

	setTimeout(() => {dropdown.innerHTML = ""}, 200);
}

function setInputToSearchValue(dropdown, input, value) {
	input.value = value;

	if (!dropdown.classList.contains("hide")) {
		dropdown.classList.remove("show");
		dropdown.classList.add("hide");
	}
}