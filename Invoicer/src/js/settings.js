import { dbdata, display, read, fileExists, updateFile } from "./includes/file.js";

const status = await fileExists(dbdata);

async function populateFields(bSetType, bOnlyType = false) {
	if (!status)
		return;

	const parsedData = await read(dbdata);

	if (bSetType)
		document.getElementById("type").value = parsedData[0];
	else if (document.getElementById("type").value != parsedData[0])
		return;

	if (bOnlyType)
		return;

	if (parsedData[0] == "sqlite") {
		document.getElementById("dbname").value = parsedData[1];
	}
	else {
		document.getElementById("hostname").value = parsedData[1];
		document.getElementById("username").value = parsedData[2];
		document.getElementById("password").value = parsedData[3];
		document.getElementById("dbname").value = parsedData[4];
	}
}

let dropdown = document.getElementById("type");
dropdown.addEventListener("change", displayForm, false);

async function displayForm() {
	const form = document.querySelector("form");
	form.innerHTML = "";

	if (dropdown.value == "sqlite") {
		const pdbname = document.createElement("p");
		pdbname.innerHTML = "Database Name";
		form.appendChild(pdbname);
		const idbname = document.createElement("input");
		idbname.id = "dbname";
		form.appendChild(idbname);
	}
	else {
		const phostname = document.createElement("p");
		phostname.innerHTML = "Hostname";
		form.appendChild(phostname);
		const ihostname = document.createElement("input");
		ihostname.id = "hostname";
		form.appendChild(ihostname);

		const pusername = document.createElement("p");
		pusername.innerHTML = "Username";
		form.appendChild(pusername);
		const iusername = document.createElement("input");
		iusername.id = "username";
		form.appendChild(iusername);

		const ppassword = document.createElement("p");
		ppassword.innerHTML = "Password (optional)";
		form.appendChild(ppassword);
		const ipassword = document.createElement("input");
		ipassword.id = "password";
		form.appendChild(ipassword);

		const pdbname = document.createElement("p");
		pdbname.innerHTML = "Database Name";
		form.appendChild(pdbname);
		const idbname = document.createElement("input");
		idbname.id = "dbname";
		form.appendChild(idbname);
	}

	const button = document.createElement("input");
	button.type = "submit";
	button.innerHTML = "Submit";
	form.appendChild(button);

	await populateFields(false);
}

await populateFields(true, true);
displayForm();

addEventListener("submit", (event) => {
	event.preventDefault();

	save();
});

async function save() {
	let type = dropdown.value;
	let dbname = document.getElementById("dbname").value;
	let content = "";
	let bSuccess = true;

	if (type == "sqlite") {
		if (dbname) {
			if (!dbname.toLowerCase().includes(".db"))
				dbname += ".db";

			content = type + "," + dbname;
		}
		else
			bSuccess = false;
	}
	else {
		let host = document.getElementById("hostname").value;
		let username = document.getElementById("username").value;
		let password = document.getElementById("password").value;

		if (host && password && dbname)
			content = type + "," + host + "," + username + "," + password + "," + dbname;
		else
			bSuccess = false;
	}

	if (bSuccess && !await updateFile(dbdata, content))
		bSuccess = false;

	let message = document.getElementById("message");
	if (bSuccess) {
		message.classList.add("success");
		message.innerHTML = "Saved";
	}
	else {
		message.classList.add("failure");
		message.innerHTML = "Failed to save";
	}
}

const company = document.getElementById("company");
const currency = document.getElementById("currency");
company.addEventListener("change", saveDisplay, false);
currency.addEventListener("change", saveDisplay, false);

async function loadDisplay() {
	if (!await fileExists(display))
		await saveDisplay();
	else {
		const parsedData = await read(display);

		company.value = parsedData[0] ? parsedData[0] : "";
		currency.value = parsedData[1];
	}
}
loadDisplay();

async function saveDisplay() {
	let content = company.value + "," + currency.value;

	await updateFile(display, content);
}