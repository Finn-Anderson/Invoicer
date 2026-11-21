const Database = window.__TAURI__.sql;
import { read, fileExists } from "./file.js";

let type = "mysql";
let name = "";

export async function loadDB() {
	let db = null;

	let filename = "dbdata";
	if (!await fileExists(filename, false, "../settings.html"))
		return db;

	const parsedData = await read(filename);

	type = parsedData[0];
	name = parsedData[1];

	try {
		if (type == "sqlite") {
			db = await Database.load(type + ":" + parsedData[1]);
			name = parsedData[1];
		}
		else {
			db = await Database.load(type + "://" + parsedData[2] + ":" + parsedData[3] + "@" + parsedData[1] + "/" + parsedData[4]);
			name = parsedData[4];
		}

		return db;
	} catch(error) {
		return error;
	}
}

export function typeDB() {
	return type
}

export async function dbTableHeaders(db, tableName) {
	let command = "";
	if (type == "sqlite")
		command = "PRAGMA table_info(" + tableName + ");";
	else
		command = "SELECT column_name as 'name' FROM information_schema.columns WHERE table_name = '" + tableName + "' AND table_schema = '" + name + "' ORDER BY ordinal_position";

	return await db.select(command);
}

export function setupValuesList(amount, bList = false) {
	let select = "(";
	let list = [];

	for (let i = 1; i <= amount; i++) {
		let value = `$${i}`;
		if (type == "mysql")
			value = "?";

		if (bList)
			list.push(value);
		else
			select += value + ", ";
	}

	if (bList)
		return list;

	select = select.slice(0, -2);
	select += ")";

	return select;
}