const { exists, readFile, create, open, BaseDirectory } = window.__TAURI__.fs;

export const dbdata = "dbdata", display = "display";

async function checkDirectory() {
	if (await exists("", { baseDir: BaseDirectory.AppData }))
		return;

	await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
}

export async function read(filename) {
	await checkDirectory();

	let data = await readFile(filename, { baseDir: BaseDirectory.AppData });

	let decodedData = new TextDecoder().decode(data);

	if (decodedData == "")
		return [];
	else if (decodedData[0] == "[" && decodedData[decodedData.length - 1] == "]")
		return JSON.parse(decodedData);
	else
		return decodedData.split(",");
}

export async function fileExists(filename, bCreate = false, location = "") {
	await checkDirectory();

	const status = await exists(filename, { baseDir: BaseDirectory.AppData });

	if (!status) {
		if (bCreate)
			await create(filename, { baseDir: BaseDirectory.AppData });

		if (location)
			window.location.href = location;
	}

	return status;
}

export async function updateFile(filename, data) {
	await checkDirectory();

	try {
		const status = await fileExists(filename);
		let file = null;

		if (!status)
			file = await create(filename, { baseDir: BaseDirectory.AppData });
		else
			file = await open(filename, { write: true, truncate: true, baseDir: BaseDirectory.AppData });

		if (Array.isArray(data))
			data = JSON.stringify(data);

		await file.write(new TextEncoder().encode(data));
		await file.close();
		
		return true;
	} catch(error) {
		return false;
	}
}