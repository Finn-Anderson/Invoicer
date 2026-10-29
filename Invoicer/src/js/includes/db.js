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