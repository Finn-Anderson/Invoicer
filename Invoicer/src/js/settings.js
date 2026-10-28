const { exists, readFile, create, open, BaseDirectory } = window.__TAURI__.fs;

let filename = "dbdata";
let status = await exists(filename, { baseDir: BaseDirectory.AppLocalData });

async function populateFields(bSetType, bOnlyType = false) {
	if (!status)
		return;

	const data = await readFile(filename, { baseDir: BaseDirectory.AppLocalData });

	let decodedData = new TextDecoder().decode(data);
	let parsedData = decodedData.split(",");

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

	if (bSuccess) {
		let file = null;

		try {
			if (!status)
				file = await create(filename, { baseDir: BaseDirectory.AppLocalData });
			else
				file = await open(filename, { write: true, truncate: true, baseDir: BaseDirectory.AppLocalData });

			if (file) {
				await file.write(new TextEncoder().encode(content));
				await file.close();
			}
			else
				bSuccess = false;
		} catch(error) {
			console.log(error);
			bSuccess = false;
		}
	}

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

let displayFilename = "display";
let start = document.getElementById("start");
let end = document.getElementById("end");
start.addEventListener("change", saveDates, false);
end.addEventListener("change", saveDates, false);

async function loadDates() {
	if (!await exists(displayFilename, { baseDir: BaseDirectory.AppLocalData })) {
		await create(displayFilename, { baseDir: BaseDirectory.AppLocalData });
		await saveDates();
	}
	else {
		const data = await readFile(displayFilename, { baseDir: BaseDirectory.AppLocalData });

		let decodedData = new TextDecoder().decode(data);
		let parsedData = decodedData.split(",");

		start.value = parsedData[0];
		end.value = parsedData[1];

		console.log(decodedData);
	}
}
loadDates();

async function saveDates() {
	let content = start.value + "," + end.value;

	let file = await open(displayFilename, { write: true, truncate: true, baseDir: BaseDirectory.AppLocalData });
	await file.write(new TextEncoder().encode(content));
	await file.close();
}