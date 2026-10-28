import { loadDB, typeDB } from "./db.js";

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
	const result = await db.select("SELECT * FROM " + name);

	const thr = document.createElement("tr");
	table.appendChild(thr);

	result.forEach(async element => {
		const tr = document.createElement("tr");

		for (let key in element) {
			let value = element[key];

			if (key == "id")
				continue;
			else if (key == "advertiserID") {
				let select = "$1";
				if (typeDB() == "mysql")
					select = "?";

				const data = await db.select("SELECT * FROM Advertisers WHERE id = " + select, [value]);
				key = "Advertiser";
				value = data[0].name;
			}

			if (result[0] == element) {
				const th = document.createElement("th");
				th.innerHTML = key.charAt(0).toUpperCase() + key.slice(1);
				thr.appendChild(th);
			}
			
			const td = document.createElement("td");
			td.innerHTML = value;
			tr.appendChild(td);
		}

		table.appendChild(tr);
	});
}