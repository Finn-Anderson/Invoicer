const Database = window.__TAURI__.sql;
import { read, fileExists } from "./file.js";

let type = "mysql";

export async function loadDB() {
	let filename = "dbdata";
	if (!await fileExists(filename, false, "../settings.html"))
		return;

	const parsedData = await read(filename);
	let db = null;

	type = parsedData[0];

	if (type == "sqlite")
		db = await Database.load(type + ":" + parsedData[1]);
	else
		db = await Database.load(type + "://" + parsedData[2] + ":" + parsedData[3] + "@" + parsedData[1] + "/" + parsedData[4]);

	return db;
}

export function typeDB() {
	return type
}

export async function dbTableHeaders(db, tableName) {
	let command = "";
	if (type == "sqlite")
		command = "PRAGMA table_info(" + tableName + ");";
	else
		command = "SELECT column_name FROM information_schema.columns WHERE table_name = '" + tableName + "';";

	return await db.select(command);
}

export function setupValuesList(amount) {
	let select = "(";

	for (let i = 0; i < amount; i++) {
		if (type == "mysql")
			select += "?, ";
		else
			select += "$1, ";
	}

	select = select.slice(0, -2);
	select += ")";

	return select;
}