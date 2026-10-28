const { exists, readFile, BaseDirectory } = window.__TAURI__.fs;
const Database = window.__TAURI__.sql;

let type = "mysql";

export async function loadDB() {
	let filename = "dbdata";
	if (!await exists(filename, { baseDir: BaseDirectory.AppLocalData })) {
		window.location.href = "../settings.html";

		return;
	}

	const data = await readFile(filename, { baseDir: BaseDirectory.AppLocalData });

	let decodedData = new TextDecoder().decode(data);
	let parsedData = decodedData.split(",");
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