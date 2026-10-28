import { loadDB, typeDB } from "./db.js";

document.querySelectorAll(".addBtn").forEach(element => {
	element.addEventListener("click", displayMenu, false);
});

let popupmenu = document.getElementById("popupmenu");
let popupdata = document.getElementById("popupdata");
popupmenu.addEventListener("click", hidePopupMenu, false);
popupdata.addEventListener("submit", submitPopupData, false);

async function displayMenu(event) {
	popupmenu.style.animation = "popup 0.2s forwards";

	popupdata.innerHTML = "";

	const closebtn = document.createElement("button");
	closebtn.type = "button";
	closebtn.classList.add("close");
	closebtn.innerHTML = "X";
	closebtn.onclick = () => { hidePopupMenu(null, true) };
	popupdata.appendChild(closebtn);

	const header = document.createElement("h2");
	header.innerHTML = event.target.innerHTML;
	header.name = event.target.name;
	popupdata.appendChild(header);

	const message = document.createElement("p");
	message.id = "message";
	popupdata.appendChild(message);

	const padvertiser = document.createElement("p");
	padvertiser.innerHTML = "Advertiser";
	popupdata.appendChild(padvertiser);
	const iadvertiser = document.createElement("input");
	iadvertiser.required = true;
	popupdata.appendChild(iadvertiser);

	if (event.target.name == "invoice") {
		const pinvoiceno = document.createElement("p");
		pinvoiceno.innerHTML = "Invoice Number";
		popupdata.appendChild(pinvoiceno);
		const iinvoiceno = document.createElement("input");
		iinvoiceno.required = true;
		popupdata.appendChild(iinvoiceno);

		const pamount = document.createElement("p");
		pamount.innerHTML = "Amount";
		popupdata.appendChild(pamount);
		const iamount = document.createElement("input");
		iamount.type = "currency";
		iamount.required = true;
		popupdata.appendChild(iamount);

		const pvat = document.createElement("p");
		pvat.innerHTML = "VAT";
		popupdata.appendChild(pvat);
		const ivat = document.createElement("input");
		ivat.type = "currency";
		ivat.required = true;
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

		iadvertiser.addEventListener("change", search, false);
	}

	const button = document.createElement("input");
	button.type = "submit";
	button.innerHTML = "Submit";
	popupdata.appendChild(button);
}

const MessageStatus = {
	Success: 0,
	Exists: 1,
	Empty: 2,
	Failed: 3
}

async function submitPopupData(event) {
	event.preventDefault();

	const inputs = popupdata.querySelectorAll("input");
	let message = document.getElementById("message");
	let success = MessageStatus.Success;

	inputs.forEach(element => {
		if (element.required && !element.value)
			success = MessageStatus.Failed;
	});

	if (success == MessageStatus.Success) {
		const db = await loadDB();

		if (db) {
			if (event.target.children[1].name == "advertiser") {
				try {
					let list = "($1)";
					if (typeDB() == "mysql")
						list = "(?)";

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
			else {
				try {
					let list = "($1, $2, $3, $4, $5, $6)";
					let select = "$1"

					if (typeDB() == "mysql") {
						list = "(?, ?, ?, ?, ?, ?)";
						select = "?";
					}

					//await db.execute("DROP TABLE IF EXISTS Invoices");
					await db.execute("CREATE TABLE IF NOT EXISTS Invoices (invoiceNo INTEGER PRIMARY KEY, advertiserID INTEGER NOT NULL, amount DECIMAL NOT NULL, vat DECIMAL NOT NULL, date DATE NOT NULL, dueDate DATE NOT NULL,FOREIGN KEY (advertiserID) REFERENCES Advertisers(id))");

					const result = await db.select("SELECT id FROM Advertisers WHERE name = " + select, [inputs[0].value]);
					if (result.length == 0) throw "empty";

					console.log(result[0].id);
					await db.execute("INSERT INTO Invoices (invoiceNo, advertiserID, amount, vat, date, dueDate) VALUES " + list,
						[inputs[1].value, result[0].id, inputs[2].value, inputs[3].value, inputs[4].value, inputs[5].value]
					);
				} catch(error) {
					console.log(error);
					if (error.includes("UNIQUE"))
						success = MessageStatus.Exists;
					else if (error == "empty")
						success = MessageStatus.Empty;
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
	}
	else {
		message.classList.add("failure");
		if (success == MessageStatus.Exists)
			message.innerHTML = "Entry already exists";
		else if (success == MessageStatus.Empty)
			message.innerHTML = "Advertiser does not exist";
		else
			message.innerHTML = "Failed to save";
	}
}

function hidePopupMenu(event, bForce = false) {
	if (!bForce && event.target != popupmenu)
		return;

	popupmenu.style.animation = "hide 0.2s forwards";
}

async function search(event) {
	// Use as search if creating invoice
}