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

	const message = document.createElement("p");
	message.id = "message";
	form.appendChild(message);

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

	const button = document.createElement("button");
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
	let type = document.getElementById("type").value;
	let dbname = document.getElementById("dbname").value;
	let content = "";
	let bSuccess = true;

	if (type == "sqlite") {
		if (dbname) {
			content = type + "," + dbname;

			if (!dbname.toLowerCase().includes(".db"))
				dbname += ".db";

			let status2 = await exists(dbname, { baseDir: BaseDirectory.AppLocalData });
			if (!status2)
				await create(dbname, { baseDir: BaseDirectory.AppLocalData });
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